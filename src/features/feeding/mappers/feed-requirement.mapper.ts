import type { FeedRequirementDto } from '../dtos/feed-requirement.dto';
import type { FeedRequirement } from '../models/feed-requirement.model';
import { decimalStringToScaled } from '../utils/feed-decimal';

export const feedRequirementMapper = {
  fromDto(dto: FeedRequirementDto, context: {
    localId: string; accountId: string; groupLocalId: string; feedLocalId: string; now: string;
  }): FeedRequirement {
    return {
      localId: context.localId, accountId: context.accountId,
      groupLocalId: context.groupLocalId, feedLocalId: context.feedLocalId,
      remoteId: dto.id, quantityPerAnimalScaled: decimalStringToScaled(dto.quantity_per_animal_kg),
      syncStatus: 'synced', dispatchState: 'idle', locallyDeletedAt: null,
      localCreatedAt: context.now, localUpdatedAt: context.now,
      remoteCreatedAt: dto.created_at, remoteUpdatedAt: dto.updated_at,
      lastSyncedAt: context.now, lastSyncError: null, lastSyncHttpStatus: null,
    };
  },
};
