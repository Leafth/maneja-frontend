import { useQuery } from '@tanstack/react-query';

import { terrainMapper } from '../mapper/terrain.mapper';
import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';
import { terrainService } from '../services/terrain.service';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainStateDetails(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.state(localId ?? ''),

    queryFn: async (): Promise<TerrainStateDetails | null> => {
      if (!localId) {
        return null;
      }

      const terrain = await terrainRepository.findByLocalId(localId);

      if (!terrain?.remoteId) {
        return null;
      }

      const response = await terrainService.findDetails(terrain.remoteId);

      return terrainMapper.toStateDetails(response);
    },

    enabled: Boolean(localId),
  });
}
