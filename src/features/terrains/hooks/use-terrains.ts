import { useQuery } from '@tanstack/react-query';

import { terrainRepository } from '../repositories/terrain.repository';
import { terrainQueryKeys } from './terrain.query-keys';

export function useTerrains() {
  return useQuery({
    queryKey: terrainQueryKeys.lists(),

    queryFn: () => {
      return terrainRepository.findAll();
    },

    networkMode: 'always',
  });
}
