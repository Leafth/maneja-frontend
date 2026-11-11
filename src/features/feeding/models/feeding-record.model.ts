export interface FeedingRecord {
  localId: string;
  remoteId: string | null;
  accountId: string;
  groupLocalId: string;
  feedLocalId: string;
  quantityScaled: number;
  occurredAt: string;
  sequenceNumber: number;
  syncStatus: 'pending_create' | 'synced';
  dispatchState: 'queued' | 'sending' | 'uncertain' | 'rejected' | 'confirmed' | 'cancelled';
  balanceState: 'pending' | 'incorporated' | 'released';
  localCreatedAt: string;
  localUpdatedAt: string;
  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  lastSyncHttpStatus: number | null;
}
