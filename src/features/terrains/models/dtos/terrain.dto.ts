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

export interface FinishedTerrainOccupationDTO {
  id: string;
  started_at: string;
  ended_at: string;
}

export interface OccupiedStateDetailsDTO {
  current_group: TerrainGroupRefDTO | null;
  entered_at: string | null;
}

export interface RestingStateDetailsDTO {
  remaining_rest_days: number;
  last_group: TerrainGroupRefDTO | null;
  last_occupation: FinishedTerrainOccupationDTO | null;
}

export interface AvailableStateDetailsDTO {
  days_free: number;
  last_group: TerrainGroupRefDTO | null;
  last_occupation: FinishedTerrainOccupationDTO | null;
}

export type TerrainStateDTO =
  | {
      status: 'occupied';
      state_details: OccupiedStateDetailsDTO;
    }
  | {
      status: 'resting';
      state_details: RestingStateDetailsDTO;
    }
  | {
      status: 'available';
      state_details: AvailableStateDetailsDTO;
    };

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
  terrain: {
    id: string;
    name: string;
  };
  data: TerrainOccupationDTO[];
  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}
