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
    localId: null,
    remoteId: dto.id,
    name: dto.name,
  };
}

function toStateDetails(dto: TerrainDetailsResponseDTO): TerrainStateDetails {
  switch (dto.status) {
    case 'occupied':
      return {
        status: 'occupied',

        currentGroup: dto.state_details.current_group
          ? toGroupRef(dto.state_details.current_group)
          : null,

        enteredAt: dto.state_details.entered_at,
      };

    case 'resting':
      return {
        status: 'resting',

        remainingRestDays: dto.state_details.remaining_rest_days,

        lastGroup: dto.state_details.last_group
          ? toGroupRef(dto.state_details.last_group)
          : null,

        lastOccupation: dto.state_details.last_occupation
          ? {
              localId: dto.state_details.last_occupation.id,
              remoteId: dto.state_details.last_occupation.id,

              startedAt: dto.state_details.last_occupation.started_at,

              endedAt: dto.state_details.last_occupation.ended_at,
            }
          : null,
      };

    case 'available':
      return {
        status: 'available',

        daysFree: dto.state_details.days_free,

        lastGroup: dto.state_details.last_group
          ? toGroupRef(dto.state_details.last_group)
          : null,

        lastOccupation: dto.state_details.last_occupation
          ? {
              localId: dto.state_details.last_occupation.id,
              remoteId: dto.state_details.last_occupation.id,

              startedAt: dto.state_details.last_occupation.started_at,

              endedAt: dto.state_details.last_occupation.ended_at,
            }
          : null,
      };
  }
}

function toOccupationModel(dto: TerrainOccupationDTO): TerrainOccupation {
  return {
    localId: dto.id,
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
