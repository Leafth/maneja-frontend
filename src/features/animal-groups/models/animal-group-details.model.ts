export interface AnimalGroupTerrainRef {
  localId: string | null;
  remoteId: string | null;
  name: string;
}

export interface AnimalGroupOccupation {
  localId: string;
  remoteId: string | null;
  startedAt: string;
  endedAt: string | null;
  terrain: AnimalGroupTerrainRef;
}

export type AnimalGroupHistoryKind = 'movements' | 'feeding';
