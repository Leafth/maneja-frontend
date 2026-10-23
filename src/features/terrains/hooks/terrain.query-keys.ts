export const terrainQueryKeys = {
  all: ['terrains'] as const,

  lists: () => [...terrainQueryKeys.all, 'list'] as const,

  detail: (localId: string) =>
    [...terrainQueryKeys.all, 'detail', localId] as const,
};
