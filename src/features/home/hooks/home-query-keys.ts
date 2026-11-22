export const homeQueryKeys = {
  all: ['home'] as const,

  overview: (accountId: string) =>
    [...homeQueryKeys.all, 'overview', accountId] as const,
};
