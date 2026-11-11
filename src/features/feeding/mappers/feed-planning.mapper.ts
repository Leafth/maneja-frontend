import type { FeedPlanningDto } from '../dtos/feed-planning.dto';
import type { FeedPlanning } from '../models/feed-planning.model';
import { decimalStringToScaled } from '../utils/feed-decimal';

export const feedPlanningMapper = {
  fromDto(dto: FeedPlanningDto): FeedPlanning {
    return {
      period: { startDate: dto.period.start_date, endDate: dto.period.end_date, days: dto.period.days },
      scope: dto.scope.type === 'all' ? { type: 'all' } : { type: 'group', groupRemoteId: dto.scope.group_id },
      items: dto.data.map(item => ({
        feedRemoteId: item.feed_id, feedName: item.feed_name,
        stockScaled: decimalStringToScaled(item.stock_quantity),
        requiredScaled: decimalStringToScaled(item.required_quantity),
        missingScaled: decimalStringToScaled(item.missing_quantity), sufficient: item.sufficient,
      })),
    };
  },
};
