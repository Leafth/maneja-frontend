import { api } from '@/infrastructure/api/api-client';

import { animalGroupMapper } from '../mapper/animal-group.mapper';

import type {
  AnimalGroupListResponseDTO,
  AnimalGroupResponseDTO,
} from '../models/dtos';

import type { RemoteAnimalGroup } from '../models';

interface ListAnimalGroupsParams {
  page?: number;
  perPage?: number;
}

interface AnimalGroupListResult {
  data: RemoteAnimalGroup[];

  meta: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

interface CreateAnimalGroupData {
  name: string;
  animalCount: number;
}

interface UpdateAnimalGroupData {
  name?: string;
  animalCount?: number;
}

async function list(
  params: ListAnimalGroupsParams = {},
): Promise<AnimalGroupListResult> {
  const { page = 1, perPage = 100 } = params;

  const response = await api.get<AnimalGroupListResponseDTO>('/groups', {
    params: {
      page,
      per_page: perPage,
    },
  });

  return {
    data: response.data.data.map(animalGroupMapper.fromResponseDTO),

    meta: {
      page: response.data.meta.page,
      perPage: response.data.meta.per_page,
      totalItems: response.data.meta.total_items,
      totalPages: response.data.meta.total_pages,
    },
  };
}

async function findById(remoteId: string): Promise<RemoteAnimalGroup> {
  const response = await api.get<AnimalGroupResponseDTO>(`/groups/${remoteId}`);

  return animalGroupMapper.fromResponseDTO(response.data);
}

async function create(data: CreateAnimalGroupData): Promise<RemoteAnimalGroup> {
  const payload = animalGroupMapper.toCreateDTO(data.name, data.animalCount);

  const response = await api.post<AnimalGroupResponseDTO>('/groups', payload);

  return animalGroupMapper.fromResponseDTO(response.data);
}

async function update(
  remoteId: string,
  data: UpdateAnimalGroupData,
): Promise<RemoteAnimalGroup> {
  const payload = animalGroupMapper.toUpdateDTO(data);

  const response = await api.patch<AnimalGroupResponseDTO>(
    `/groups/${remoteId}`,
    payload,
  );

  return animalGroupMapper.fromResponseDTO(response.data);
}

async function remove(remoteId: string): Promise<void> {
  await api.delete(`/groups/${remoteId}`);
}

export const animalGroupService = {
  list,
  findById,
  create,
  update,
  remove,
};
