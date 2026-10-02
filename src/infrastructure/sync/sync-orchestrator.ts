import { animalGroupSyncService } from '@/features/animal-groups/services/animal-group-sync.service';

import { networkService } from '../network/network.service';
import { syncEvents } from './sync-events';

class SyncOrchestrator {
  private isSyncing = false;

  async sync(): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    const connected = await networkService.isConnected();

    if (!connected) {
      return;
    }

    this.isSyncing = true;

    try {
      await animalGroupSyncService.sync();

      syncEvents.emit('animal-groups');
    } catch (error) {
      console.error('Erro durante a sincronização:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncOrchestrator = new SyncOrchestrator();
