export interface FeedPlanning {
  period: { startDate: string; endDate: string; days: number };
  scope: { type: 'group'; groupRemoteId: string } | { type: 'all' };
  items: {
    feedRemoteId: string; feedName: string; stockScaled: number;
    requiredScaled: number; missingScaled: number; sufficient: boolean;
  }[];
}
