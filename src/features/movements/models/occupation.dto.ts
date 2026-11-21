export interface OccupationRefDTO {
  id: string;
  name: string;
}

export interface OccupationResponseDTO {
  id: string;
  started_at: string;
  ended_at: string | null;

  group: OccupationRefDTO;
  terrain: OccupationRefDTO;
}

export interface CreateOccupationRequestDTO {
  occupation: {
    group_id: string;
    terrain_id: string;
  };
}
