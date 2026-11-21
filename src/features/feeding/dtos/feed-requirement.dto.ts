import type { FeedAlertLevelDto } from './feed.dto';

export interface FeedRequirementDto {
  id: string;

  group_id?: string;

  feed_id: string;

  feed_name?: string;

  quantity_per_animal_kg: string;

  total_daily_kg?: string;

  days_remaining?: number | null;

  alert_level?: FeedAlertLevelDto | null;

  created_at: string;

  updated_at: string;
}

export interface FeedRequirementListDto {
  group_id: string;

  feed_requirements: FeedRequirementDto[];
}

export interface SaveFeedRequirementDto {
  feed_requirement: {
    feed_id: string;
    quantity_per_animal_kg: number;
  };
}
