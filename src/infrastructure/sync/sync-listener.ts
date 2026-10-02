import NetInfo from '@react-native-community/netinfo';

import { syncOrchestrator } from './sync-orchestrator';

let wasConnected = false;

export function startSyncListener() {
  return NetInfo.addEventListener((state) => {
    const isConnected =
      state.isConnected === true && state.isInternetReachable !== false;

    if (isConnected && !wasConnected) {
      void syncOrchestrator.sync();
    }

    wasConnected = isConnected;
  });
}
