import { isAxiosError } from 'axios';
import { feedRequirementRepository as repository } from '../repositories/feed-requirement.repository';
import { feedingGroupRepository } from '../repositories/feeding-group.repository';
import { feedRepository } from '../repositories/feed.repository';
import type { FeedRequirement } from '../models/feed-requirement.model';
import { decimalStringToScaled, scaledToNumber } from '../utils/feed-decimal';
import { feedRequirementService as service } from './feed-requirement.service';
import { assertFeedingAccount } from './feeding-sync-context';

class FeedRequirementSyncService {
  async sync(accountId: string) {
    const groups = await feedingGroupRepository.list(accountId);
    for (const record of await repository.findPending(accountId)) {
      const group = groups.find(g => g.localId === record.groupLocalId);
      const feed = await feedRepository.findByLocalId(accountId, record.feedLocalId);
      if (!group?.remoteId || !feed?.remoteId) {continue;}
      assertFeedingAccount(accountId);
      if (record.dispatchState === 'sending' || record.dispatchState === 'uncertain') {
        await repository.markUncertain(accountId, record.localId, 'Conferindo o resultado do envio anterior.');
        await this.reconcileUncertain(record, group.remoteId, feed.remoteId);
        continue;
      }
      if (record.dispatchState !== 'idle') {continue;}
      if (!await repository.markSending(record)) {continue;}
      try {
        assertFeedingAccount(accountId);
        if (record.syncStatus === 'pending_delete' && record.remoteId) {
          await service.remove(group.remoteId, record.remoteId);
          await repository.confirmDelete(accountId, record.localId);
        } else {
          const body = { feed_requirement: { feed_id: feed.remoteId, quantity_per_animal_kg: scaledToNumber(record.quantityPerAnimalScaled) } };
          const dto = record.remoteId
            ? await service.update(group.remoteId, record.remoteId, body)
            : await service.create(group.remoteId, body);
          await repository.markSynced(record, dto);
        }
      } catch (error) {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const message = error instanceof Error ? error.message : 'Falha na sincronização da necessidade.';
        if (status === 401) {
          await repository.markState(accountId, record.localId, 'idle', message, status); throw error;
        }
        if (status === 404 && record.syncStatus === 'pending_delete') {
          await repository.confirmDelete(accountId, record.localId); continue;
        }
        if (status && [400, 404, 422].includes(status)) {
          await repository.markRejected(accountId, record.localId, message, status); continue;
        }
        await repository.markUncertain(accountId, record.localId, message);
        await this.reconcileUncertain(record, group.remoteId, feed.remoteId);
      }
    }
  }
  private async reconcileUncertain(record: FeedRequirement, groupRemoteId: string, feedRemoteId: string) {
    try {
      assertFeedingAccount(record.accountId);
      const response = await service.list(groupRemoteId);
      if (response.group_id !== groupRemoteId) {throw new Error('Grupo retornado não corresponde ao solicitado.');}
      const matches = response.feed_requirements.filter(dto => record.remoteId ? dto.id === record.remoteId : dto.feed_id === feedRemoteId);
      if (record.syncStatus === 'pending_delete' && !matches.length) {
        await repository.confirmDelete(record.accountId, record.localId); return;
      }
      if (record.syncStatus !== 'pending_delete' && matches.length === 1 && matches[0].feed_id === feedRemoteId && decimalStringToScaled(matches[0].quantity_per_animal_kg) === record.quantityPerAnimalScaled) {
        await repository.markSynced(record, matches[0]); return;
      }
      if (matches.length) {await repository.markState(record.accountId, record.localId, 'conflict', 'A necessidade remota diverge da alteração local. Nenhum reenvio foi realizado.');}
    } catch {
      // Failed verification is not evidence that the write failed. Keep uncertain.
    }
  }
  async pull(accountId: string) {
    for (const group of await feedingGroupRepository.list(accountId)) {
      if (!group.remoteId) {continue;}
      assertFeedingAccount(accountId);
      const response = await service.list(group.remoteId);
      if (response.group_id !== group.remoteId) {throw new Error('Grupo retornado não corresponde ao solicitado.');}
      await repository.reconcileRemoteList(accountId, group.localId, response.feed_requirements);
    }
  }
}
export const feedRequirementSyncService = new FeedRequirementSyncService();
