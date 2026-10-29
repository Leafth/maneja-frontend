export interface TerrainGroupRef {
  remoteId: string;
  name: string;
}

export interface FinishedTerrainOccupation {
  remoteId: string;
  startedAt: string;
  endedAt: string;
}

export type TerrainStateDetails =
  | {
      status: 'available';
      daysFree: number;
      lastGroup: TerrainGroupRef | null;
      lastOccupation: FinishedTerrainOccupation | null;
    }
  | {
      status: 'occupied';
      currentGroup: TerrainGroupRef | null;
      enteredAt: string | null;
    }
  | {
      status: 'resting';
      remainingRestDays: number;
      lastGroup: TerrainGroupRef | null;
      lastOccupation: FinishedTerrainOccupation | null;
    };

export interface TerrainOccupation {
  remoteId: string;
  startedAt: string;
  endedAt: string | null;
  group: TerrainGroupRef;
}
