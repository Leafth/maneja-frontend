import type { FeedingDto } from '../dtos/feeding.dto';
import type { FeedingRecord } from '../models/feeding-record.model';
import { decimalStringToScaled } from '../utils/feed-decimal';

export const feedingMapper = {
  fromDto(dto: FeedingDto, context: {
    localId: string; accountId: string; groupLocalId: string; feedLocalId: string;
    now: string; sequenceNumber: number;
  }): FeedingRecord {
    return {
      localId: context.localId, accountId: context.accountId,
      groupLocalId: context.groupLocalId, feedLocalId: context.feedLocalId,
      sequenceNumber: context.sequenceNumber, remoteId: dto.id,
      quantityScaled: decimalStringToScaled(dto.quantity), occurredAt: dto.occurred_at,
      syncStatus: 'synced', dispatchState: 'confirmed', balanceState: 'incorporated',
      localCreatedAt: context.now, localUpdatedAt: context.now,
      remoteCreatedAt: dto.created_at, remoteUpdatedAt: dto.updated_at,
      lastSyncedAt: context.now, lastSyncError: null, lastSyncHttpStatus: null,
    };
  },
};
