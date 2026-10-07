import { useQuery } from '@tanstack/react-query';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrain(localId: string | undefined) {
  return useQuery({
    queryKey: terrainQueryKeys.detail(localId ?? ''),

    queryFn: async () => {
      if (!localId) {
        return null;
      }

      return terrainRepository.findByLocalId(localId);
    },

    enabled: Boolean(localId),

    networkMode: 'always',
  });
}
