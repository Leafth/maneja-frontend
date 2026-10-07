import { animalGroupSyncService } from '@/features/animal-groups/services/animal-group-sync.service';
import { terrainSyncService } from '@/features/terrains/services/terrain-sync.service';

import { networkService } from '../network/network.service';
import { syncEvents } from './sync-events';

interface SyncState {
  inFlight: Promise<void> | null;
  rerunRequested: boolean;
}

// Keep the single-flight guard when this module is re-evaluated by Fast Refresh.
const runtime = globalThis as typeof globalThis & {
  __manejaSyncState?: SyncState;
};

const state = (runtime.__manejaSyncState ??= {
  inFlight: null,
  rerunRequested: false,
});

class SyncOrchestrator {
  sync(): Promise<void> {
    state.rerunRequested = true;

    if (!state.inFlight) {
      // Publish the promise before starting any async work, including NetInfo.
      state.inFlight = Promise.resolve().then(() => this.drain());
    }

    return state.inFlight;
  }

  private async drain(): Promise<void> {
    try {
      do {
        state.rerunRequested = false;

        try {
          const connected = await networkService.isConnected();

          if (connected) {
            await animalGroupSyncService.sync();
            syncEvents.emit('animal-groups');

            await terrainSyncService.sync();
            syncEvents.emit('terrains');
          }
        } catch (error) {
          console.error('Erro durante a sincronização:', error);
        }

        // Only a new request triggers another round; errors do not retry forever.
      } while (state.rerunRequested);
    } finally {
      // No await between checking rerunRequested and releasing the guard.
      state.inFlight = null;
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
