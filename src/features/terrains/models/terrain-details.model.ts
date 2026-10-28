export interface TerrainGroupRef {
  remoteId: string;
  name: string;
}

export type TerrainStateDetails =
  | {
      status: 'available';
    }
  | {
      status: 'occupied';
      currentGroup: TerrainGroupRef;
      enteredAt: string;
    }
  | {
      status: 'resting';
      remainingRestDays: number;
      lastGroup: TerrainGroupRef;
      lastOccupation: {
        remoteId: string;
        startedAt: string;
        endedAt: string;
      };
    };

export interface TerrainOccupation {
  remoteId: string;
  startedAt: string;
  endedAt: string | null;
  group: TerrainGroupRef;
}
