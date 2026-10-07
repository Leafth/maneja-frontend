import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import { terrainQueryKeys } from '@/features/terrains/hooks';

import { syncEvents, type SyncScope } from './sync-events';

export function useSyncQueryInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleSync(scope: SyncScope) {
      switch (scope) {
        case 'animal-groups':
          void queryClient.invalidateQueries({
            queryKey: animalGroupQueryKeys.all,
          });
        case 'terrains':
          void queryClient.invalidateQueries({
            queryKey: terrainQueryKeys.all,
          });
          break;
      }
    }

    return syncEvents.subscribe(handleSync);
  }, [queryClient]);
}
