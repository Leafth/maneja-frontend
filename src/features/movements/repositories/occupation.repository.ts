import type {
  AnimalGroup,
  AnimalGroupOccupation,
} from '@/features/animal-groups/models';
import type { Terrain, TerrainOccupation } from '@/features/terrains/models';

import { occupationLocalDataSource } from '../data/occupation-local-data-source';
import type { Occupation } from '../models';

async function findByGroupLocalId(localId: string): Promise<Occupation[]> {
  return occupationLocalDataSource.findByGroupLocalId(localId);
}

async function findByTerrainLocalId(localId: string): Promise<Occupation[]> {
  return occupationLocalDataSource.findByTerrainLocalId(localId);
}

async function findAll(): Promise<Occupation[]> {
  return occupationLocalDataSource.findAll();
}

async function upsertRemote(data: {
  accountId: string;
  group: AnimalGroup;
  terrain: Terrain | null;
  remoteId: string;
  startedAt: string;
  endedAt: string | null;
  terrainRemoteId: string;
  terrainName: string;
}): Promise<void> {
  const occupation: Occupation = {
    localId: data.remoteId,
    remoteId: data.remoteId,
    accountId: data.accountId,

    groupLocalId: data.group.localId,
    groupRemoteId: data.group.remoteId,
    groupName: data.group.name,

    terrainLocalId: data.terrain?.localId ?? null,
    terrainRemoteId: data.terrainRemoteId,
    terrainName: data.terrainName,

    startedAt: data.startedAt,
    endedAt: data.endedAt,

    movementCommandLocalId: null,
    source: 'remote',
  };

  await occupationLocalDataSource.upsertRemote(occupation);
}

async function markCommandConfirmed(
  movementCommandLocalId: string,
  data: { remoteId: string; startedAt: string },
): Promise<void> {
  await occupationLocalDataSource.markCommandConfirmed(
    movementCommandLocalId,
    data,
  );
}

async function deleteByMovementCommandLocalId(localId: string): Promise<void> {
  await occupationLocalDataSource.deleteByMovementCommandLocalId(localId);
}

function toAnimalGroupOccupation(
  occupation: Occupation,
): AnimalGroupOccupation {
  return {
    localId: occupation.localId,
    remoteId: occupation.remoteId,
    startedAt: occupation.startedAt,
    endedAt: occupation.endedAt,
    terrain: {
      localId: occupation.terrainLocalId,
      remoteId: occupation.terrainRemoteId,
      name: occupation.terrainName,
    },
  };
}

function toTerrainOccupation(occupation: Occupation): TerrainOccupation {
  return {
    localId: occupation.localId,
    remoteId: occupation.remoteId,
    startedAt: occupation.startedAt,
    endedAt: occupation.endedAt,
    group: {
      localId: occupation.groupLocalId,
      remoteId: occupation.groupRemoteId,
      name: occupation.groupName,
    },
  };
}

export const occupationRepository = {
  findAll,
  findByGroupLocalId,
  findByTerrainLocalId,
  upsertRemote,
  markCommandConfirmed,
  deleteByMovementCommandLocalId,
  toAnimalGroupOccupation,
  toTerrainOccupation,
};
