import type { FeedAlert } from '@/features/feeding/models/feed-alert.model';

export interface Overview {
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

  feedAlerts: FeedAlert[];
}
