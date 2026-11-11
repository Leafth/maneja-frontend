export interface FeedingDto {
  id: string;
  group_id?: string;
  feed_id: string;
  quantity: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}
export interface FeedingListDto {
  group_id: string;
  data: FeedingDto[];
  meta: { page: number; per_page: number; total_items: number; total_pages: number };
}
export interface CreateFeedingDto {
  feeding: { feed_id: string; quantity: number; occurred_at: string };
}
