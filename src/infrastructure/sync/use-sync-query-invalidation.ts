import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import { feedQueryKeys } from '@/features/feeding/hooks/feed-query-keys';
import { terrainQueryKeys } from '@/features/terrains/hooks';

import { syncEvents, type SyncScope } from './sync-events';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { feedingQueryKeys } from '@/features/feeding/hooks/feeding-query-keys';

export function useSyncQueryInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleSync(scope: SyncScope) {
      const accountId = useAuthStore.getState().user?.id;
      switch (scope) {
        case 'animal-groups':
          if (accountId) {void queryClient.invalidateQueries({ queryKey: feedingQueryKeys.groups(accountId) });}
          void queryClient.invalidateQueries({
            queryKey: animalGroupQueryKeys.all,
          });
          break;

        case 'terrains':
          void queryClient.invalidateQueries({
            queryKey: terrainQueryKeys.all,
          });
          break;

        case 'feeds':
          void queryClient.invalidateQueries({
            queryKey: feedQueryKeys.all,
          });
          break;
        case 'feed-requirements':
          if (accountId) {
            void queryClient.invalidateQueries({ queryKey: feedingQueryKeys.requirements(accountId) });
            void queryClient.invalidateQueries({ queryKey: feedingQueryKeys.planning(accountId) });
          }
          break;
        case 'feedings':
          if (accountId) {void queryClient.invalidateQueries({ queryKey: feedingQueryKeys.history(accountId) });}
          void queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
          break;
      }
    }

    return syncEvents.subscribe(handleSync);
  }, [queryClient]);
}
