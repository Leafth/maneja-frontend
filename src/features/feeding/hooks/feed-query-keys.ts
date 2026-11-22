export const feedQueryKeys = {
  all: ['feeds'] as const,

  lists: () => [...feedQueryKeys.all, 'list'] as const,

  list: (accountId: string) => [...feedQueryKeys.lists(), accountId] as const,

  details: () => [...feedQueryKeys.all, 'detail'] as const,

  detail: (accountId: string, localId: string) =>
    [...feedQueryKeys.details(), accountId, localId] as const,

  movements: (accountId: string, feedLocalId: string) =>
    [...feedQueryKeys.all, 'movements', accountId, feedLocalId] as const,

  syncStates: () => [...feedQueryKeys.all, 'sync'] as const,

  sync: (accountId: string, feedLocalId: string) =>
    [...feedQueryKeys.syncStates(), accountId, feedLocalId] as const,
};
