import type { OverviewDto } from '../dtos/overview.dto';
import type { Overview } from '../models/overview.model';

import { feedAlertMapper } from '@/features/feeding/mappers/feed-alert.mapper';

export const overviewMapper = {
  fromDto(dto: OverviewDto): Overview {
    return {
      herd: {
        groups: dto.herd.groups,
        animals: dto.herd.animals,
      },

      terrains: {
        total: dto.terrains.total,
        available: dto.terrains.available,
        occupied: dto.terrains.occupied,
        resting: dto.terrains.resting,
      },

      feedAlerts: dto.feed_alerts.map(feedAlertMapper.fromDto),
    };
  },
};
