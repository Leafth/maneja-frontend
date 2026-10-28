import type { AnimalGroupHistoryKind } from '../models';

export const animalGroupQueryKeys = {
  all: ['animal-groups'] as const,

  lists: () => [...animalGroupQueryKeys.all, 'list'] as const,

  list: () => [...animalGroupQueryKeys.lists()] as const,

  details: () => [...animalGroupQueryKeys.all, 'detail'] as const,

  detail: (localId: string) =>
    [...animalGroupQueryKeys.details(), localId] as const,

  currentTerrains: (localIds: string[]) =>
    [...animalGroupQueryKeys.all, 'current-terrains', localIds] as const,

  occupations: (localId: string) =>
    [...animalGroupQueryKeys.all, 'occupations', localId] as const,

  history: (localId: string, kind: AnimalGroupHistoryKind) =>
    [...animalGroupQueryKeys.all, 'history', localId, kind] as const,
};
