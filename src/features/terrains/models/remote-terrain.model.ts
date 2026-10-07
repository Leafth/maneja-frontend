import type { TerrainStatus } from './terrain-status.model';

export interface RemoteTerrain {
  remoteId: string;

  name: string;
  restDays: number;
  status: TerrainStatus;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}
