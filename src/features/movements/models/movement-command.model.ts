export type MovementCommandSyncStatus = 'pending_create' | 'synced';

export type MovementCommandDispatchState =
  | 'queued'
  | 'sending'
  | 'uncertain'
  | 'rejected'
  | 'confirmed';

export interface MovementCommand {
  localId: string;
  accountId: string;

  remoteId: string | null;

  groupLocalId: string;

  originTerrainLocalId: string | null;
  destinationTerrainLocalId: string;

  sequenceNumber: number;

  syncStatus: MovementCommandSyncStatus;
  dispatchState: MovementCommandDispatchState;

  localCreatedAt: string;
  localUpdatedAt: string;

  remoteStartedAt: string | null;

  lastSyncedAt: string | null;
  lastSyncError: string | null;
}
