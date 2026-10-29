import { isAxiosError } from 'axios';

import { animalGroupRepository } from '@/features/animal-groups/repositories/animal-group.repository';
import { animalGroupService } from '@/features/animal-groups/services/animal-group.service';
import { terrainRepository } from '@/features/terrains/repositories/terrain.repository';

import { occupationRepository } from '../repositories/occupation.repository';

async function pull(accountId: string): Promise<void> {
  const groups = await animalGroupRepository.findAll();

  for (const group of groups) {
    if (!group.remoteId || group.syncStatus === 'pending_delete') {
      continue;
    }

    try {
      const occupations = await animalGroupService.listOccupations(
        group.remoteId,
      );

      for (const occupation of occupations) {
        if (!occupation.remoteId || !occupation.terrain.remoteId) {
          continue;
        }

        const terrain = occupation.terrain.remoteId
          ? await terrainRepository.findByRemoteId(occupation.terrain.remoteId)
          : null;

        await occupationRepository.upsertRemote({
          accountId,
          group,
          terrain,
          remoteId: occupation.remoteId,
          startedAt: occupation.startedAt,
          endedAt: occupation.endedAt,
          terrainRemoteId: occupation.terrain.remoteId,
          terrainName: occupation.terrain.name,
        });
      }
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        continue;
      }

      throw error;
    }
  }
}

export const occupationSyncService = {
  pull,
};
