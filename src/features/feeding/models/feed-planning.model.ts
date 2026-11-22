export type FeedPlanningItemStatus =
  | {
      state: 'shortage';
      missingScaled: number;
    }
  | {
      state: 'sufficient';
      remainingScaled: number;
    };

export interface FeedPlanningGroup {
  groupRemoteId: string;
  groupName: string;
  dailyRequiredScaled: number;
}

export interface FeedPlanningItem {
  feedRemoteId: string;
  feedName: string;

  stockScaled: number;

  requiredScaled: number;

  globalRequiredScaled: number;

  status: FeedPlanningItemStatus;

  groups: FeedPlanningGroup[];
}

export interface FeedPlanning {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };

  scope:
    | {
        type: 'group';
        groupRemoteId: string;
      }
    | {
        type: 'all';
      };

  status: {
    state: 'shortage' | 'sufficient';
    shortageCount: number;
  };

  items: FeedPlanningItem[];
}
