import type { FeedEntryDto, FeedExitDto } from '../dtos/feed-movement.dto';

import type { FeedEntry, FeedExit } from '../models/feed-movement.model';

import { decimalStringToScaled } from '../utils/feed-decimal';

interface MappingContext {
  localId: string;
  accountId: string;
  feedLocalId: string;
  sequenceNumber: number;
  now: string;
}

export const feedMovementMapper = {
  entryFromDto(dto: FeedEntryDto, context: MappingContext): FeedEntry {
    return {
      localId: context.localId,
      accountId: context.accountId,
      remoteId: dto.id,

      feedLocalId: context.feedLocalId,

      movementType: 'entry',

      quantityScaled: decimalStringToScaled(dto.quantity),
      valueScaled: decimalStringToScaled(dto.value),

      reason: null,

      occurredOn: dto.occurred_on,
      sequenceNumber: context.sequenceNumber,

      syncStatus: 'synced',
      dispatchState: 'confirmed',
      balanceState: 'incorporated',

      localCreatedAt: context.now,
      localUpdatedAt: context.now,

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,

      lastSyncedAt: context.now,
      lastSyncError: null,
    };
  },

  exitFromDto(dto: FeedExitDto, context: MappingContext): FeedExit {
    return {
      localId: context.localId,
      accountId: context.accountId,
      remoteId: dto.id,

      feedLocalId: context.feedLocalId,

      movementType: 'exit',

      quantityScaled: decimalStringToScaled(dto.quantity),

      valueScaled: null,
      reason: dto.reason,

      occurredOn: dto.occurred_on,
      sequenceNumber: context.sequenceNumber,

      syncStatus: 'synced',
      dispatchState: 'confirmed',
      balanceState: 'incorporated',

      localCreatedAt: context.now,
      localUpdatedAt: context.now,

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,

      lastSyncedAt: context.now,
      lastSyncError: null,
    };
  },
};
