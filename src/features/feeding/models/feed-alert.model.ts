import type { FeedAlertLevel } from './feed.model';

export interface FeedAlert {
  feedRemoteId: string;
  feedName: string;

  stockScaled: number;
  dailyRequiredScaled: number;

  daysRemaining: number;
  alertLevel: FeedAlertLevel;
}
