import { isAxiosError } from 'axios';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { animalGroupRepository } from '@/features/animal-groups/repositories/animal-group.repository';
import { animalGroupService } from '@/features/animal-groups/services/animal-group.service';
import { feedingGroupRepository } from '../repositories/feeding-group.repository';

export function assertFeedingAccount(accountId: string) {
  if (useAuthStore.getState().user?.id !== accountId) {throw new Error('A conta mudou durante a sincronização.');}
}

export async function ensureFeedingGroup(accountId: string, groupLocalId: string) {
  assertFeedingAccount(accountId);
  const groups = await feedingGroupRepository.list(accountId);
  if (groups.some((group) => group.localId === groupLocalId)) { return; }

  const group = await animalGroupRepository.findById(groupLocalId);
  if (!group || group.syncStatus === 'pending_delete') {
    throw new Error('Grupo não encontrado. Selecione um grupo no rebanho.');
  }
  if (!group.remoteId) {
    throw new Error('Não foi possível confirmar a conta deste grupo. Cadastre o grupo novamente no rebanho.');
  }

  try {
    const remote = await animalGroupService.findById(group.remoteId);
    assertFeedingAccount(accountId);
    if (remote.remoteId !== group.remoteId) { throw new Error('A API retornou um grupo diferente do solicitado.'); }
    await feedingGroupRepository.bindVerifiedRemote(accountId, remote.remoteId);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Este grupo está salvo no celular, mas não existe nesta conta na API. Cadastre-o novamente no rebanho antes de cadastrar a necessidade alimentar.');
    }
    throw error;
  }

  const verified = await feedingGroupRepository.list(accountId);
  if (!verified.some((item) => item.localId === groupLocalId)) {
    throw new Error('Este grupo não está vinculado à conta atual.');
  }
}

export async function verifyFeedingGroups(accountId: string) {
  let page = 1;
  while (true) {
    assertFeedingAccount(accountId);
    const response = await animalGroupService.list({ page, perPage: 100 });
    assertFeedingAccount(accountId);
    for (const group of response.data) {await feedingGroupRepository.bindVerifiedRemote(accountId, group.remoteId);}
    if (page >= response.meta.totalPages) {break;}
    if (!Number.isSafeInteger(response.meta.totalPages) || response.meta.totalPages < 0) {throw new Error('Paginação de grupos inválida.');}
    page++;
  }
}
