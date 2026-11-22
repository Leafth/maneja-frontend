import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { animalGroupQueryKeys } from '@/features/animal-groups/hooks';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { feedQueryKeys } from '@/features/feeding/hooks/feed-query-keys';
import { feedingQueryKeys } from '@/features/feeding/hooks/feeding-query-keys';
import { homeQueryKeys } from '@/features/home/hooks/home-query-keys';
import { terrainQueryKeys } from '@/features/terrains/hooks';

import { syncEvents, type SyncScope } from './sync-events';

export function useSyncQueryInvalidation() {
  const queryClient = useQueryClient();

  useEffect(() => {
    function invalidateDerivedQueries(accountId: string) {
      void queryClient.invalidateQueries({
        queryKey: feedingQueryKeys.alerts(accountId),
      });

      void queryClient.invalidateQueries({
        queryKey: homeQueryKeys.overview(accountId),
      });
    }

    function handleSync(scope: SyncScope) {
      const accountId = useAuthStore.getState().user?.id;

      switch (scope) {
        case 'animal-groups':
          if (accountId) {
            void queryClient.invalidateQueries({
              queryKey: feedingQueryKeys.groups(accountId),
            });

            invalidateDerivedQueries(accountId);
          }

          void queryClient.invalidateQueries({
            queryKey: animalGroupQueryKeys.all,
          });
          break;

        case 'terrains':
          if (accountId) {
            invalidateDerivedQueries(accountId);
          }

          void queryClient.invalidateQueries({
            queryKey: terrainQueryKeys.all,
          });
          break;

        case 'feeds':
          if (accountId) {
            invalidateDerivedQueries(accountId);
          }

          void queryClient.invalidateQueries({
            queryKey: feedQueryKeys.all,
          });
          break;

        case 'feed-requirements':
          if (accountId) {
            void queryClient.invalidateQueries({
              queryKey: feedingQueryKeys.requirements(accountId),
            });

            void queryClient.invalidateQueries({
              queryKey: feedingQueryKeys.planning(accountId),
            });

            invalidateDerivedQueries(accountId);
          }
          break;

        case 'feedings':
          if (accountId) {
            void queryClient.invalidateQueries({
              queryKey: feedingQueryKeys.history(accountId),
            });

            invalidateDerivedQueries(accountId);
          }

          void queryClient.invalidateQueries({
            queryKey: feedQueryKeys.all,
          });
          break;
      }
    }

    return syncEvents.subscribe(handleSync);
  }, [queryClient]);
}
