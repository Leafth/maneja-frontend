export const terrainQueryKeys = {
  all: ['terrains'] as const,

  lists: () => [...terrainQueryKeys.all, 'list'] as const,

  detail: (localId: string) =>
    [...terrainQueryKeys.all, 'detail', localId] as const,

  stateList: () => [...terrainQueryKeys.all, 'state-list'] as const,

  state: (localId: string) =>
    [...terrainQueryKeys.all, 'state', localId] as const,

  occupations: (localId: string) =>
    [...terrainQueryKeys.all, 'occupations', localId] as const,
};
