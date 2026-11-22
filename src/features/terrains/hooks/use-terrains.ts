import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrains() {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: terrainQueryKeys.lists(accountId ?? ''),

    queryFn: () => terrainRepository.findAll(accountId!),

    enabled: Boolean(accountId),

    networkMode: 'always',
  });
}
