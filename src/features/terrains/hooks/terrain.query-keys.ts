export const terrainQueryKeys = {
  all: ['terrains'] as const,

  lists: (accountId: string) =>
    [...terrainQueryKeys.all, accountId, 'list'] as const,

  detail: (accountId: string, localId: string) =>
    [...terrainQueryKeys.all, accountId, 'detail', localId] as const,

  stateList: (accountId: string) =>
    [...terrainQueryKeys.all, accountId, 'state-list'] as const,

  state: (accountId: string, localId: string) =>
    [...terrainQueryKeys.all, accountId, 'state', localId] as const,

  occupations: (accountId: string, localId: string) =>
    [...terrainQueryKeys.all, accountId, 'occupations', localId] as const,
};
