import type {
  AnimalGroupResponseDTO,
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

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,
    };
  },
};
