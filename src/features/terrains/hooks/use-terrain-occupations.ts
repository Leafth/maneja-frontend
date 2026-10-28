import { useQuery } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import type { TerrainOccupation } from '../models';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainOccupations(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.occupations(localId ?? ''),

    queryFn: async (): Promise<TerrainOccupation[]> => {
      if (!localId) {
        return [];
      }

      // TODO(integração): ocupações do terreno
      // (TerrainOccupationListResponseDTO) → terrainMapper.toOccupationModel.
      return integrationPending(`ocupações do terreno ${localId}`);
    },

    enabled: Boolean(localId),

    networkMode: 'always',
  });
}
