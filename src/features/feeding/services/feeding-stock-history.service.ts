import { getDatabase } from '@/infrastructure/database/database';
import { randomUUID } from 'expo-crypto';
import { feedingLocalDataSource } from '../data/local/feeding-local-data-source';
import { feedMovementLocalDataSource as local } from '../data/local/feed-movement-local-data-source';
import { feedRepository } from '../repositories/feed.repository';
import { feedMovementMapper } from '../mappers/feed-movement.mapper';
import { feedMovementService } from './feed-movement.service';
import { assertFeedingAccount } from './feeding-sync-context';

/** Import server stock history by its own IDs; never infer a Feeding association. */
export const feedingStockHistoryService = {
  async pull(accountId: string) {
    const records = await feedingLocalDataSource.list(accountId);
    const feedIds = new Set(records.map(record => record.feedLocalId));
    for (const feedLocalId of feedIds) {
      const feed = await feedRepository.findByLocalId(accountId, feedLocalId);
      if (!feed?.remoteId || feed.locallyDeletedAt || feed.syncStatus === 'pending_delete') {continue;}
      let page = 1;
      while (true) {
        assertFeedingAccount(accountId);
        const response = await feedMovementService.list(feed.remoteId, { page, per_page: 100 });
        if (response.meta.page !== page || !Number.isSafeInteger(response.meta.total_pages) || response.meta.total_pages < 0) {throw new Error('Paginação inválida no histórico de estoque.');}
        const db = await getDatabase();
        await db.withExclusiveTransactionAsync(async tx => {
          for (const dto of response.data) {
            if (await local.findByRemoteId(accountId, dto.id, tx)) {continue;}
            const context = { accountId, feedLocalId, localId: randomUUID(), sequenceNumber: 0, now: new Date().toISOString() };
            const movement = dto.movement_type === 'entry'
              ? feedMovementMapper.entryFromDto({ ...dto, feed_id: feed.remoteId! }, context)
              : feedMovementMapper.exitFromDto({ ...dto, feed_id: feed.remoteId! }, context);
            await local.insert(movement, tx);
          }
        });
        if (page >= response.meta.total_pages) {break;}
        page++;
      }
    }
  },
};
