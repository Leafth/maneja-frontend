import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

import type { TerrainOccupation } from '../models';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainOccupations(localId: string | undefined) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: terrainQueryKeys.occupations(accountId ?? '', localId ?? ''),

    queryFn: async (): Promise<TerrainOccupation[]> => {
      if (!accountId || !localId) {
        return [];
      }

      const occupations =
        await occupationRepository.findByTerrainLocalId(localId);

      return occupations
        .filter((occupation) => occupation.accountId === accountId)
        .map(occupationRepository.toTerrainOccupation);
    },

    enabled: Boolean(accountId && localId),
  });
}
