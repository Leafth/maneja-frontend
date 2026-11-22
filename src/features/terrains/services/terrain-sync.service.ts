import axios from 'axios';

import type { Terrain } from '../models/terrain.model';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainService } from './terrain.service';

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.errors?.base?.[0] ??
      error.message ??
      'Erro ao sincronizar terreno.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro ao sincronizar terreno.';
}

async function syncCreate(accountId: string, terrain: Terrain): Promise<void> {
  const remoteTerrain = await terrainService.create({
    name: terrain.name,
    restDays: terrain.restDays,
  });

  await terrainRepository.markAsSynced(
    accountId,
    terrain.localId,
    remoteTerrain,
  );
}

async function syncUpdate(accountId: string, terrain: Terrain): Promise<void> {
  if (!terrain.remoteId) {
    throw new Error('Terreno pendente de atualização não possui remoteId.');
  }

  const remoteTerrain = await terrainService.update(terrain.remoteId, {
    name: terrain.name,
    restDays: terrain.restDays,
  });

  await terrainRepository.markAsSynced(
    accountId,
    terrain.localId,
    remoteTerrain,
  );
}

async function syncDelete(accountId: string, terrain: Terrain): Promise<void> {
  if (!terrain.remoteId) {
    await terrainRepository.deleteLocal(accountId, terrain.localId);

    return;
  }

  try {
    await terrainService.remove(terrain.remoteId);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 404) {
        await terrainRepository.deleteLocal(accountId, terrain.localId);

        return;
      }

      if (status === 422) {
        await terrainRepository.cancelPendingDelete(
          accountId,
          terrain.localId,
          getErrorMessage(error),
        );

        return;
      }
    }

    throw error;
  }

  await terrainRepository.deleteLocal(accountId, terrain.localId);
}

async function push(accountId: string): Promise<void> {
  const pendingTerrains = await terrainRepository.findPending(accountId);

  for (const terrain of pendingTerrains) {
    try {
      switch (terrain.syncStatus) {
        case 'pending_create':
          await syncCreate(accountId, terrain);
          break;

        case 'pending_update':
          await syncUpdate(accountId, terrain);
          break;

        case 'pending_delete':
          await syncDelete(accountId, terrain);
          break;
      }
    } catch (error) {
      await terrainRepository.setSyncError(
        accountId,
        terrain.localId,
        getErrorMessage(error),
      );
    }
  }
}

async function pull(accountId: string): Promise<void> {
  let page = 1;
  let totalPages = 1;

  do {
    const result = await terrainService.list({
      page,
      perPage: 100,
    });

    for (const remoteTerrain of result.data) {
      await terrainRepository.upsertFromRemote(accountId, remoteTerrain);
    }

    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);
}

async function sync(accountId: string): Promise<void> {
  await push(accountId);
  await pull(accountId);
}

export const terrainSyncService = {
  sync,
  push,
  pull,
};
