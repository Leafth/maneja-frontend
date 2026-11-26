import { useNetInfo } from '@react-native-community/netinfo';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { useFeedPlanning, useFeedingAccount, useFeedingGroups } from '../hooks';
import type { FeedPlanning } from '../models/feed-planning.model';
import type { PlanningPeriod } from '../schemas/feed-planning.schema';
import { scaledToKgLabel } from '../utils/feed-decimal';
import { buildAllFeedPlanningRequest } from '../utils/feed-planning-request';

export function useFeedOverviewViewModel() {
  const router = useRouter();
  const network = useNetInfo();

  const account = useFeedingAccount();

  const groupsQuery = useFeedingGroups(account.accountId);

  const planning = useFeedPlanning(account.accountId);

  const [period, setPeriod] = useState<PlanningPeriod>('7');

  const [customDays, setCustomDays] = useState('');

  const [result, setResult] = useState<FeedPlanning | null>(null);

  const isOnline =
    network.isConnected === true && network.isInternetReachable !== false;

  const selectedDays =
    period === 'custom' ? Number(customDays) : Number(period);

  const hasValidCustomDays =
    period !== 'custom' ||
    (/^\d+$/.test(customDays.trim()) && Number(customDays) > 0);

  useEffect(() => {
    if (
      !account.accountId ||
      !isOnline ||
      !hasValidCustomDays ||
      selectedDays <= 0
    ) {
      return;
    }

    let cancelled = false;

    async function calculate() {
      try {
        const response = await planning.mutateAsync(
          buildAllFeedPlanningRequest(selectedDays),
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
  }, [account.accountId, selectedDays, isOnline, hasValidCustomDays]);

  const items = useMemo(() => {
    return (result?.items ?? []).map((item) => {
      const sufficient = item.status.state === 'sufficient';

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

        coverage:
          item.requiredScaled > 0
            ? Math.min(item.stockScaled / item.requiredScaled, 1)
            : 1,

        sufficient,

        groups: item.groups.map((group) => {
          const localGroup = groupsQuery.data?.find(
            (candidate) => candidate.remoteId === group.groupRemoteId,
          );

          return {
            remoteId: group.groupRemoteId,

            localId: localGroup?.localId ?? null,

            name: group.groupName,

            dailyRequiredLabel: `${scaledToKgLabel(
              group.dailyRequiredScaled,
            )}/dia`,
          };
        }),
      };
    });
  }, [result, groupsQuery.data]);

  const shortageItems = useMemo(
    () => items.filter((item) => !item.sufficient),
    [items],
  );

  const sufficientItems = useMemo(
    () => items.filter((item) => item.sufficient),
    [items],
  );

  const shortageCount = shortageItems.length;

  function handlePeriodChange(value: PlanningPeriod) {
    setPeriod(value);

    if (value !== 'custom') {
      setCustomDays('');
    }

    setResult(null);
  }

  function handleCustomDaysChange(value: string) {
    setCustomDays(value.replace(/\D/g, ''));

    setResult(null);
  }

  function openGroup(localId: string | null) {
    if (!localId) {
      return;
    }

    router.push(`/group/${localId}`);
  }

  function retry() {
    if (!isOnline || !hasValidCustomDays || selectedDays <= 0) {
      return;
    }

    void planning
      .mutateAsync(buildAllFeedPlanningRequest(selectedDays))
      .then((response) => {
        setResult(response.result);
      })
      .catch(() => {
        setResult(null);
      });
  }

  const errorMessage =
    planning.error instanceof Error
      ? planning.error.message
      : planning.error
        ? 'Não foi possível calcular a visão geral.'
        : null;

  return {
    period,
    customDays,
    selectedDays,

    handlePeriodChange,
    handleCustomDaysChange,

    isOnline,

    shortageItems,
    sufficientItems,
    shortageCount,

    hasResult: result !== null,

    hasValidCustomDays,

    isLoading: account.isLoading || planning.isPending,

    errorMessage,

    retry,
    openGroup,
  };
}
