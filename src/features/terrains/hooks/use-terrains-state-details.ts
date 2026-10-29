import { useQuery } from '@tanstack/react-query';

import { terrainMapper } from '../mapper/terrain.mapper';
import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainsStateDetails() {
  return useQuery({
    queryKey: terrainQueryKeys.stateList(),

    queryFn: async (): Promise<Record<string, TerrainStateDetails>> => {
      const terrains = await terrainRepository.findAll();

      return Object.fromEntries(
        terrains.map((terrain) => [
          terrain.localId,
          terrainMapper.toLocalStateDetails(terrain),
        ]),
      );
    },
  });
}
