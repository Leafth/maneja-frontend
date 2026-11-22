import { api } from '@/infrastructure/api';

import type {
  CreateFeedRequestDto,
  FeedDto,
  FeedListQueryDto,
  FeedListResponseDto,
  UpdateFeedRequestDto,
} from '../dtos/feed.dto';

import type { FeedAlertDto } from '../dtos/feed-alert.dto';
import { feedAlertMapper } from '../mappers/feed-alert.mapper';

class FeedService {
  async list(query?: FeedListQueryDto): Promise<FeedListResponseDto> {
    const response = await api.get<FeedListResponseDto>('/feeds', {
      params: query,
    });

    return response.data;
  }

  async find(remoteId: string): Promise<FeedDto> {
    const response = await api.get<FeedDto>(`/feeds/${remoteId}`);

    return response.data;
  }

  async create(body: CreateFeedRequestDto): Promise<FeedDto> {
    const response = await api.post<FeedDto>('/feeds', body);

    return response.data;
  }

  async update(remoteId: string, body: UpdateFeedRequestDto): Promise<FeedDto> {
    const response = await api.patch<FeedDto>(`/feeds/${remoteId}`, body);

    return response.data;
  }

  async remove(remoteId: string): Promise<void> {
    await api.delete(`/feeds/${remoteId}`);
  }

  async listAlerts() {
    const response = await api.get<FeedAlertDto[]>('/feeds/alerts');

    return response.data.map(feedAlertMapper.fromDto);
  }
}

export const feedService = new FeedService();
