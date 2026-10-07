import type { SyncStatus } from './sync-status.model';

export interface AnimalGroup {
  localId: string;
  remoteId: string | null;

  name: string;
  animalCount: number;

  syncStatus: SyncStatus;

  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;

  localCreatedAt: string;
  localUpdatedAt: string;

  lastSyncedAt: string | null;
  lastSyncError: string | null;
}
