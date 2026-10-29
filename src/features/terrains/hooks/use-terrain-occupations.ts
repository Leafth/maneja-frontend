import { useQuery } from '@tanstack/react-query';

import type { TerrainOccupation } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';
import { terrainService } from '../services/terrain.service';

import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainOccupations(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.occupations(localId ?? ''),

    queryFn: async (): Promise<TerrainOccupation[]> => {
      if (!localId) {
        return [];
      }

      const terrain = await terrainRepository.findByLocalId(localId);

      if (!terrain?.remoteId) {
        return [];
      }

      return terrainService.listOccupations(terrain.remoteId);
    },

    enabled: Boolean(localId),
  });
}
