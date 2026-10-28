import { useQuery } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import type { TerrainStateDetails } from '../models';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrainStateDetails(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.state(localId ?? ''),

    queryFn: async (): Promise<TerrainStateDetails | null> => {
      if (!localId) {
        return null;
      }

      // TODO(integração): GET /terrains/:id → TerrainDetailsResponseDTO
      // → terrainMapper.toStateDetails. O endpoint usa o id remoto.
      return integrationPending(`estado do terreno ${localId}`);
    },

    enabled: Boolean(localId),

    networkMode: 'always',
  });
}
