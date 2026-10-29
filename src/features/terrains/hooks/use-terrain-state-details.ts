import { useQuery } from '@tanstack/react-query';

import { terrainMapper } from '../mapper/terrain.mapper';
import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainStateDetails(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.state(localId ?? ''),

    queryFn: async (): Promise<TerrainStateDetails | null> => {
      if (!localId) {
        return null;
      }

      const terrain = await terrainRepository.findByLocalId(localId);

      if (!terrain) {
        return null;
      }

      return terrainMapper.toLocalStateDetails(terrain);
    },

    enabled: Boolean(localId),
  });
}
