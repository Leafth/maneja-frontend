import * as Crypto from 'expo-crypto';

import { animalGroupLocalDataSource } from '../data-sources/animal-group.local-data-source';

import type { AnimalGroup, RemoteAnimalGroup } from '../models';

export interface CreateAnimalGroupData {
  name: string;
  animalCount: number;
}

export interface UpdateAnimalGroupData {
  name: string;
  animalCount: number;
}

async function findAll(accountId: string): Promise<AnimalGroup[]> {
  return animalGroupLocalDataSource.findAll(accountId);
}

async function findById(
  accountId: string,
  localId: string,
): Promise<AnimalGroup | null> {
  return animalGroupLocalDataSource.findByLocalId(accountId, localId);
}

async function create(
  accountId: string,
  data: CreateAnimalGroupData,
): Promise<AnimalGroup> {
  const now = new Date().toISOString();

  const group: AnimalGroup = {
    localId: Crypto.randomUUID(),
    accountId,

    remoteId: null,
    locallyDeletedAt: null,

    name: data.name,
    animalCount: data.animalCount,

    syncStatus: 'pending_create',

    remoteCreatedAt: null,
    remoteUpdatedAt: null,

    localCreatedAt: now,
    localUpdatedAt: now,

    lastSyncedAt: null,
    lastSyncError: null,

    currentTerrainLocalId: null,
    currentTerrainRemoteId: null,
    currentTerrainName: null,
  };

  await animalGroupLocalDataSource.insert(group);

  return group;
}

async function update(
  accountId: string,
  localId: string,
  data: UpdateAnimalGroupData,
): Promise<AnimalGroup> {
  const currentGroup = await animalGroupLocalDataSource.findByLocalId(
    accountId,
    localId,
  );

  if (!currentGroup) {
    throw new Error('Grupo de animais não encontrado.');
  }

  if (currentGroup.syncStatus === 'pending_delete') {
    throw new Error('Não é possível atualizar um grupo pendente de exclusão.');
  }

  const syncStatus =
    currentGroup.syncStatus === 'pending_create'
      ? 'pending_create'
      : 'pending_update';

  const localUpdatedAt = new Date().toISOString();

  await animalGroupLocalDataSource.update(accountId, localId, {
    name: data.name,
    animalCount: data.animalCount,
    syncStatus,
    localUpdatedAt,
  });

  return {
    ...currentGroup,

    name: data.name,
    animalCount: data.animalCount,

    syncStatus,
    localUpdatedAt,

    lastSyncError: null,
  };
}

async function remove(accountId: string, localId: string): Promise<void> {
  const group = await animalGroupLocalDataSource.findByLocalId(
    accountId,
    localId,
  );

  if (!group) {
    return;
  }

  await animalGroupLocalDataSource.markPendingDelete(accountId, localId);
}

async function findPending(accountId: string): Promise<AnimalGroup[]> {
  return animalGroupLocalDataSource.findPending(accountId);
}

async function findByRemoteId(
  accountId: string,
  remoteId: string,
): Promise<AnimalGroup | null> {
  return animalGroupLocalDataSource.findByRemoteId(accountId, remoteId);
}

async function markAsSynced(
  accountId: string,
  localId: string,
  data: {
    remoteId: string;
    name: string;
    animalCount: number;

    currentTerrainRemoteId: string | null;
    currentTerrainName: string | null;

    remoteCreatedAt: string;
    remoteUpdatedAt: string;
  },
): Promise<void> {
  await animalGroupLocalDataSource.markAsSynced(accountId, localId, data);
}

async function setSyncError(
  accountId: string,
  localId: string,
  message: string,
): Promise<void> {
  await animalGroupLocalDataSource.setSyncError(accountId, localId, message);
}

async function deleteLocal(accountId: string, localId: string): Promise<void> {
  await animalGroupLocalDataSource.deleteByLocalId(accountId, localId);
}

async function upsertFromRemote(
  accountId: string,
  remoteGroup: RemoteAnimalGroup,
): Promise<void> {
  const localGroup = await animalGroupLocalDataSource.findByRemoteId(
    accountId,
    remoteGroup.remoteId,
  );

  if (!localGroup) {
    const now = new Date().toISOString();

    const newLocalGroup: AnimalGroup = {
      localId: Crypto.randomUUID(),
      accountId,

      remoteId: remoteGroup.remoteId,
      locallyDeletedAt: null,

      name: remoteGroup.name,
      animalCount: remoteGroup.animalCount,

      syncStatus: 'synced',

      remoteCreatedAt: remoteGroup.remoteCreatedAt,

      remoteUpdatedAt: remoteGroup.remoteUpdatedAt,

      localCreatedAt: now,
      localUpdatedAt: now,

      lastSyncedAt: now,
      lastSyncError: null,

      currentTerrainLocalId: null,

      currentTerrainRemoteId: remoteGroup.currentTerrain?.remoteId ?? null,

      currentTerrainName: remoteGroup.currentTerrain?.name ?? null,
    };

    await animalGroupLocalDataSource.insert(newLocalGroup);

    return;
  }

  if (
    localGroup.locallyDeletedAt !== null ||
    localGroup.syncStatus === 'pending_update' ||
    localGroup.syncStatus === 'pending_delete'
  ) {
    return;
  }

  await animalGroupLocalDataSource.markAsSynced(accountId, localGroup.localId, {
    remoteId: remoteGroup.remoteId,

    name: remoteGroup.name,

    animalCount: remoteGroup.animalCount,

    currentTerrainRemoteId: remoteGroup.currentTerrain?.remoteId ?? null,

    currentTerrainName: remoteGroup.currentTerrain?.name ?? null,

    remoteCreatedAt: remoteGroup.remoteCreatedAt,

    remoteUpdatedAt: remoteGroup.remoteUpdatedAt,
  });
}

export const animalGroupRepository = {
  findAll,
  findById,
  findByRemoteId,
  findPending,

  create,
  update,
  remove,

  markAsSynced,
  setSyncError,
  deleteLocal,

  upsertFromRemote,
};
