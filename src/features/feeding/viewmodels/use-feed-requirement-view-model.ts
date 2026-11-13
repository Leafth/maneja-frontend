import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAnimalGroup } from '@/features/animal-groups/hooks';

import { useDeleteFeedRequirement } from '../hooks/use-delete-feed-requirement';
import { useFeedRequirementItems } from '../hooks/use-feed-requirement-items';
import { useSaveFeedRequirement } from '../hooks/use-save-feed-requirement';
import { feedRequirementSchema, type FeedRequirementFormData } from '../schemas/feeding.schema';
import { decimalStringToScaled, scaledToDisplay } from '../utils/feed-decimal';

export function useFeedRequirementViewModel() {
  const router = useRouter();
  const { localId } = useLocalSearchParams<{ localId?: string | string[] }>();
  const groupLocalId = typeof localId === 'string' ? localId : '';
  const groupQuery = useAnimalGroup(groupLocalId);
  const group = groupQuery.data?.syncStatus === 'pending_delete' ? null : groupQuery.data;
  const data = useFeedRequirementItems(groupLocalId, group?.animalCount ?? 0);
  const save = useSaveFeedRequirement(data.accountId, groupLocalId);
  const remove = useDeleteFeedRequirement(data.accountId, groupLocalId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { control, handleSubmit, reset, setError } = useForm<FeedRequirementFormData>({
    resolver: zodResolver(feedRequirementSchema),
    defaultValues: { feedLocalId: '', quantityKg: '' },
  });
  const isBusy = save.isPending || remove.isPending;
  const feedOptions = data.feeds
    .filter((feed) => !data.items.some((item) => item.feedLocalId === feed.localId && item.localId !== editingId))
    .map((feed) => ({ value: feed.localId, label: feed.name }));

  function cancelEdit() {
    setEditingId(null);
    reset({ feedLocalId: '', quantityKg: '' });
    save.reset();
  }

  const onSubmit = handleSubmit((values) => {
    if (isBusy || !group || !data.accountId) {
      return;
    }
    if (!feedOptions.some((feed) => feed.value === values.feedLocalId)) {
      setError('feedLocalId', { message: 'Selecione uma ração disponível para este grupo' });
      return;
    }
    save.mutate({
      localId: editingId ?? undefined,
      feedLocalId: values.feedLocalId,
      quantityPerAnimalScaled: decimalStringToScaled(values.quantityKg),
    }, { onSuccess: cancelEdit });
  });

  return {
    control,
    group,
    items: data.items,
    feedOptions,
    editingId,
    isBusy,
    isSaving: save.isPending,
    isDeleting: remove.isPending,
    saveError: save.error?.message,
    deleteError: remove.error?.message,
    deletingItem: data.items.find((item) => item.localId === deletingId),
    isLoading: groupQuery.isLoading || data.isLoading,
    hasError: groupQuery.isError || data.hasError,
    retry: () => { void groupQuery.refetch(); data.retry(); },
    onSubmit,
    cancelEdit,
    startEdit: (id: string) => {
      const item = data.items.find((requirement) => requirement.localId === id);
      if (!item || !item.canEdit || isBusy) {
        return;
      }
      save.reset();
      setEditingId(id);
      reset({ feedLocalId: item.feedLocalId, quantityKg: scaledToDisplay(item.quantityPerAnimalScaled) });
    },
    requestDelete: (id: string) => { remove.reset(); setDeletingId(id); },
    cancelDelete: () => { if (!remove.isPending) { setDeletingId(null); remove.reset(); } },
    confirmDelete: () => {
      if (!deletingId || isBusy) {
        return;
      }
      remove.mutate(deletingId, { onSuccess: () => {
        if (editingId === deletingId) { cancelEdit(); }
        setDeletingId(null);
      } });
    },
    goBack: () => {
      if (router.canGoBack()) { router.back(); }
      else { router.replace('/herd'); }
    },
  };
}
