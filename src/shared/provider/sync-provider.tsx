import { type PropsWithChildren, useEffect } from 'react';

import {
  startSyncListener,
  useSyncQueryInvalidation,
} from '@/infrastructure/sync';

export function SyncProvider({ children }: PropsWithChildren) {
  useSyncQueryInvalidation();

  useEffect(() => {
    const unsubscribe = startSyncListener();

    return unsubscribe;
  }, []);

  return children;
}
