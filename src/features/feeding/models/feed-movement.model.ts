export type FeedMovementType = 'entry' | 'exit';

export type FeedMovementSyncStatus = 'pending_create' | 'synced';

export type FeedMovementDispatchState =
  | 'queued'
  | 'sending'
  | 'uncertain'
  | 'rejected'
  | 'confirmed';

export type FeedMovementBalanceState = 'pending' | 'incorporated';

interface FeedMovementBase {
  localId: string;
  accountId: string;
  remoteId: string | null;

  feedLocalId: string;

  quantityScaled: number;
  occurredOn: string;

  sequenceNumber: number;

  syncStatus: FeedMovementSyncStatus;
  dispatchState: FeedMovementDispatchState;
  balanceState: FeedMovementBalanceState;

  localCreatedAt: string;
  localUpdatedAt: string;

  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;

  lastSyncedAt: string | null;
  lastSyncError: string | null;
}

export interface FeedEntry extends FeedMovementBase {
  movementType: 'entry';

  valueScaled: number;
  reason: null;
}

export interface FeedExit extends FeedMovementBase {
  movementType: 'exit';

  valueScaled: null;
  reason: string;
}

export type FeedMovement = FeedEntry | FeedExit;
