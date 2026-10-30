import { Pencil, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';

import { FeedActionButton } from '../components/FeedActionButton';
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
          <View className='rounded-2xl border border-gray-400 p-1'>
            <View className='gap-1 rounded-xl bg-gray-100 p-4'>
              <AppText size='sm' color='muted'>
                Total disponível
              </AppText>

              <AppText>{type.availableKg}kg</AppText>
            </View>
          </View>

          <View className='mt-4 flex-row gap-4'>
            <FeedActionButton onPress={addEntry} className='flex-1'>
              ＋ Entrada
            </FeedActionButton>

            <FeedActionButton onPress={addExit} secondary className='flex-1'>
              − Saída
            </FeedActionButton>
          </View>

          <AppText color='muted' weight='semiBold' className='mt-6'>
            Histórico
          </AppText>

          <View className='mt-2'>
            {movements.length > 0 ? (
              movements.map((movement, index) => (
                <View key={movement.localId}>
                  <FeedHistoryItem movement={movement} />

                  {index < movements.length - 1 && (
                    <View className='h-px bg-gray-300' />
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
