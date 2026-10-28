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

export interface TerrainGroupRefDTO {
  id: string;
  name: string;
}

export interface OccupiedStateDetailsDTO {
  current_group: TerrainGroupRefDTO;
  entered_at: string;
}

export interface RestingStateDetailsDTO {
  remaining_rest_days: number;
  last_group: TerrainGroupRefDTO;
  last_occupation: {
    id: string;
    started_at: string;
    ended_at: string;
  };
}

// O formato de state_details para 'available' ainda não foi documentado.
export type TerrainStateDTO =
  | { status: 'occupied'; state_details: OccupiedStateDetailsDTO }
  | { status: 'resting'; state_details: RestingStateDetailsDTO }
  | { status: 'available'; state_details: Record<string, unknown> | null };

export type TerrainDetailsResponseDTO = Omit<TerrainResponseDTO, 'status'> &
  TerrainStateDTO;

export interface TerrainDetailsListResponseDTO {
  data: TerrainDetailsResponseDTO[];
  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface TerrainOccupationDTO {
  id: string;
  started_at: string;
  ended_at: string | null;
  group: TerrainGroupRefDTO;
}

export interface TerrainOccupationListResponseDTO {
  terrain: TerrainGroupRefDTO;
  data: TerrainOccupationDTO[];
  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}
