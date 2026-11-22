import { api } from '@/infrastructure/api/api-client';

import type {
  CreateOccupationRequestDTO,
  OccupationResponseDTO,
} from '../models';

async function move(
  groupRemoteId: string,
  terrainRemoteId: string,
): Promise<OccupationResponseDTO> {
  const payload: CreateOccupationRequestDTO = {
    occupation: {
      group_id: groupRemoteId,
      terrain_id: terrainRemoteId,
    },
  };

  const response = await api.post<OccupationResponseDTO>(
    '/occupations',
    payload,
  );

  return response.data;
}

export const occupationService = {
  move,
};
