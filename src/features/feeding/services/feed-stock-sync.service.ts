import { feedRepository } from '../repositories/feed.repository';
import { feedMovementRepository } from '../repositories/feed-movement.repository';
import { feedingRepository } from '../repositories/feeding.repository';
import { feedMovementSyncService } from './feed-movement-sync.service';
import { feedingSyncService } from './feeding-sync.service';
import { assertFeedingAccount } from './feeding-sync-context';

/** One ordered queue per feed, sharing the existing movement sender/reconciler. */
export const feedStockSyncService = {
  async sync(accountId: string) {
    await feedingRepository.recoverInterrupted(accountId);
    for (const feed of await feedRepository.findAll(accountId)) {
      if (!feed.remoteId || feed.locallyDeletedAt) {continue;}
      const movements = await feedMovementRepository.findByFeedLocalId(accountId, feed.localId);
      const feedings = await feedingRepository.findByFeedLocalId(accountId, feed.localId);
      const operations = [
        ...movements.map(record => ({ kind: 'movement' as const, record })),
        ...feedings.map(record => ({ kind: 'feeding' as const, record })),
      ].sort((a, b) => a.record.sequenceNumber - b.record.sequenceNumber);
      const ambiguous = operations.some(({ record }) => ['sending', 'uncertain'].includes(record.dispatchState));
      if (ambiguous) {
        for (const movement of movements) {if (movement.dispatchState === 'sending') {
          await feedMovementRepository.markUncertain(accountId, movement.localId, 'Envio anterior interrompido.');
        }}
        continue;
      }
      assertFeedingAccount(accountId);
      if (operations.some(({ record }) => record.dispatchState === 'confirmed' && record.balanceState === 'pending')) {
        if (!await feedMovementSyncService.reconcileFeed(accountId, feed.localId, feed.remoteId)) {continue;}
      }
      for (const operation of operations) {
        const record = operation.record;
        if (record.syncStatus === 'synced' || (operation.kind === 'feeding' && record.balanceState === 'released')) {continue;}
        if (record.dispatchState !== 'queued') {break;}
        assertFeedingAccount(accountId);
        if (operation.kind === 'movement') {
          if (!await feedMovementSyncService.pushMovement(feed.remoteId, operation.record)) {break;}
        } else {
          if (!await feedingSyncService.push(operation.record, feed.remoteId)) {break;}
          if (!await feedMovementSyncService.reconcileFeed(accountId, feed.localId, feed.remoteId)) {break;}
        }
      }
    }
  },
};
