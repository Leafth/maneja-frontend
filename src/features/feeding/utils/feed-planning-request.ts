import type { FeedPlanningRequestDto } from '../dtos/feed-planning.dto';
import { toDateOnly } from './feed-date';

function buildPeriod(days: number) {
  const start = new Date();
  const end = new Date(start);

  end.setDate(start.getDate() + days - 1);

  return {
    startDate: toDateOnly(start),
    endDate: toDateOnly(end),
  };
}

/**
 * Planejamento de um grupo para N dias a partir de hoje.
 */
export function buildFeedPlanningRequest(
  groupRemoteId: string,
  days: number,
): FeedPlanningRequestDto {
  const { startDate, endDate } = buildPeriod(days);

  return {
    feed_planning: {
      start_date: startDate,
      end_date: endDate,
      scope: 'group',
      group_id: groupRemoteId,
    },
  };
}

/**
 * Planejamento considerando todos os grupos da conta.
 */
export function buildAllFeedPlanningRequest(
  days: number,
): FeedPlanningRequestDto {
  const { startDate, endDate } = buildPeriod(days);

  return {
    feed_planning: {
      start_date: startDate,
      end_date: endDate,
      scope: 'all',
    },
  };
}
