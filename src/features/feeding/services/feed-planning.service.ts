import { api } from '@/infrastructure/api';
import { networkService } from '@/infrastructure/network/network.service';
import type { FeedPlanningDto, FeedPlanningRequestDto } from '../dtos/feed-planning.dto';
import { feedPlanningMapper } from '../mappers/feed-planning.mapper';

export const feedPlanningService = {
  async calculate(body: FeedPlanningRequestDto) {
    if (!await networkService.isConnected()) { throw new Error('O planejamento requer conexão com a internet.'); }
    return feedPlanningMapper.fromDto((await api.post<FeedPlanningDto>('/feed_planning', body)).data);
  },
};
