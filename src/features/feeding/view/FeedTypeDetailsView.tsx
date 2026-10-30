import { Minus, Pencil, Plus, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';

import { FeedHistoryItem } from '../components/FeedHistoryItem';
import { useFeedTypeDetailsViewModel } from '../viewmodels/use-feed-type-details-view-model';

export default function FeedTypeDetailsView() {
  const {
    type,
    movements,
    isLoading,
    isError,
    retry,
    actionsDisabled,
    isDeleteModalOpen,
    isDeleting,
    deleteError,
    goBack,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
    addEntry,
    addExit,
  } = useFeedTypeDetailsViewModel();

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary
        title={type?.name ?? 'Tipo de ração'}
        onBackPress={goBack}
        menuDisabled={actionsDisabled}
        menuItems={type ? [
          { label: 'Editar', icon: Pencil, onPress: handleEdit },
          { label: 'Deletar', icon: Trash2, onPress: handleDelete, destructive: true },
        ] : undefined}
      />

      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <View className='flex-1 items-center justify-center gap-4 px-5'>
          <AppText color='error' align='center'>
            Não foi possível carregar o tipo de ração.
          </AppText>
          <Button onPress={retry}>Tentar novamente</Button>
        </View>
      ) : type ? (
        <View className='flex-1 px-4 pt-5'>
          <View className='rounded-[14px] border border-neutral-border bg-neutral-card p-2'>
            <View className='gap-1 rounded-[10px] bg-neutral-surface px-3 py-4'>
              <AppText size='sm' className='text-neutral-textMuted'>
                Total disponível
              </AppText>

              <AppText
                size='xl'
                weight='medium'
                className='text-neutral-textHead'
              >
                {type.availableKg} kg
              </AppText>
            </View>
          </View>

          <View className='mt-4 flex-row gap-4'>
            <View className='flex-1'>
              <Button
                variant='success'
                size='md'
                leftIcon={Plus}
                onPress={addEntry}
              >
                Entrada
              </Button>
            </View>

            <View className='flex-1'>
              <Button
                variant='danger'
                size='md'
                leftIcon={Minus}
                onPress={addExit}
              >
                Saída
              </Button>
            </View>
          </View>

          <AppText className='mt-6 text-neutral-textMuted'>Histórico</AppText>

          <View className='mt-2'>
            {movements.length > 0 ? (
              movements.map((movement, index) => (
                <View key={movement.localId}>
                  <FeedHistoryItem movement={movement} />

                  {index < movements.length - 1 && (
                    <View className='h-px bg-neutral-border' />
                  )}
                </View>
              ))
            ) : (
              <View className='py-8'>
                <AppText size='sm' color='muted' align='center'>
                  Nenhuma movimentação registrada.
                </AppText>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View className='flex-1 items-center justify-center'>
          <AppText color='muted'>Tipo de ração não encontrado.</AppText>
        </View>
      )}

      <ConfirmDeleteModal
        visible={isDeleteModalOpen}
        title='Excluir tipo de ração?'
        description={
          deleteError
            ? 'Não foi possível excluir o tipo de ração. Tente novamente.'
            : `Deseja realmente excluir o tipo de ração "${type?.name ?? ''}"? Essa ação não pode ser revertida.`
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
