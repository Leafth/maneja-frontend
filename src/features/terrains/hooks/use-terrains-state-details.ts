import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/stores/auth.store';

import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

import type { TerrainStateDetails } from '../models';

import { terrainRepository } from '../repositories/terrain.repository';

import { buildLocalTerrainStateDetails } from '../utils/build-local-terrain-state-details';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainsStateDetails() {
  const accountId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: terrainQueryKeys.stateList(accountId ?? ''),

    queryFn: async (): Promise<Record<string, TerrainStateDetails>> => {
      if (!accountId) {
        return {};
      }

      const [terrains, occupations] = await Promise.all([
        terrainRepository.findAll(accountId),

        occupationRepository.findAll(),
      ]);

      const accountOccupations = occupations.filter(
        (occupation) => occupation.accountId === accountId,
      );

      return Object.fromEntries(
        terrains.map((terrain) => {
          const terrainOccupations = accountOccupations.filter(
            (occupation) => occupation.terrainLocalId === terrain.localId,
          );

          return [
            terrain.localId,

            buildLocalTerrainStateDetails(terrain, terrainOccupations),
          ];
        }),
      );
    },

    enabled: Boolean(accountId),

    networkMode: 'always',
  });
}
