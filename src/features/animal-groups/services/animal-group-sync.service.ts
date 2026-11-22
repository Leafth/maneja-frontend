import { isAxiosError } from 'axios';

import type { AnimalGroup } from '../models';

import { animalGroupRepository } from '../repositories/animal-group.repository';
import { animalGroupService } from './animal-group.service';

const SYNC_PAGE_SIZE = 100;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido durante a sincronização.';
}

function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

async function syncCreate(
  accountId: string,
  group: AnimalGroup,
): Promise<void> {
  const remoteGroup = await animalGroupService.create({
    name: group.name,
    animalCount: group.animalCount,
  });

  await animalGroupRepository.markAsSynced(accountId, group.localId, {
    remoteId: remoteGroup.remoteId,
    name: remoteGroup.name,
    animalCount: remoteGroup.animalCount,
    currentTerrainRemoteId: remoteGroup.currentTerrain?.remoteId ?? null,
    currentTerrainName: remoteGroup.currentTerrain?.name ?? null,
    remoteCreatedAt: remoteGroup.remoteCreatedAt,
    remoteUpdatedAt: remoteGroup.remoteUpdatedAt,
  });
}

async function syncUpdate(
  accountId: string,
  group: AnimalGroup,
): Promise<void> {
  if (!group.remoteId) {
    throw new Error('Grupo pendente de atualização não possui remoteId.');
  }

  const remoteGroup = await animalGroupService.update(group.remoteId, {
    name: group.name,
    animalCount: group.animalCount,
  });

  await animalGroupRepository.markAsSynced(accountId, group.localId, {
    remoteId: remoteGroup.remoteId,
    name: remoteGroup.name,
    animalCount: remoteGroup.animalCount,
    currentTerrainRemoteId: remoteGroup.currentTerrain?.remoteId ?? null,
    currentTerrainName: remoteGroup.currentTerrain?.name ?? null,
    remoteCreatedAt: remoteGroup.remoteCreatedAt,
    remoteUpdatedAt: remoteGroup.remoteUpdatedAt,
  });
}

async function syncDelete(
  accountId: string,
  group: AnimalGroup,
): Promise<void> {
  if (!group.remoteId) {
    await animalGroupRepository.deleteLocal(accountId, group.localId);

    return;
  }

  try {
    await animalGroupService.remove(group.remoteId);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
  }

  await animalGroupRepository.deleteLocal(accountId, group.localId);
}

async function pushGroup(accountId: string, group: AnimalGroup): Promise<void> {
  switch (group.syncStatus) {
    case 'pending_create':
      await syncCreate(accountId, group);
      return;

    case 'pending_update':
      await syncUpdate(accountId, group);
      return;

    case 'pending_delete':
      await syncDelete(accountId, group);
      return;

    case 'synced':
      return;
  }
}

async function pushPending(accountId: string): Promise<void> {
  const pendingGroups = await animalGroupRepository.findPending(accountId);

  for (const group of pendingGroups) {
    try {
      await pushGroup(accountId, group);
    } catch (error) {
      await animalGroupRepository.setSyncError(
        accountId,
        group.localId,
        getErrorMessage(error),
      );
    }
  }
}

async function pullRemote(accountId: string): Promise<void> {
  let page = 1;
  let totalPages = 1;

  do {
    const response = await animalGroupService.list({
      page,
      perPage: SYNC_PAGE_SIZE,
    });

    for (const remoteGroup of response.data) {
      await animalGroupRepository.upsertFromRemote(accountId, remoteGroup);
    }

    totalPages = response.meta.totalPages;
    page += 1;
  } while (page <= totalPages);
}

async function sync(accountId: string): Promise<void> {
  await pushPending(accountId);
  await pullRemote(accountId);
}

export const animalGroupSyncService = {
  sync,
  pushPending,
  pullRemote,
};
