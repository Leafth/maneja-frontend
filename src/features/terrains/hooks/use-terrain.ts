import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrain(localId: string | undefined) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: terrainQueryKeys.detail(accountId ?? '', localId ?? ''),

    queryFn: async () => {
      if (!accountId || !localId) {
        return null;
      }

      return terrainRepository.findByLocalId(accountId, localId);
    },

    enabled: Boolean(accountId && localId),

    networkMode: 'always',
  });
}
