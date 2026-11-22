import { randomUUID } from 'expo-crypto';
import { getDatabase } from '@/infrastructure/database/database';
import { feedingLocalDataSource as local } from '../data/local/feeding-local-data-source';
import { validateFeedingParents, validateScaledQuantity } from '../data/local/feeding-storage';
import { feedMovementLocalDataSource } from '../data/local/feed-movement-local-data-source';
import type { FeedingRecord } from '../models/feeding-record.model';
import type { FeedingDto } from '../dtos/feeding.dto';
import { feedingMapper } from '../mappers/feeding.mapper';

interface RegisterFeedingInput { accountId: string; groupLocalId: string; feedLocalId: string; quantityScaled: number; occurredAt: string }

class FeedingRepository {
  findByLocalId = local.find;
  findByGroupLocalId(accountId: string, groupLocalId: string) {
    return local.list(accountId, 'AND group_local_id = ? ORDER BY occurred_at DESC, COALESCE(remote_created_at, local_created_at) DESC', [groupLocalId]);
  }
  findByFeedLocalId(accountId: string, feedLocalId: string) { return local.list(accountId, 'AND feed_local_id = ? ORDER BY sequence_number', [feedLocalId]); }
  async createLocal(input: RegisterFeedingInput): Promise<FeedingRecord> {
    validateScaledQuantity(input.quantityScaled);
    if (!input.occurredAt || !Number.isFinite(Date.parse(input.occurredAt))) {throw new Error('Informe uma data e hora válidas.');}
    const db = await getDatabase();
    let created: FeedingRecord | undefined;
    await db.withExclusiveTransactionAsync(async tx => {
      const feed = await validateFeedingParents(tx, input.accountId, input.groupLocalId, input.feedLocalId);
      const uncertain = await tx.getFirstAsync<{ n: number }>('SELECT 1 AS n FROM feeding_records WHERE account_id = ? AND feed_local_id = ? AND dispatch_state IN (\'sending\',\'uncertain\') LIMIT 1', [input.accountId, input.feedLocalId]);
      if (uncertain) {throw new Error('Há uma alimentação sem confirmação nesta ração. Aguarde a conferência do saldo.');}
      if (input.quantityScaled > feed.projected_stock_scaled) {throw new Error('Estoque insuficiente para esta alimentação.');}
      const now = new Date().toISOString();
      created = { ...input, occurredAt: new Date(input.occurredAt).toISOString(), localId: randomUUID(), remoteId: null,
        sequenceNumber: await feedMovementLocalDataSource.getNextSequenceNumber(input.accountId, input.feedLocalId, tx),
        syncStatus: 'pending_create', dispatchState: 'queued', balanceState: 'pending',
        localCreatedAt: now, localUpdatedAt: now, remoteCreatedAt: null, remoteUpdatedAt: null,
        lastSyncedAt: null, lastSyncError: null, lastSyncHttpStatus: null };
      await local.insert(created, tx);
      await tx.runAsync('UPDATE feeds SET projected_stock_scaled = projected_stock_scaled - ?, local_updated_at = ? WHERE account_id = ? AND local_id = ?', [input.quantityScaled, now, input.accountId, input.feedLocalId]);
    });
    if (!created) {throw new Error('Não foi possível registrar alimentação.');}
    return created;
  }
  async recoverInterrupted(accountId: string) {
    const db = await getDatabase();
    await db.runAsync('UPDATE feeding_records SET dispatch_state = \'uncertain\', last_sync_error = \'Envio interrompido. Não será reenviado automaticamente.\' WHERE account_id = ? AND dispatch_state = \'sending\'', [accountId]);
  }
  async markSending(accountId: string, localId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync('UPDATE feeding_records SET dispatch_state = \'sending\' WHERE account_id = ? AND local_id = ? AND dispatch_state = \'queued\'', [accountId, localId]);
    return result.changes === 1;
  }
  async markState(accountId: string, localId: string, state: 'queued' | 'uncertain' | 'rejected', message: string, status: number | null = null) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(accountId, localId, tx);
      if (!current || current.dispatchState === 'confirmed') {return;}
      const release = state === 'rejected' && current.balanceState === 'pending';
      await local.update({ ...current, dispatchState: state, balanceState: release ? 'released' : current.balanceState,
        lastSyncError: message, lastSyncHttpStatus: status, localUpdatedAt: new Date().toISOString() }, tx);
      if (release) {await tx.runAsync('UPDATE feeds SET projected_stock_scaled = projected_stock_scaled + ? WHERE account_id = ? AND local_id = ?', [current.quantityScaled, accountId, current.feedLocalId]);}
    });
  }
  async markConfirmed(accountId: string, localId: string, dto: FeedingDto) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      const current = await local.find(accountId, localId, tx);
      if (!current) {throw new Error('Alimentação local não encontrada.');}
      await local.update({ ...current, remoteId: dto.id, syncStatus: 'synced', dispatchState: 'confirmed',
        remoteCreatedAt: dto.created_at, remoteUpdatedAt: dto.updated_at,
        lastSyncedAt: new Date().toISOString(), lastSyncError: null, lastSyncHttpStatus: 201 }, tx);
    });
  }
  async importRemote(accountId: string, groupLocalId: string, items: FeedingDto[]) {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async tx => {
      for (const dto of items) {
        // Identity is the only valid deduplication key. Equal payloads may be distinct feedings.
        const existing = await local.list(accountId, 'AND remote_id = ?', [dto.id], tx);
        if (existing.length) {continue;}
        const feed = await tx.getFirstAsync<{ local_id: string }>('SELECT local_id FROM feeds WHERE account_id = ? AND remote_id = ?', [accountId, dto.feed_id]);
        if (!feed) {throw new Error('Ração do histórico ainda não disponível localmente.');}
        await local.insert(feedingMapper.fromDto(dto, { accountId, groupLocalId, feedLocalId: feed.local_id,
          localId: randomUUID(), now: new Date().toISOString(), sequenceNumber: 0 }), tx);
      }
    });
  }
}
export const feedingRepository = new FeedingRepository();
