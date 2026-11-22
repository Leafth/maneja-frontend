export interface Occupation {
  localId: string;
  remoteId: string | null;
  accountId: string;

  groupLocalId: string | null;
  groupRemoteId: string | null;
  groupName: string;

  terrainLocalId: string | null;
  terrainRemoteId: string | null;
  terrainName: string;

  startedAt: string;
  endedAt: string | null;

  movementCommandLocalId: string | null;
  source: 'local' | 'remote';
}
