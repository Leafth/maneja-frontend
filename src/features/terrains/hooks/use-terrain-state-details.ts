import { useQuery } from '@tanstack/react-query';

import type { TerrainStateDetails } from '../models';
import { terrainRepository } from '../repositories/terrain.repository';
import { buildLocalTerrainStateDetails } from '../utils/build-local-terrain-state-details';

import { terrainQueryKeys } from './terrain.query-keys';
import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

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

      const occupations =
        await occupationRepository.findByTerrainLocalId(localId);

      return buildLocalTerrainStateDetails(terrain, occupations);
    },

    enabled: Boolean(localId),
  });
}
