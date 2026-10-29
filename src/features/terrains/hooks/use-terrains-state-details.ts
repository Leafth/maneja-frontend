import { useQuery } from '@tanstack/react-query';

import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';
import { buildLocalTerrainStateDetails } from '../utils/build-local-terrain-state-details';

import { terrainQueryKeys } from './terrain.query-keys';
import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

export function useTerrainsStateDetails() {
  return useQuery({
    queryKey: terrainQueryKeys.stateList(),

    queryFn: async (): Promise<Record<string, TerrainStateDetails>> => {
      const [terrains, occupations] = await Promise.all([
        terrainRepository.findAll(),
        occupationRepository.findAll(),
      ]);

      return Object.fromEntries(
        terrains.map((terrain) => {
          const terrainOccupations = occupations.filter(
            (occupation) => occupation.terrainLocalId === terrain.localId,
          );

          return [
            terrain.localId,
            buildLocalTerrainStateDetails(terrain, terrainOccupations),
          ];
        }),
      );
    },
  });
}
