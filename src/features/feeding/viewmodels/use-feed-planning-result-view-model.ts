import { useNetInfo } from '@react-native-community/netinfo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import {
  useFeedPlanning,
  useFeedRequirementItems,
  useFeedingAccount,
  useFeedingGroups,
} from '../hooks';
import type { FeedPlanning } from '../models/feed-planning.model';
import type { PlanningPeriod } from '../schemas/feed-planning.schema';
import { scaledToKgLabel } from '../utils/feed-decimal';
import { buildFeedPlanningRequest } from '../utils/feed-planning-request';

export function useFeedPlanningResultViewModel() {
  const router = useRouter();
  const network = useNetInfo();

  const { groupId } = useLocalSearchParams<{
    groupId?: string | string[];
  }>();

  const groupLocalId = typeof groupId === 'string' ? groupId : '';

  const [period, setPeriod] = useState<PlanningPeriod>('15');

  const [customDays, setCustomDays] = useState('');

  const [result, setResult] = useState<FeedPlanning | null>(null);

  const account = useFeedingAccount();

  const groupsQuery = useFeedingGroups(account.accountId);

  const group =
    groupsQuery.data?.find((item) => item.localId === groupLocalId) ?? null;

  const planning = useFeedPlanning(account.accountId);

  const feedingNeeds = useFeedRequirementItems(
    groupLocalId,
    group?.animalCount ?? 0,
  );

  const isOnline =
    network.isConnected === true && network.isInternetReachable !== false;

  const selectedDays =
    period === 'custom' ? Number(customDays) : Number(period);

  const hasValidCustomDays =
    period !== 'custom' ||
    (/^\d+$/.test(customDays.trim()) && Number(customDays) > 0);

  useEffect(() => {
    const remoteId = group?.remoteId;

    if (!isOnline || !remoteId || !hasValidCustomDays || selectedDays <= 0) {
      return;
    }

    let cancelled = false;

    async function calculate() {
      try {
        const response = await planning.mutateAsync(
          buildFeedPlanningRequest(remoteId!, selectedDays),
        );

        if (!cancelled) {
          setResult(response.result);
        }
      } catch {
        if (!cancelled) {
          setResult(null);
        }
      }
    }

    void calculate();

    return () => {
      cancelled = true;
    };
  }, [group?.remoteId, selectedDays, isOnline, hasValidCustomDays]);

  const onlineItems = useMemo(
    () =>
      (result?.items ?? []).map((item) => {
        const isSufficient = item.status.state === 'sufficient';

        const missingScaled =
          item.status.state === 'shortage' ? item.status.missingScaled : 0;

        const remainingScaled =
          item.status.state === 'sufficient' ? item.status.remainingScaled : 0;

        return {
          id: item.feedRemoteId,

          feedName: item.feedName,

          requiredLabel: scaledToKgLabel(item.requiredScaled),

          stockLabel: scaledToKgLabel(item.stockScaled),

          missingLabel: scaledToKgLabel(missingScaled),

          remainingLabel: scaledToKgLabel(remainingScaled),

          requiredScaled: item.requiredScaled,

          stockScaled: item.stockScaled,

          globalRequiredScaled: item.globalRequiredScaled,

          groups: item.groups,

          coverage:
            item.requiredScaled > 0
              ? Math.min(item.stockScaled / item.requiredScaled, 1)
              : 1,

          sufficient: isSufficient,
        };
      }),
    [result],
  );

  const offlineItems = useMemo(
    () =>
      feedingNeeds.items.map((requirement) => {
        const feed = feedingNeeds.feeds.find(
          (item) => item.localId === requirement.feedLocalId,
        );

        const dailyRequiredScaled =
          requirement.quantityPerAnimalScaled * (group?.animalCount ?? 0);

        const stockScaled = feed?.projectedStockScaled ?? 0;

        const daysRemaining =
          dailyRequiredScaled > 0
            ? Math.floor(stockScaled / dailyRequiredScaled)
            : null;

        return {
          id: requirement.localId,

          feedName: requirement.name,

          stockLabel: scaledToKgLabel(stockScaled),

          dailyRequiredLabel: scaledToKgLabel(dailyRequiredScaled),

          daysRemaining,

          stockScaled,

          dailyRequiredScaled,
        };
      }),
    [feedingNeeds.items, feedingNeeds.feeds, group?.animalCount],
  );

  const hasGroupsError = account.isError || groupsQuery.isError;

  const hasLocalDataError = feedingNeeds.hasError;

  const isInitialLoading =
    account.isLoading || groupsQuery.isLoading || feedingNeeds.isLoading;

  const planningError =
    planning.error instanceof Error
      ? planning.error.message
      : planning.error
        ? 'Não foi possível calcular o planejamento.'
        : null;

  function handlePeriodChange(value: PlanningPeriod) {
    setPeriod(value);

    if (value !== 'custom') {
      setCustomDays('');
      setResult(null);
    }
  }

  function handleCustomDaysChange(value: string) {
    const sanitized = value.replace(/\D/g, '');

    setCustomDays(sanitized);
    setResult(null);
  }

  function retry() {
    void groupsQuery.refetch();
    feedingNeeds.retry();

    if (isOnline && group?.remoteId && hasValidCustomDays && selectedDays > 0) {
      void planning
        .mutateAsync(buildFeedPlanningRequest(group.remoteId, selectedDays))
        .then((response) => {
          setResult(response.result);
        })
        .catch(() => {
          setResult(null);
        });
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/herd');
    }
  }

  return {
    groupName: group?.name ?? '',

    animalCount: group?.animalCount ?? 0,

    period,
    customDays,
    selectedDays,

    handlePeriodChange,
    handleCustomDaysChange,

    isOnline,

    status: result?.status.state ?? null,

    shortageCount: result?.status.shortageCount ?? 0,

    items: onlineItems,

    offlineItems,

    isLoading: isInitialLoading || (isOnline && planning.isPending),

    hasError: hasGroupsError || hasLocalDataError,

    planningError,

    hasResult: result !== null,

    hasValidCustomDays,

    retry,
    goBack,
  };
}
