import type { FeedAlertLevelDto } from './feed.dto';

export interface FeedAlertDto {
  feed_id: string;
  feed_name: string;

  stock_quantity: string;
  daily_required_quantity: string;

  days_remaining: number;
  alert_level: FeedAlertLevelDto;
}
