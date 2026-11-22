import type { FeedAlertDto } from '../dtos/feed-alert.dto';
import type { FeedAlert } from '../models/feed-alert.model';

import { decimalStringToScaled } from '../utils/feed-decimal';

export const feedAlertMapper = {
  fromDto(dto: FeedAlertDto): FeedAlert {
    return {
      feedRemoteId: dto.feed_id,
      feedName: dto.feed_name,

      stockScaled: decimalStringToScaled(dto.stock_quantity),

      dailyRequiredScaled: decimalStringToScaled(dto.daily_required_quantity),

      daysRemaining: dto.days_remaining,
      alertLevel: dto.alert_level,
    };
  },
};
