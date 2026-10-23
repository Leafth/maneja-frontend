export type TerrainStatusDTO = 'available' | 'occupied' | 'resting';

export interface TerrainResponseDTO {
  id: string;
  name: string;
  rest_days: number;
  status: TerrainStatusDTO;
  created_at: string;
  updated_at: string;
}

export interface TerrainListResponseDTO {
  data: TerrainResponseDTO[];
  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface CreateTerrainRequestDTO {
  terrain: {
    name: string;
    rest_days: number;
  };
}

export interface UpdateTerrainRequestDTO {
  terrain: {
    name?: string;
    rest_days?: number;
  };
}
