import type { SyncStatus } from '@/shared/models';

export interface AnimalGroup {
  localId: string;
  remoteId: string | null;

  name: string;
  animalCount: number;

  currentTerrainLocalId: string | null;
  currentTerrainRemoteId: string | null;
  currentTerrainName: string | null;

  syncStatus: SyncStatus;

  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;

  localCreatedAt: string;
  localUpdatedAt: string;

  lastSyncedAt: string | null;
  lastSyncError: string | null;
}
