import type {
  CreateTerrainRequestDTO,
  RemoteTerrain,
  TerrainResponseDTO,
  UpdateTerrainRequestDTO,
} from '../models';

function toRemoteModel(dto: TerrainResponseDTO): RemoteTerrain {
  return {
    remoteId: dto.id,

    name: dto.name,
    restDays: dto.rest_days,
    status: dto.status,

    remoteCreatedAt: dto.created_at,
    remoteUpdatedAt: dto.updated_at,
  };
}

function toCreateDTO(data: {
  name: string;
  restDays: number;
}): CreateTerrainRequestDTO {
  return {
    terrain: {
      name: data.name,
      rest_days: data.restDays,
    },
  };
}

function toUpdateDTO(data: {
  name?: string;
  restDays?: number;
}): UpdateTerrainRequestDTO {
  return {
    terrain: {
      name: data.name,
      rest_days: data.restDays,
    },
  };
}

export const terrainMapper = {
  toRemoteModel,
  toCreateDTO,
  toUpdateDTO,
};
