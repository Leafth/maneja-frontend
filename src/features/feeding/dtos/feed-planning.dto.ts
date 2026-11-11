export interface FeedPlanningRequestDto {
  feed_planning: { start_date: string; end_date: string } & (
    { scope: 'group'; group_id: string } | { scope: 'all' }
  );
}
export interface FeedPlanningDto {
  period: { start_date: string; end_date: string; days: number };
  scope: { type: 'group'; group_id: string } | { type: 'all' };
  data: {
    feed_id: string; feed_name: string; stock_quantity: string;
    required_quantity: string; missing_quantity: string; sufficient: boolean;
  }[];
}
