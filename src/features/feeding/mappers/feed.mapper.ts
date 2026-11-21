import type { FeedDto } from '../dtos/feed.dto';
import { decimalStringToScaled } from '../utils/feed-decimal';

export interface RemoteFeedSnapshot {
  remoteId: string;

  name: string;

  remoteStockScaled: number;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}

export const feedMapper = {
  fromDto(dto: FeedDto): RemoteFeedSnapshot {
    return {
      remoteId: dto.id,

      name: dto.name,

      remoteStockScaled: decimalStringToScaled(
        dto.stock_quantity,
      ),

      remoteCreatedAt: dto.created_at,
      remoteUpdatedAt: dto.updated_at,
    };
  },
};
