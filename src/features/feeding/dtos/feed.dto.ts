export interface FeedDto {
  id: string;
  name: string;
  stock_quantity: string;
  created_at: string;
  updated_at: string;
}

export interface FeedListMetaDto {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

export interface FeedListResponseDto {
  data: FeedDto[];
  meta: FeedListMetaDto;
}

export interface FeedListQueryDto {
  name?: string;

  min_stock_quantity?: number;
  max_stock_quantity?: number;

  sort?: 'name' | 'stock_quantity' | 'created_at';

  direction?: 'asc' | 'desc';

  page?: number;
  per_page?: number;
}

export interface CreateFeedRequestDto {
  feed: {
    name: string;
    initial_stock_quantity: number;
  };
}

export interface UpdateFeedRequestDto {
  feed: {
    name: string;
  };
}
