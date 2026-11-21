export interface FeedPlanningRequestDto {
  feed_planning: {
    start_date: string;
    end_date: string;
  } & (
    | {
        scope: 'group';
        group_id: string;
      }
    | {
        scope: 'all';
      }
  );
}

export type FeedPlanningItemStatusDto =
  | {
      state: 'shortage';
      missing_quantity: string;
    }
  | {
      state: 'sufficient';
      remaining_quantity: string;
    };

export interface FeedPlanningGroupDto {
  group_id: string;
  group_name: string;
  daily_required_quantity: string;
}

export interface FeedPlanningItemDto {
  feed_id: string;
  feed_name: string;

  stock_quantity: string;
  required_quantity: string;
  global_required_quantity: string;

  status: FeedPlanningItemStatusDto;

  groups?: FeedPlanningGroupDto[];
}

export interface FeedPlanningDto {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };

  scope:
    | {
        type: 'group';
        group_id: string;
      }
    | {
        type: 'all';
      };

  status: {
    state: 'shortage' | 'sufficient';
    shortage_count: number;
  };

  data: FeedPlanningItemDto[];
}
