import { api } from '@/infrastructure/api';

import type { OverviewDto } from '../dtos/overview.dto';

import { overviewMapper } from '../mappers/overview.mapper';

export const overviewService = {
  async getOverview() {
    const response = await api.get<OverviewDto>('/overview');

    return overviewMapper.fromDto(response.data);
  },
};
