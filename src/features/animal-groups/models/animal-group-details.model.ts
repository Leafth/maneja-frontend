export interface AnimalGroupTerrainRef {
  remoteId: string;
  name: string;
}

export interface AnimalGroupOccupation {
  remoteId: string;
  startedAt: string;
  endedAt: string | null;
  terrain: AnimalGroupTerrainRef;
}

export type AnimalGroupHistoryKind = 'movements' | 'feeding';
