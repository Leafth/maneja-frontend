export interface AnimalGroupResponseDTO {
  id: string;
  name: string;
  animal_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAnimalGroupRequestDTO {
  group: {
    name: string;
    animal_count: number;
  };
}

export interface UpdateAnimalGroupRequestDTO {
  group: {
    name?: string;
    animal_count?: number;
  };
}

export interface AnimalGroupListResponseDTO {
  data: AnimalGroupResponseDTO[];

  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}
