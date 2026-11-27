import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { useFeedPlanning, useFeedingAccount, useFeedingGroups } from '../hooks';
import {
  feedPlanningSchema,
  type FeedPlanningFormData,
  type PlanningPeriod,
} from '../schemas/feed-planning.schema';
import { buildFeedPlanningRequest } from '../utils/feed-planning-request';

export function useFeedPlanningViewModel() {
  const router = useRouter();

  const { groupId } = useLocalSearchParams<{
    groupId?: string | string[];
  }>();

  const initialGroupLocalId = typeof groupId === 'string' ? groupId : '';

  const account = useFeedingAccount();

  const groupsQuery = useFeedingGroups(account.accountId);

  const planning = useFeedPlanning(account.accountId);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    clearErrors,
    setError,
    formState: { isValid, isSubmitting },
  } = useForm<FeedPlanningFormData>({
    resolver: zodResolver(feedPlanningSchema),
    mode: 'onTouched',
    defaultValues: {
      period: '7',
      customDays: '',
      groupLocalId: initialGroupLocalId,
    },
  });

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? []).map((group) => ({
        value: group.localId,
        label: group.name,
      })),
    [groupsQuery.data],
  );

  const submit = handleSubmit(
    async ({ period: selected, customDays, groupLocalId }) => {
      const days = selected === 'custom' ? customDays.trim() : selected;

      const group = groupsQuery.data?.find(
        (item) => item.localId === groupLocalId,
      );

      if (!group?.remoteId) {
        setError('groupLocalId', {
          message:
            'Este grupo ainda não foi sincronizado. Conecte-se à internet e tente novamente.',
        });

        return;
      }

      try {
        await planning.mutateAsync(
          buildFeedPlanningRequest(group.remoteId, Number(days)),
        );
      } catch {
        return;
      }

      router.push({
        pathname: '/feeding/planning',
        params: {
          groupId: groupLocalId,
        },
      });
    },
  );

  const planningError = planning.error;

  const submitError = planningError
    ? planningError instanceof Error && !isAxiosError(planningError)
      ? planningError.message
      : 'Não foi possível calcular o planejamento. Tente novamente.'
    : null;

  return {
    control,
    groupOptions,

    isGroupsLoading: account.isLoading || groupsQuery.isLoading,

    hasGroupsError: account.isError || groupsQuery.isError,

    retryGroups: () => {
      void groupsQuery.refetch();
    },

    handlePeriodChange: (value: PlanningPeriod) => {
      setValue('period', value, {
        shouldValidate: true,
      });

      if (value === 'custom') {
        clearErrors('customDays');
      } else {
        void trigger('customDays');
      }
    },

    canSubmit: isValid,
    isSubmitting,
    submitError,

    onSubmit: () => {
      if (isSubmitting) {
        return;
      }

      void submit();
    },
  };
}
