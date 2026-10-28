import type {
  CreateTerrainRequestDTO,
  RemoteTerrain,
  TerrainDetailsResponseDTO,
  TerrainGroupRef,
  TerrainGroupRefDTO,
  TerrainOccupation,
  TerrainOccupationDTO,
  TerrainResponseDTO,
  TerrainStateDetails,
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

function toGroupRef(dto: TerrainGroupRefDTO): TerrainGroupRef {
  return {
    remoteId: dto.id,
    name: dto.name,
  };
}

function toStateDetails(dto: TerrainDetailsResponseDTO): TerrainStateDetails {
  switch (dto.status) {
    case 'occupied':
      return {
        status: 'occupied',
        currentGroup: toGroupRef(dto.state_details.current_group),
        enteredAt: dto.state_details.entered_at,
      };

    case 'resting':
      return {
        status: 'resting',
        remainingRestDays: dto.state_details.remaining_rest_days,
        lastGroup: toGroupRef(dto.state_details.last_group),
        lastOccupation: {
          remoteId: dto.state_details.last_occupation.id,
          startedAt: dto.state_details.last_occupation.started_at,
          endedAt: dto.state_details.last_occupation.ended_at,
        },
      };

    case 'available':
      return { status: 'available' };
  }
}

function toOccupationModel(dto: TerrainOccupationDTO): TerrainOccupation {
  return {
    remoteId: dto.id,
    startedAt: dto.started_at,
    endedAt: dto.ended_at,
    group: toGroupRef(dto.group),
  };
}

export const terrainMapper = {
  toRemoteModel,
  toCreateDTO,
  toUpdateDTO,
  toStateDetails,
  toOccupationModel,
};
