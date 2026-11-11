import { randomUUID } from 'expo-crypto';
import { getDatabase } from '@/infrastructure/database/database';
import { feedRequirementLocalDataSource as local } from '../data/local/feed-requirement-local-data-source';
import { validateFeedingParents, validateScaledQuantity, type FeedingExecutor } from '../data/local/feeding-storage';
import type { FeedRequirement } from '../models/feed-requirement.model';
import type { FeedRequirementDto } from '../dtos/feed-requirement.dto';
import { feedRequirementMapper } from '../mappers/feed-requirement.mapper';

interface SaveRequirement { accountId: string; groupLocalId: string; feedLocalId: string; quantityPerAnimalScaled: number }

class FeedRequirementRepository {
  findByGroupLocalId(accountId: string, groupLocalId: string, includeDeleted = false) {
    return local.list(accountId, `AND group_local_id = ? ${includeDeleted ? '' : 'AND locally_deleted_at IS NULL'} ORDER BY local_created_at`, [groupLocalId]);
  }
  findByLocalId = local.find;
  findPending(accountId: string) { return local.list(accountId, 'AND sync_status != \'synced\' ORDER BY local_created_at'); }
  async createLocal(input: SaveRequirement) {
    validateScaledQuantity(input.quantityPerAnimalScaled);
    const db = await getDatabase();
    const now = new Date().toISOString();
    const record: FeedRequirement = { ...input, localId: randomUUID(), remoteId: null,
      syncStatus: 'pending_create', dispatchState: 'idle', locallyDeletedAt: null,
      localCreatedAt: now, localUpdatedAt: now, remoteCreatedAt: null, remoteUpdatedAt: null,
      lastSyncedAt: null, lastSyncError: null, lastSyncHttpStatus: null };
    await db.withExclusiveTransactionAsync(async tx => {
      await validateFeedingParents(tx, input.accountId, input.groupLocalId, input.feedLocalId);
      await this.assertUnique(input, tx);
      await local.insert(record, tx);
    });
    return record;
  }
  private async assertUnique(input: SaveRequirement, tx: FeedingExecutor, localId = '') {
    const duplicates = await local.list(input.accountId, 'AND group_local_id = ? AND feed_local_id = ? AND local_id != ?', [input.groupLocalId, input.feedLocalId, localId], tx);
    if (duplicates.length) {throw new Error('Esta ração já possui uma necessidade ou exclusão pendente neste grupo.');}
  }
  async updateLocal(accountId: string, localId: string, input: Pick<SaveRequirement, 'feedLocalId' | 'quantityPerAnimalScaled'>) {
    validateScaledQuantity(input.quantityPerAnimalScaled);
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(accountId, localId, tx);
      if (!current || current.locallyDeletedAt) {throw new Error('Necessidade não encontrada.');}
      this.assertEditable(current);
      await validateFeedingParents(tx, accountId, current.groupLocalId, input.feedLocalId);
      await this.assertUnique({ ...current, ...input }, tx, localId);
      await local.update({ ...current, ...input, syncStatus: current.remoteId ? 'pending_update' : 'pending_create',
        dispatchState: 'idle', lastSyncError: null, lastSyncHttpStatus: null, localUpdatedAt: new Date().toISOString() }, tx);
    });
  }
  private assertEditable(record: FeedRequirement) {
    if (['sending', 'uncertain', 'conflict'].includes(record.dispatchState)) {throw new Error('Aguarde a confirmação da sincronização antes de alterar esta necessidade.');}
  }
  async markPendingDelete(accountId: string, localId: string) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(accountId, localId, tx);
      if (!current) {return;}
      this.assertEditable(current);
      if (!current.remoteId) { await local.remove(accountId, localId, tx); return; }
      const now = new Date().toISOString();
      await local.update({ ...current, syncStatus: 'pending_delete', dispatchState: 'idle', locallyDeletedAt: now, localUpdatedAt: now }, tx);
    });
  }
  cancelLocalCreate(accountId: string, localId: string) { return this.markPendingDelete(accountId, localId); }
  async markState(accountId: string, localId: string, dispatchState: FeedRequirement['dispatchState'], message: string | null = null, status: number | null = null) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(accountId, localId, tx);
      if (current) {await local.update({ ...current, dispatchState, lastSyncError: message, lastSyncHttpStatus: status }, tx);}
    });
  }
  async markSending(expected: FeedRequirement): Promise<boolean> {
    const db = await getDatabase();
    let claimed = false;
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(expected.accountId, expected.localId, tx);
      if (!current || current.localUpdatedAt !== expected.localUpdatedAt || current.dispatchState !== 'idle' ||
        current.syncStatus !== expected.syncStatus || current.feedLocalId !== expected.feedLocalId ||
        current.quantityPerAnimalScaled !== expected.quantityPerAnimalScaled) {return;}
      await local.update({ ...current, dispatchState: 'sending' }, tx); claimed = true;
    });
    return claimed;
  }
  markRejected(accountId: string, id: string, message: string, status: number | null) { return this.markState(accountId, id, 'rejected', message, status); }
  markUncertain(accountId: string, id: string, message: string) { return this.markState(accountId, id, 'uncertain', message); }
  async markSynced(record: FeedRequirement, dto: FeedRequirementDto) {
    await local.update({ ...record, remoteId: dto.id, syncStatus: 'synced', dispatchState: 'idle',
      remoteCreatedAt: dto.created_at, remoteUpdatedAt: dto.updated_at, lastSyncedAt: new Date().toISOString(), lastSyncError: null, lastSyncHttpStatus: null });
  }
  confirmDelete = local.remove;
  async upsertFromRemote(accountId: string, groupLocalId: string, feedLocalId: string, dto: FeedRequirementDto, tx: FeedingExecutor) {
    const records = await local.list(accountId, 'AND group_local_id = ?', [groupLocalId], tx);
    const current = records.find(r => r.remoteId === dto.id);
    if (current && current.syncStatus !== 'synced') {return;}
    const duplicate = records.find(r => r.feedLocalId === feedLocalId && r.localId !== current?.localId && !r.locallyDeletedAt);
    if (duplicate) {
      await local.update({ ...duplicate, dispatchState: 'conflict', lastSyncError: 'Existe uma necessidade remota para esta ração. A alteração local foi preservada.' }, tx);
      return;
    }
    const mapped = feedRequirementMapper.fromDto(dto, { accountId, groupLocalId, feedLocalId, localId: current?.localId ?? randomUUID(), now: new Date().toISOString() });
    if (current) {await local.update({ ...mapped, localCreatedAt: current.localCreatedAt }, tx);}
    else {await local.insert(mapped, tx);}
  }
  async reconcileRemoteList(accountId: string, groupLocalId: string, items: FeedRequirementDto[]) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      for (const dto of items) {
        const feed = await tx.getFirstAsync<{ local_id: string }>('SELECT local_id FROM feeds WHERE account_id = ? AND remote_id = ?', [accountId, dto.feed_id]);
        if (!feed) {throw new Error('Ração remota ainda não disponível localmente.');}
        await this.upsertFromRemote(accountId, groupLocalId, feed.local_id, dto, tx);
      }
      const records = await local.list(accountId, 'AND group_local_id = ?', [groupLocalId], tx);
      for (const current of records) {
        if (current.syncStatus === 'synced' && current.dispatchState === 'idle' && !items.some(dto => dto.id === current.remoteId)) {await local.remove(accountId, current.localId, tx);}
      }
    });
  }
}
export const feedRequirementRepository = new FeedRequirementRepository();
