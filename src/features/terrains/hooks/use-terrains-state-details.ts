import { useQuery } from '@tanstack/react-query';

import { integrationPending } from '@/shared/utils/integration-pending';

import type { TerrainStateDetails } from '../models';
import { terrainQueryKeys } from './terrain.query-keys';

/** Estado de todos os terrenos, indexado pelo localId. */
export function useTerrainsStateDetails() {
  return useQuery({
    queryKey: terrainQueryKeys.stateList(),

    queryFn: async (): Promise<Record<string, TerrainStateDetails>> => {
      // TODO(integração): state_details de GET /terrains
      // (TerrainDetailsListResponseDTO) → terrainMapper.toStateDetails,
      // indexado pelo localId de cada terreno.
      return integrationPending('estado dos terrenos');
    },

    networkMode: 'always',
  });
}
