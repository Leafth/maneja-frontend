export const animalGroupQueryKeys = {
  all: ['animal-groups'] as const,

  lists: () => [...animalGroupQueryKeys.all, 'list'] as const,

  list: () => [...animalGroupQueryKeys.lists()] as const,

  details: () => [...animalGroupQueryKeys.all, 'detail'] as const,

  detail: (localId: string) =>
    [...animalGroupQueryKeys.details(), localId] as const,
};
