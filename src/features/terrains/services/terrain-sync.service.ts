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

async function syncCreate(terrain: Terrain): Promise<void> {
  const remoteTerrain = await terrainService.create({
    name: terrain.name,
    restDays: terrain.restDays,
  });

  await terrainRepository.markAsSynced(terrain.localId, remoteTerrain);
}

async function syncUpdate(terrain: Terrain): Promise<void> {
  if (!terrain.remoteId) {
    throw new Error('Terreno pendente de atualização não possui remoteId.');
  }

  const remoteTerrain = await terrainService.update(terrain.remoteId, {
    name: terrain.name,
    restDays: terrain.restDays,
  });

  await terrainRepository.markAsSynced(terrain.localId, remoteTerrain);
}

async function syncDelete(terrain: Terrain): Promise<void> {
  if (!terrain.remoteId) {
    await terrainRepository.deleteLocal(terrain.localId);

    return;
  }

  try {
    await terrainService.remove(terrain.remoteId);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      await terrainRepository.deleteLocal(terrain.localId);

      return;
    }

    throw error;
  }

  await terrainRepository.deleteLocal(terrain.localId);
}

async function push(): Promise<void> {
  const pendingTerrains = await terrainRepository.findPending();

  for (const terrain of pendingTerrains) {
    try {
      switch (terrain.syncStatus) {
        case 'pending_create':
          await syncCreate(terrain);
          break;

        case 'pending_update':
          await syncUpdate(terrain);
          break;

        case 'pending_delete':
          await syncDelete(terrain);
          break;
      }
    } catch (error) {
      await terrainRepository.setSyncError(
        terrain.localId,
        getErrorMessage(error),
      );
    }
  }
}

async function pull(): Promise<void> {
  let page = 1;
  let totalPages = 1;

  do {
    const result = await terrainService.list({
      page,
      perPage: 100,
    });

    for (const remoteTerrain of result.data) {
      await terrainRepository.upsertFromRemote(remoteTerrain);
    }

    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);
}

async function sync(): Promise<void> {
  await push();
  await pull();
}

export const terrainSyncService = {
  sync,
  push,
  pull,
};
