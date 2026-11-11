import { isAxiosError } from 'axios';
import { feedingRepository as repository } from '../repositories/feeding.repository';
import { feedingGroupRepository } from '../repositories/feeding-group.repository';
import type { FeedingRecord } from '../models/feeding-record.model';
import { scaledToNumber } from '../utils/feed-decimal';
import { feedingService } from './feeding.service';
import { assertFeedingAccount } from './feeding-sync-context';

export const feedingSyncService = {
  async push(record: FeedingRecord, feedRemoteId: string): Promise<boolean> {
    const group = (await feedingGroupRepository.list(record.accountId)).find(g => g.localId === record.groupLocalId);
    if (!group?.remoteId) {return false;}
    assertFeedingAccount(record.accountId);
    if (!await repository.markSending(record.accountId, record.localId)) {return false;}
    let dto;
    try {
      dto = await feedingService.create(group.remoteId, { feeding: {
        feed_id: feedRemoteId, quantity: scaledToNumber(record.quantityScaled), occurred_at: record.occurredAt,
      } });
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const message = error instanceof Error ? error.message : 'Falha ao enviar alimentação.';
      if (status === 401) {
        await repository.markState(record.accountId, record.localId, 'queued', message, status);
        throw error;
      }
      await repository.markState(record.accountId, record.localId,
        status && [400, 404, 422].includes(status) ? 'rejected' : 'uncertain', message, status ?? null);
      return false;
    }
    // A storage failure after 201 must never trigger another POST.
    // The persisted sending state will become uncertain after restart.
    await repository.markConfirmed(record.accountId, record.localId, dto);
    return true;
  },
  async pull(accountId: string) {
    for (const group of await feedingGroupRepository.list(accountId)) {
      if (!group.remoteId) {continue;}
      let page = 1;
      while (true) {
        assertFeedingAccount(accountId);
        const response = await feedingService.list(group.remoteId, page, 100);
        if (response.group_id !== group.remoteId || response.meta.page !== page ||
          !Number.isSafeInteger(response.meta.total_pages) || response.meta.total_pages < 0) {
          throw new Error('Paginação inválida no histórico de alimentação.');
        }
        await repository.importRemote(accountId, group.localId, response.data);
        if (page >= response.meta.total_pages) {break;}
        page++;
      }
    }
  },
};
