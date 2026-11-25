import type { FeedDto, FeedWriteResponseDto } from '../dtos/feed.dto';
import type { FeedAlertLevel } from '../models/feed.model';
import { decimalStringToScaled } from '../utils/feed-decimal';

export interface RemoteFeedSnapshot {
  remoteId: string;

  name: string;

  remoteStockScaled: number;

  dailyRequiredScaled: number | null;
  daysRemaining: number | null;
  alertLevel: FeedAlertLevel | null;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}

export const feedMapper = {
  fromDto(dto: FeedDto): RemoteFeedSnapshot {
    return {
      remoteId: dto.id,

      name: dto.name,

      remoteStockScaled: decimalStringToScaled(dto.stock_quantity),

      dailyRequiredScaled: decimalStringToScaled(dto.daily_required_quantity),

      daysRemaining: dto.days_remaining,

      alertLevel: dto.alert_level,

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,
    };
  },

  fromWriteDto(dto: FeedWriteResponseDto): RemoteFeedSnapshot {
    return {
      remoteId: dto.id,

      name: dto.name,

      remoteStockScaled: decimalStringToScaled(dto.stock_quantity),
      
      dailyRequiredScaled: null,
      daysRemaining: null,
      alertLevel: null,

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,
    };
  },
};
