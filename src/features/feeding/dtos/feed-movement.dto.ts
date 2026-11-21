export interface FeedMovementBaseDto {
  id: string;

  quantity: string;

  occurred_on: string;

  created_at: string;
  updated_at: string;
}

export interface FeedEntryDto extends FeedMovementBaseDto {
  feed_id: string;

  movement_type: 'entry';

  value: string;
}

export interface FeedExitDto extends FeedMovementBaseDto {
  feed_id: string;

  movement_type: 'exit';

  reason: string;
}

export type FeedMovementHistoryItemDto = FeedMovementBaseDto &
  (
    | {
        movement_type: 'entry';
        value: string;
      }
    | {
        movement_type: 'exit';
        reason: string;
      }
  );

export interface FeedSummaryDto {
  id: string;

  name: string;

  stock_quantity: string;
}

export interface FeedMovementListResponseDto {
  feed: FeedSummaryDto;

  data: FeedMovementHistoryItemDto[];

  meta: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export interface FeedMovementListQueryDto {
  page?: number;
  per_page?: number;
}

export interface CreateFeedEntryRequestDto {
  entry: {
    quantity: number;
    value: number;
    occurred_on: string;
  };
}

export interface CreateFeedExitRequestDto {
  exit: {
    quantity: number;
    reason: string;
    occurred_on: string;
  };
}
