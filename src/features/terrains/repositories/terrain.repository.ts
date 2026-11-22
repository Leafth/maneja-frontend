import * as Crypto from 'expo-crypto';

import { terrainLocalDataSource } from '../data-sources/terrain.local-data-source';

import type { RemoteTerrain } from '../models/remote-terrain.model';
import type { Terrain } from '../models/terrain.model';

interface CreateTerrainData {
  name: string;
  restDays: number;
}

interface UpdateTerrainData {
  name?: string;
  restDays?: number;
}

async function findAll(accountId: string): Promise<Terrain[]> {
  return terrainLocalDataSource.findAll(accountId);
}

async function findByLocalId(
  accountId: string,
  localId: string,
): Promise<Terrain | null> {
  return terrainLocalDataSource.findByLocalId(accountId, localId);
}

async function findByRemoteId(
  accountId: string,
  remoteId: string,
): Promise<Terrain | null> {
  return terrainLocalDataSource.findByRemoteId(accountId, remoteId);
}

async function create(
  accountId: string,
  data: CreateTerrainData,
): Promise<Terrain> {
  const now = new Date().toISOString();

  const terrain: Terrain = {
    localId: Crypto.randomUUID(),
    accountId,

    remoteId: null,
    locallyDeletedAt: null,

    name: data.name,
    restDays: data.restDays,

    status: 'available',

    syncStatus: 'pending_create',

    remoteCreatedAt: null,
    remoteUpdatedAt: null,

    localCreatedAt: now,
    localUpdatedAt: now,

    lastSyncedAt: null,
    lastSyncError: null,
  };

  await terrainLocalDataSource.insert(terrain);

  return terrain;
}

async function update(
  accountId: string,
  localId: string,
  data: UpdateTerrainData,
): Promise<Terrain> {
  const terrain = await terrainLocalDataSource.findByLocalId(
    accountId,
    localId,
  );

  if (!terrain) {
    throw new Error('Terreno não encontrado.');
  }

  if (terrain.syncStatus === 'pending_delete') {
    throw new Error('Não é possível editar um terreno pendente de exclusão.');
  }

  const updatedTerrain: Terrain = {
    ...terrain,

    name: data.name ?? terrain.name,

    restDays: data.restDays ?? terrain.restDays,

    syncStatus:
      terrain.syncStatus === 'pending_create'
        ? 'pending_create'
        : 'pending_update',

    localUpdatedAt: new Date().toISOString(),

    lastSyncError: null,
  };

  await terrainLocalDataSource.update(updatedTerrain);

  return updatedTerrain;
}

async function remove(accountId: string, localId: string): Promise<void> {
  const terrain = await terrainLocalDataSource.findByLocalId(
    accountId,
    localId,
  );

  if (!terrain) {
    return;
  }

  if (terrain.status === 'occupied') {
    throw new Error('Não é possível excluir um terreno que possui animais.');
  }

  await terrainLocalDataSource.markPendingDelete(
    accountId,
    localId,
    new Date().toISOString(),
  );
}

async function findPending(accountId: string): Promise<Terrain[]> {
  return terrainLocalDataSource.findPending(accountId);
}

async function setSyncError(
  accountId: string,
  localId: string,
  error: string,
): Promise<void> {
  await terrainLocalDataSource.setSyncError(accountId, localId, error);
}

async function markAsSynced(
  accountId: string,
  localId: string,
  remoteTerrain: RemoteTerrain,
): Promise<void> {
  await terrainLocalDataSource.markAsSynced(accountId, localId, {
    remoteId: remoteTerrain.remoteId,

    name: remoteTerrain.name,

    restDays: remoteTerrain.restDays,

    status: remoteTerrain.status,

    remoteCreatedAt: remoteTerrain.remoteCreatedAt,

    remoteUpdatedAt: remoteTerrain.remoteUpdatedAt,

    syncedAt: new Date().toISOString(),
  });
}

async function upsertFromRemote(
  accountId: string,
  remoteTerrain: RemoteTerrain,
): Promise<Terrain> {
  const existing = await terrainLocalDataSource.findByRemoteId(
    accountId,
    remoteTerrain.remoteId,
  );

  const now = new Date().toISOString();

  if (!existing) {
    const terrain: Terrain = {
      localId: Crypto.randomUUID(),

      accountId,

      remoteId: remoteTerrain.remoteId,

      locallyDeletedAt: null,

      name: remoteTerrain.name,

      restDays: remoteTerrain.restDays,

      status: remoteTerrain.status,

      syncStatus: 'synced',

      remoteCreatedAt: remoteTerrain.remoteCreatedAt,

      remoteUpdatedAt: remoteTerrain.remoteUpdatedAt,

      localCreatedAt: now,
      localUpdatedAt: now,

      lastSyncedAt: now,
      lastSyncError: null,
    };

    await terrainLocalDataSource.insert(terrain);

    return terrain;
  }

  if (existing.locallyDeletedAt !== null) {
    return existing;
  }

  if (
    existing.syncStatus === 'pending_update' ||
    existing.syncStatus === 'pending_delete'
  ) {
    const terrain: Terrain = {
      ...existing,

      status: remoteTerrain.status,

      remoteCreatedAt: remoteTerrain.remoteCreatedAt,

      remoteUpdatedAt: remoteTerrain.remoteUpdatedAt,

      lastSyncedAt: now,
    };

    await terrainLocalDataSource.update(terrain);

    return terrain;
  }

  const terrain: Terrain = {
    ...existing,

    remoteId: remoteTerrain.remoteId,

    name: remoteTerrain.name,

    restDays: remoteTerrain.restDays,

    status: remoteTerrain.status,

    syncStatus: 'synced',

    remoteCreatedAt: remoteTerrain.remoteCreatedAt,

    remoteUpdatedAt: remoteTerrain.remoteUpdatedAt,

    localUpdatedAt: now,

    lastSyncedAt: now,
    lastSyncError: null,
  };

  await terrainLocalDataSource.update(terrain);

  return terrain;
}

async function deleteLocal(accountId: string, localId: string): Promise<void> {
  await terrainLocalDataSource.deleteByLocalId(accountId, localId);
}

async function cancelPendingDelete(
  accountId: string,
  localId: string,
  error: string,
): Promise<void> {
  await terrainLocalDataSource.cancelPendingDelete(accountId, localId, error);
}

export const terrainRepository = {
  findAll,
  findByLocalId,
  findByRemoteId,

  create,
  update,
  remove,

  cancelPendingDelete,

  findPending,

  setSyncError,
  markAsSynced,

  upsertFromRemote,

  deleteLocal,
};
