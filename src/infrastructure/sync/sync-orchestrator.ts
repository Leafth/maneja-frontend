import { animalGroupSyncService } from '@/features/animal-groups/services/animal-group-sync.service';
import { feedMovementSyncService } from '@/features/feeding/services/feed-movement-sync.service';
import { feedSyncService } from '@/features/feeding/services/feed-sync.service';
import { movementCommandRepository } from '@/features/movements/repositories/movement-command.repository';
import { movementSyncService } from '@/features/movements/services/movement-sync.service';
import { terrainSyncService } from '@/features/terrains/services/terrain-sync.service';

import { networkService } from '../network/network.service';
import { syncEvents } from './sync-events';
import { occupationSyncService } from '@/features/movements/services';

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

          /*
           * 1. Sincroniza grupos primeiro.
           *
           * Movimentações dependem do remoteId
           * dos grupos.
           */
          await animalGroupSyncService.sync();

          syncEvents.emit('animal-groups');

          /*
           * 2. Sincroniza terrenos.
           *
           * Movimentações também dependem do
           * remoteId do terreno de destino.
           */
          await terrainSyncService.sync();

          syncEvents.emit('terrains');

          /*
           * 3. Recupera movimentações que ficaram
           * presas em "sending".
           *
           * Como o POST /occupations não é
           * idempotente, essas movimentações viram
           * "uncertain" em vez de serem reenviadas.
           */
          await movementCommandRepository.recoverInterrupted(accountId);

          /*
           * 4. Envia movimentações pendentes.
           */
          await movementSyncService.sync(accountId);

          /*
           * 5. Reconciliamos terrenos e grupos
           * com o estado confirmado pelo servidor.
           *
           * Uma movimentação pode alterar:
           *
           * origem:
           * occupied -> resting / available
           *
           * destino:
           * available / resting -> occupied
           *
           * grupo:
           * current_terrain
           */
          await terrainSyncService.pull();

          await animalGroupSyncService.pullRemote();

          /*
           * 6. Atualiza o cache local das ocupações.
           * Histórico e detalhes passam a funcionar offline.
           */
          await occupationSyncService.pull(accountId);

          syncEvents.emit('terrains');
          syncEvents.emit('animal-groups');

          /*
           * 7. Sincroniza criações e edições
           * pendentes de rações.
           */
          await feedSyncService.syncUpserts(accountId);

          /*
           * 8. Envia entradas e saídas de estoque.
           */
          await feedMovementSyncService.sync(accountId);

          /*
           * 9. Processa exclusões de rações.
           */
          await feedSyncService.syncDeletes(accountId);

          /*
           * 10. Atualiza o snapshot remoto das
           * rações no SQLite.
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
