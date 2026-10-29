import { useQuery } from '@tanstack/react-query';

import { terrainMapper } from '../mapper/terrain.mapper';
import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';
import { terrainService } from '../services/terrain.service';

import { terrainQueryKeys } from './terrain.query-keys';

/** Estado de todos os terrenos, indexado pelo localId. */
export function useTerrainsStateDetails() {
  return useQuery({
    queryKey: terrainQueryKeys.stateList(),

    queryFn: async (): Promise<Record<string, TerrainStateDetails>> => {
      const terrains = await terrainRepository.findAll();

      const entries = await Promise.all(
        terrains
          .filter((terrain) => Boolean(terrain.remoteId))
          .map(async (terrain) => {
            const response = await terrainService.findDetails(
              terrain.remoteId!,
            );

            return [
              terrain.localId,
              terrainMapper.toStateDetails(response),
            ] as const;
          }),
      );

      return Object.fromEntries(entries);
    },
  });
}
