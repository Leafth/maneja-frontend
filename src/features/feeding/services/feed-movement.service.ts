import { api } from '@/infrastructure/api';

import type {
  CreateFeedEntryRequestDto,
  CreateFeedExitRequestDto,
  FeedEntryDto,
  FeedExitDto,
  FeedMovementListQueryDto,
  FeedMovementListResponseDto,
} from '../dtos/feed-movement.dto';

class FeedMovementService {
  async list(
    feedRemoteId: string,
    query?: FeedMovementListQueryDto,
  ): Promise<FeedMovementListResponseDto> {
    const response = await api.get<FeedMovementListResponseDto>(
      `/feeds/${feedRemoteId}/movements`,
      {
        params: query,
      },
    );

    return response.data;
  }

  async createEntry(
    feedRemoteId: string,
    body: CreateFeedEntryRequestDto,
  ): Promise<FeedEntryDto> {
    const response = await api.post<FeedEntryDto>(
      `/feeds/${feedRemoteId}/movements/entry`,
      body,
    );

    return response.data;
  }

  async createExit(
    feedRemoteId: string,
    body: CreateFeedExitRequestDto,
  ): Promise<FeedExitDto> {
    const response = await api.post<FeedExitDto>(
      `/feeds/${feedRemoteId}/movements/exit`,
      body,
    );

    return response.data;
  }
}

export const feedMovementService = new FeedMovementService();
