import { useQuery } from '@tanstack/react-query';

import type { TerrainOccupation } from '../models';
import { terrainQueryKeys } from './terrain.query-keys';
import { occupationRepository } from '@/features/movements/repositories/occupation.repository';

export function useTerrainOccupations(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.occupations(localId ?? ''),

    queryFn: async (): Promise<TerrainOccupation[]> => {
      if (!localId) {
        return [];
      }

      const occupations =
        await occupationRepository.findByTerrainLocalId(localId);

      return occupations.map(occupationRepository.toTerrainOccupation);
    },

    enabled: Boolean(localId),
  });
}
