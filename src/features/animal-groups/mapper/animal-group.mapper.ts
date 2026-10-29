import type {
  AnimalGroupOccupation,
  AnimalGroupOccupationDTO,
  AnimalGroupResponseDTO,
  AnimalGroupTerrainRef,
  AnimalGroupTerrainRefDTO,
  CreateAnimalGroupRequestDTO,
  RemoteAnimalGroup,
  UpdateAnimalGroupRequestDTO,
} from '../models';

export const animalGroupMapper = {
  toCreateDTO(name: string, animalCount: number): CreateAnimalGroupRequestDTO {
    return {
      group: {
        name,
        animal_count: animalCount,
      },
    };
  },

  toUpdateDTO(data: {
    name?: string;
    animalCount?: number;
  }): UpdateAnimalGroupRequestDTO {
    return {
      group: {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.animalCount !== undefined && {
          animal_count: data.animalCount,
        }),
      },
    };
  },

  fromResponseDTO(dto: AnimalGroupResponseDTO): RemoteAnimalGroup {
    return {
      remoteId: dto.id,

      name: dto.name,
      animalCount: dto.animal_count,

      currentTerrain: dto.current_terrain
        ? {
            remoteId: dto.current_terrain.id,
            name: dto.current_terrain.name,
          }
        : null,

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,
    };
  },

  fromTerrainRefDTO(dto: AnimalGroupTerrainRefDTO): AnimalGroupTerrainRef {
    return {
      localId: null,
      remoteId: dto.id,
      name: dto.name,
    };
  },

  fromOccupationDTO(dto: AnimalGroupOccupationDTO): AnimalGroupOccupation {
    return {
      remoteId: dto.id,
      startedAt: dto.started_at,
      endedAt: dto.ended_at,
      terrain: animalGroupMapper.fromTerrainRefDTO(dto.terrain),
    };
  },
};
