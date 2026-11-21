import { type PropsWithChildren, useEffect } from 'react';

import { useMe } from '@/features/auth/hooks/use-me';
import {
  startSyncListener,
  syncOrchestrator,
  useSyncQueryInvalidation,
} from '@/infrastructure/sync';

export function SyncProvider({ children }: PropsWithChildren) {
  const { data: user } = useMe();

  useSyncQueryInvalidation();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void syncOrchestrator.sync(user.id);

    const unsubscribe = startSyncListener(user.id);

    return unsubscribe;
  }, [user?.id]);

  return children;
}
