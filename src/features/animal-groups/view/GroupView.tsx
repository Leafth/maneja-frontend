import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';
import { HistoryList } from '@/shared/components/HistoryList';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@/shared/components/SegmentedControl';
import { formatDaysAgo } from '@/shared/utils/format-date';
import colors from '@/styles/colors';

import type { AnimalGroupHistoryKind } from '../models';
import { useGroupViewModel } from '../viewmodels/use-group-view-model';

const historyOptions: SegmentedControlOption<AnimalGroupHistoryKind>[] = [
  { value: 'movements', label: 'Movimentações' },
  { value: 'feeding', label: 'Alimentação' },
];

const emptyHistoryMessages: Record<AnimalGroupHistoryKind, string> = {
  movements: 'Nenhuma movimentação registrada para este grupo.',
  feeding: 'Nenhuma alimentação registrada para este grupo.',
};

interface IInfoColumnProps {
  label: string;
  children: React.ReactNode;
}

function InfoColumn({ label, children }: IInfoColumnProps) {
  return (
    <View className='flex-1 items-center gap-2'>
      <AppText className='text-neutral-textMuted'>{label}</AppText>
      {children}
    </View>
  );
}

export default function GroupView() {
  const {
    group,
    currentTerrain,
    isCurrentTerrainLoading,
    hasCurrentTerrainError,
    historyKind,
    setHistoryKind,
    history,
    isHistoryLoading,
    hasHistoryError,
    retryHistory,
    isLoading,
    error,
    deleteError,
    isDeleting,
    actionsDisabled,
    isDeleteModalOpen,
    retry,
    handleBack,
    handleUpdate,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useGroupViewModel();

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary
        title={group?.name ?? 'Grupo'}
        onBackPress={handleBack}
        menuDisabled={actionsDisabled}
        menuItems={
          group
            ? [
                {
                  label: 'Editar',
                  icon: Pencil,
                  onPress: handleUpdate,
                },
                {
                  label: 'Deletar',
                  icon: Trash2,
                  onPress: handleDelete,
                  destructive: true,
                },
              ]
            : undefined
        }
      />

      <SafeAreaView edges={['bottom']} className='flex-1'>
        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className='flex-1 items-center justify-center gap-4 px-5'>
            <AppText color='error' align='center'>
              Não foi possível carregar o grupo.
            </AppText>

            <Button onPress={retry}>Tentar novamente</Button>
          </View>
        ) : group ? (
          <ScrollView
            className='flex-1'
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 32,
              gap: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className='flex-row'>
              <InfoColumn label='Quantidade'>
                <AppText weight='medium' className='text-neutral-textHead'>
                  {group.animalCount}{' '}
                  {group.animalCount === 1 ? 'cabeça' : 'cabeças'}
                </AppText>
              </InfoColumn>

              <InfoColumn label='Terreno atual'>
                {isCurrentTerrainLoading ? (
                  <ActivityIndicator size='small' />
                ) : (
                  <AppText
                    weight='medium'
                    align='center'
                    className='text-neutral-textHead'
                  >
                    {hasCurrentTerrainError
                      ? '—'
                      : currentTerrain
                        ? currentTerrain.enteredAt
                          ? `${currentTerrain.name} · ${formatDaysAgo(currentTerrain.enteredAt)}`
                          : currentTerrain.name
                        : 'Sem alocação'}
                  </AppText>
                )}
              </InfoColumn>
            </View>

            {/* Necessidade alimentar fica para outra sprint. */}
            <View className='items-center'>
              <Button size='md' disabled>
                <View className='flex-row items-center gap-2'>
                  <AppText size='sm' weight='medium' color='white'>
                    Cadastrar Necessidade Alimentar
                  </AppText>

                  <Plus size={18} strokeWidth={2} color={colors.white} />
                </View>
              </Button>
            </View>

            <View className='h-px bg-neutral-border' />

            <SegmentedControl
              options={historyOptions}
              value={historyKind}
              onChange={setHistoryKind}
            />

            <HistoryList
              title='Histórico'
              items={history}
              emptyMessage={emptyHistoryMessages[historyKind]}
              isLoading={isHistoryLoading}
              hasError={hasHistoryError}
              onRetry={retryHistory}
            />
          </ScrollView>
        ) : (
          <View className='flex-1 items-center justify-center'>
            <AppText color='muted'>Grupo de animais não encontrado.</AppText>
          </View>
        )}
      </SafeAreaView>

      <ConfirmDeleteModal
        visible={isDeleteModalOpen}
        title='Excluir Grupo?'
        description={
          deleteError
            ? 'Não foi possível excluir o grupo. Tente novamente.'
            : `Deseja realmente excluir o grupo "${group?.name ?? ''}"? Essa ação não pode ser revertida.`
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
