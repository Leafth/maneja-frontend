import { useAuthStore } from '@/features/auth/stores/auth.store';
import { animalGroupService } from '@/features/animal-groups/services/animal-group.service';
import { feedingGroupRepository } from '../repositories/feeding-group.repository';

export function assertFeedingAccount(accountId: string) {
  if (useAuthStore.getState().user?.id !== accountId) {throw new Error('A conta mudou durante a sincronização.');}
}

export async function verifyFeedingGroups(accountId: string) {
  let page = 1;
  while (true) {
    assertFeedingAccount(accountId);
    const response = await animalGroupService.list({ page, perPage: 100 });
    for (const group of response.data) {await feedingGroupRepository.bindVerifiedRemote(accountId, group.remoteId);}
    if (page >= response.meta.totalPages) {break;}
    if (!Number.isSafeInteger(response.meta.totalPages) || response.meta.totalPages < 0) {throw new Error('Paginação de grupos inválida.');}
    page++;
  }
}
