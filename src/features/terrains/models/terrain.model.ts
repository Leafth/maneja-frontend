import type { SyncStatus } from '@/features/animal-groups/models';

import type { TerrainStatus } from './terrain-status.model';

export interface Terrain {
  localId: string;
  remoteId: string | null;

  name: string;
  restDays: number;
  status: TerrainStatus;

  syncStatus: SyncStatus;

  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;

  localCreatedAt: string;
  localUpdatedAt: string;

  lastSyncedAt: string | null;
  lastSyncError: string | null;
}
