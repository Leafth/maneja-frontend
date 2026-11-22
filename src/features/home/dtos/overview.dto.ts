import type { FeedAlertDto } from '@/features/feeding/dtos/feed-alert.dto';

export interface OverviewDto {
  herd: {
    groups: number;
    animals: number;
  };

  terrains: {
    total: number;
    available: number;
    occupied: number;
    resting: number;
  };

  feed_alerts: FeedAlertDto[];
}
