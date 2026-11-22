import type { AnimalGroupHistoryKind } from '../models';

export const animalGroupQueryKeys = {
  all: ['animal-groups'] as const,

  lists: (accountId: string) =>
    [...animalGroupQueryKeys.all, accountId, 'list'] as const,

  list: (accountId: string) =>
    [...animalGroupQueryKeys.lists(accountId)] as const,

  details: (accountId: string) =>
    [...animalGroupQueryKeys.all, accountId, 'detail'] as const,

  detail: (accountId: string, localId: string) =>
    [...animalGroupQueryKeys.details(accountId), localId] as const,

  currentTerrains: (accountId: string, localIds: string[]) =>
    [
      ...animalGroupQueryKeys.all,
      accountId,
      'current-terrains',
      localIds,
    ] as const,

  occupations: (accountId: string, localId: string) =>
    [...animalGroupQueryKeys.all, accountId, 'occupations', localId] as const,

  history: (accountId: string, localId: string, kind: AnimalGroupHistoryKind) =>
    [...animalGroupQueryKeys.all, accountId, 'history', localId, kind] as const,
};
