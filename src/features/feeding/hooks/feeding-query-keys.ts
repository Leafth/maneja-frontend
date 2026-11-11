export const feedingQueryKeys = {
  requirements: (accountId: string, groupLocalId?: string) => groupLocalId
    ? ['feed-requirements', accountId, groupLocalId] as const : ['feed-requirements', accountId] as const,
  history: (accountId: string, groupLocalId?: string) => groupLocalId
    ? ['feedings', accountId, groupLocalId] as const : ['feedings', accountId] as const,
  groups: (accountId: string) => ['animal-groups', 'list', 'feeding', accountId] as const,
  planning: (accountId: string) => ['feed-planning', accountId] as const,
};
