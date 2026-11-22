import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

import type { TerrainStateDetails } from '../models';

import { terrainRepository } from '../repositories/terrain.repository';

import { buildLocalTerrainStateDetails } from '../utils/build-local-terrain-state-details';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainStateDetails(localId: string | undefined) {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: terrainQueryKeys.state(accountId ?? '', localId ?? ''),

    queryFn: async (): Promise<TerrainStateDetails | null> => {
      if (!accountId || !localId) {
        return null;
      }

      const terrain = await terrainRepository.findByLocalId(accountId, localId);

      if (!terrain) {
        return null;
      }

      const occupations =
        await occupationRepository.findByTerrainLocalId(localId);

      const accountOccupations = occupations.filter(
        (occupation) => occupation.accountId === accountId,
      );

      return buildLocalTerrainStateDetails(terrain, accountOccupations);
    },

    enabled: Boolean(accountId && localId),
  });
}
