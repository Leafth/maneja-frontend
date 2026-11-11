export interface FeedRequirement {
  localId: string;
  remoteId: string | null;
  accountId: string;
  groupLocalId: string;
  feedLocalId: string;
  quantityPerAnimalScaled: number;
  syncStatus: 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';
  dispatchState: 'idle' | 'sending' | 'uncertain' | 'rejected' | 'conflict';
  locallyDeletedAt: string | null;
  localCreatedAt: string;
  localUpdatedAt: string;
  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastSyncHttpStatus: number | null;
}
