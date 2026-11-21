export interface TerrainGroupRef {
  localId: string | null;
  remoteId: string | null;
  name: string;
}

export interface FinishedTerrainOccupation {
  localId: string;
  remoteId: string | null;
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
  localId: string;
  remoteId: string | null;
  startedAt: string;
  endedAt: string | null;
  group: TerrainGroupRef;
}
