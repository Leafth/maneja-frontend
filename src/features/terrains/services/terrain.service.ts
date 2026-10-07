import { api } from '@/infrastructure/api';

import { terrainMapper } from '../mapper/terrain.mapper';
import type {
  CreateTerrainRequestDTO,
  RemoteTerrain,
  TerrainListResponseDTO,
  TerrainResponseDTO,
  UpdateTerrainRequestDTO,
} from '../models';

interface ListTerrainsParams {
  page?: number;
  perPage?: number;
}

interface ListTerrainsResult {
  data: RemoteTerrain[];
  meta: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

async function list(
  params: ListTerrainsParams = {},
): Promise<ListTerrainsResult> {
  const response = await api.get<TerrainListResponseDTO>('/terrains', {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? 100,
    },
  });

  return {
    data: response.data.data.map(terrainMapper.toRemoteModel),

    meta: {
      page: response.data.meta.page,
      perPage: response.data.meta.per_page,
      totalItems: response.data.meta.total_items,
      totalPages: response.data.meta.total_pages,
    },
  };
}

async function find(remoteId: string): Promise<RemoteTerrain> {
  const response = await api.get<TerrainResponseDTO>(`/terrains/${remoteId}`);

  return terrainMapper.toRemoteModel(response.data);
}

async function create(data: {
  name: string;
  restDays: number;
}): Promise<RemoteTerrain> {
  const payload: CreateTerrainRequestDTO = terrainMapper.toCreateDTO(data);

  const response = await api.post<TerrainResponseDTO>('/terrains', payload);

  return terrainMapper.toRemoteModel(response.data);
}

async function update(
  remoteId: string,
  data: {
    name?: string;
    restDays?: number;
  },
): Promise<RemoteTerrain> {
  const payload: UpdateTerrainRequestDTO = terrainMapper.toUpdateDTO(data);

  const response = await api.patch<TerrainResponseDTO>(
    `/terrains/${remoteId}`,
    payload,
  );

  return terrainMapper.toRemoteModel(response.data);
}

async function remove(remoteId: string): Promise<void> {
  await api.delete(`/terrains/${remoteId}`);
}

export const terrainService = {
  list,
  find,
  create,
  update,
  remove,
};
