import { animalGroupSyncService } from '@/features/animal-groups/services/animal-group-sync.service';
import { feedMovementSyncService } from '@/features/feeding/services/feed-movement-sync.service';
import { feedSyncService } from '@/features/feeding/services/feed-sync.service';
import { terrainSyncService } from '@/features/terrains/services/terrain-sync.service';

import { networkService } from '../network/network.service';
import { syncEvents } from './sync-events';

interface SyncState {
  inFlight: Promise<void> | null;
  rerunRequested: boolean;

  accountId: string | null;
}

const runtime = globalThis as typeof globalThis & {
  __manejaSyncState?: SyncState;
};

const state = (runtime.__manejaSyncState ??= {
  inFlight: null,
  rerunRequested: false,
  accountId: null,
});

class SyncOrchestrator {
  sync(accountId?: string): Promise<void> {
    if (accountId) {
      state.accountId = accountId;
    }

    state.rerunRequested = true;

    if (!state.inFlight) {
      state.inFlight = Promise.resolve().then(() => this.drain());
    }

    return state.inFlight;
  }

  private async drain(): Promise<void> {
    try {
      do {
        state.rerunRequested = false;

        const accountId = state.accountId;

        if (!accountId) {
          return;
        }

        try {
          const connected = await networkService.isConnected();

          if (!connected) {
            continue;
          }

          await animalGroupSyncService.sync();

          syncEvents.emit('animal-groups');

          await terrainSyncService.sync();

          syncEvents.emit('terrains');

          /*
           * 1. Primeiro garantimos que os Feeds
           * locais possuam identidade remota.
           */
          await feedSyncService.syncUpserts(accountId);

          /*
           * 2. Depois enviamos entry/exit.
           *
           * Movimentos precisam do remoteId
           * do Feed.
           */
          await feedMovementSyncService.sync(accountId);

          /*
           * 3. Só depois dos movimentos
           * processamos exclusões.
           */
          await feedSyncService.syncDeletes(accountId);

          /*
           * 4. Finalmente atualizamos o snapshot
           * remoto dos Feeds.
           */
          await feedSyncService.pull(accountId);

          syncEvents.emit('feeds');
        } catch (error) {
          console.error('Erro durante a sincronização:', error);
        }
      } while (state.rerunRequested);
    } finally {
      state.inFlight = null;
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
