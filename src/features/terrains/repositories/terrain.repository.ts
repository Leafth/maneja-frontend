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

async function findAll(): Promise<Terrain[]> {
  return terrainLocalDataSource.findAll();
}

async function findByLocalId(localId: string): Promise<Terrain | null> {
  return terrainLocalDataSource.findByLocalId(localId);
}

async function create(data: CreateTerrainData): Promise<Terrain> {
  const now = new Date().toISOString();

  const terrain: Terrain = {
    localId: Crypto.randomUUID(),
    remoteId: null,

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
  localId: string,
  data: UpdateTerrainData,
): Promise<Terrain> {
  const terrain = await terrainLocalDataSource.findByLocalId(localId);

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

async function remove(localId: string): Promise<void> {
  const terrain = await terrainLocalDataSource.findByLocalId(localId);

  if (!terrain) {
    return;
  }

  if (terrain.remoteId === null) {
    await terrainLocalDataSource.deleteByLocalId(localId);
    return;
  }

  await terrainLocalDataSource.markPendingDelete(
    localId,
    new Date().toISOString(),
  );
}

async function findPending(): Promise<Terrain[]> {
  return terrainLocalDataSource.findPending();
}

async function setSyncError(localId: string, error: string): Promise<void> {
  await terrainLocalDataSource.setSyncError(localId, error);
}

async function markAsSynced(
  localId: string,
  remoteTerrain: RemoteTerrain,
): Promise<void> {
  await terrainLocalDataSource.markAsSynced(localId, {
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
  remoteTerrain: RemoteTerrain,
): Promise<Terrain> {
  const existing = await terrainLocalDataSource.findByRemoteId(
    remoteTerrain.remoteId,
  );

  const now = new Date().toISOString();

  if (!existing) {
    const terrain: Terrain = {
      localId: Crypto.randomUUID(),
      remoteId: remoteTerrain.remoteId,

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

async function deleteLocal(localId: string): Promise<void> {
  await terrainLocalDataSource.deleteByLocalId(localId);
}

export const terrainRepository = {
  findAll,
  findByLocalId,

  create,
  update,
  remove,

  findPending,

  setSyncError,
  markAsSynced,

  upsertFromRemote,

  deleteLocal,
};
