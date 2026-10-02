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

async function findAll(): Promise<AnimalGroup[]> {
  return animalGroupLocalDataSource.findAll();
}

async function findById(localId: string): Promise<AnimalGroup | null> {
  return animalGroupLocalDataSource.findByLocalId(localId);
}

async function create(data: CreateAnimalGroupData): Promise<AnimalGroup> {
  const now = new Date().toISOString();

  const group: AnimalGroup = {
    localId: Crypto.randomUUID(),
    remoteId: null,

    name: data.name,
    animalCount: data.animalCount,

    syncStatus: 'pending_create',

    remoteCreatedAt: null,
    remoteUpdatedAt: null,

    localCreatedAt: now,
    localUpdatedAt: now,

    lastSyncedAt: null,
    lastSyncError: null,
  };

  await animalGroupLocalDataSource.insert(group);

  return group;
}

async function update(
  localId: string,
  data: UpdateAnimalGroupData,
): Promise<AnimalGroup> {
  const currentGroup = await animalGroupLocalDataSource.findByLocalId(localId);

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

  await animalGroupLocalDataSource.update(localId, {
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

async function remove(localId: string): Promise<void> {
  const group = await animalGroupLocalDataSource.findByLocalId(localId);

  if (!group) {
    return;
  }

  if (group.remoteId === null) {
    await animalGroupLocalDataSource.deleteByLocalId(localId);

    return;
  }

  await animalGroupLocalDataSource.markPendingDelete(localId);
}

async function findPending(): Promise<AnimalGroup[]> {
  return animalGroupLocalDataSource.findPending();
}

async function findByRemoteId(remoteId: string): Promise<AnimalGroup | null> {
  return animalGroupLocalDataSource.findByRemoteId(remoteId);
}

async function markAsSynced(
  localId: string,
  data: {
    remoteId: string;
    name: string;
    animalCount: number;
    remoteCreatedAt: string;
    remoteUpdatedAt: string;
  },
): Promise<void> {
  await animalGroupLocalDataSource.markAsSynced(localId, data);
}

async function setSyncError(localId: string, message: string): Promise<void> {
  await animalGroupLocalDataSource.setSyncError(localId, message);
}

async function deleteLocal(localId: string): Promise<void> {
  await animalGroupLocalDataSource.deleteByLocalId(localId);
}

async function upsertFromRemote(remoteGroup: RemoteAnimalGroup): Promise<void> {
  const localGroup = await animalGroupLocalDataSource.findByRemoteId(
    remoteGroup.remoteId,
  );

  if (!localGroup) {
    const now = new Date().toISOString();

    const newLocalGroup: AnimalGroup = {
      localId: Crypto.randomUUID(),
      remoteId: remoteGroup.remoteId,

      name: remoteGroup.name,
      animalCount: remoteGroup.animalCount,

      syncStatus: 'synced',

      remoteCreatedAt: remoteGroup.remoteCreatedAt,
      remoteUpdatedAt: remoteGroup.remoteUpdatedAt,

      localCreatedAt: now,
      localUpdatedAt: now,

      lastSyncedAt: now,
      lastSyncError: null,
    };

    await animalGroupLocalDataSource.insert(newLocalGroup);

    return;
  }

  if (
    localGroup.syncStatus === 'pending_update' ||
    localGroup.syncStatus === 'pending_delete'
  ) {
    return;
  }

  await animalGroupLocalDataSource.markAsSynced(localGroup.localId, {
    remoteId: remoteGroup.remoteId,
    name: remoteGroup.name,
    animalCount: remoteGroup.animalCount,
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
