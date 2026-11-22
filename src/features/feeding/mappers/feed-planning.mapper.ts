import type {
  FeedPlanningDto,
  FeedPlanningItemDto,
} from '../dtos/feed-planning.dto';

import type {
  FeedPlanning,
  FeedPlanningItem,
  FeedPlanningItemStatus,
} from '../models/feed-planning.model';

import { decimalStringToScaled } from '../utils/feed-decimal';

function mapStatus(
  status: FeedPlanningItemDto['status'],
): FeedPlanningItemStatus {
  if (status.state === 'shortage') {
    return {
      state: 'shortage',
      missingScaled: decimalStringToScaled(status.missing_quantity),
    };
  }

  return {
    state: 'sufficient',
    remainingScaled: decimalStringToScaled(status.remaining_quantity),
  };
}

function mapItem(item: FeedPlanningItemDto): FeedPlanningItem {
  return {
    feedRemoteId: item.feed_id,
    feedName: item.feed_name,

    stockScaled: decimalStringToScaled(item.stock_quantity),

    requiredScaled: decimalStringToScaled(item.required_quantity),

    globalRequiredScaled: decimalStringToScaled(item.global_required_quantity),

    status: mapStatus(item.status),

    groups: (item.groups ?? []).map((group) => ({
      groupRemoteId: group.group_id,
      groupName: group.group_name,

      dailyRequiredScaled: decimalStringToScaled(group.daily_required_quantity),
    })),
  };
}

export const feedPlanningMapper = {
  fromDto(dto: FeedPlanningDto): FeedPlanning {
    return {
      period: {
        startDate: dto.period.start_date,
        endDate: dto.period.end_date,
        days: dto.period.days,
      },

      scope:
        dto.scope.type === 'all'
          ? {
              type: 'all',
            }
          : {
              type: 'group',
              groupRemoteId: dto.scope.group_id,
            },

      status: {
        state: dto.status.state,
        shortageCount: dto.status.shortage_count,
      },

      items: dto.data.map(mapItem),
    };
  },
};
