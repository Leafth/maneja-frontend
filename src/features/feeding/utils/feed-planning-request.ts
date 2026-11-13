import type { FeedPlanningRequestDto } from '../dtos/feed-planning.dto';
import { toDateOnly } from './feed-date';

/**
 * Planejamento de um grupo para N dias a partir de hoje, contando o dia
 * inicial e o final (7 dias = hoje até hoje + 6).
 */
export function buildFeedPlanningRequest(
  groupRemoteId: string,
  days: number,
): FeedPlanningRequestDto {
  const start = new Date();
  const end = new Date(start);

  end.setDate(start.getDate() + days - 1);

  return {
    feed_planning: {
      start_date: toDateOnly(start),
      end_date: toDateOnly(end),
      scope: 'group',
      group_id: groupRemoteId,
    },
  };
}
