import { Pencil, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';
import { HistoryList } from '@/shared/components/HistoryList';
import { formatDate } from '@/shared/utils/format-date';

import { terrainStatusLabels } from '../components/TerrainStatusBadge';
import { TerrainSummaryCard } from '../components/TerrainSummaryCard';
import type { TerrainStateDetails } from '../models/terrain-details.model';
import { useTerrainDetailsViewModel } from '../viewmodels/use-terrain-details-view-model';

function getSummaryText(stateDetails: TerrainStateDetails) {
  switch (stateDetails.status) {
    case 'occupied':
      return {
        label: 'Grupo atual',
        title: stateDetails.currentGroup?.name ?? 'Terreno ocupado',
        caption: stateDetails.enteredAt
          ? `Entrada: ${formatDate(stateDetails.enteredAt)}`
          : 'Informação de entrada indisponível',
      };

    case 'resting':
      return {
        label: 'Período de descanso',
        title: `${stateDetails.remainingRestDays} ${
          stateDetails.remainingRestDays === 1
            ? 'dia restante'
            : 'dias restantes'
        }`,
        caption: stateDetails.lastGroup?.name
          ? `Último grupo: ${stateDetails.lastGroup.name}`
          : 'Último grupo indisponível',
      };

    case 'available':
      return {
        label: 'Última ocupação',
        title: stateDetails.lastGroup?.name ?? 'Nenhuma ocupação anterior',
        caption: stateDetails.lastOccupation
          ? `Livre desde: ${formatDate(stateDetails.lastOccupation.endedAt)}`
          : 'Sem ocupações registradas',
      };
  }
}

export default function TerrainDetailsView() {
  const {
    terrain,
    stateDetails,
    showAllocateGroup,
    history,
    isHistoryLoading,
    hasHistoryError,
    retryHistory,
    isLoading,
    loadError,
    isUnavailable,
    isDeleteModalOpen,
    isDeleting,
    deleteError,
    goBack,
    retry,
    handleAllocateGroup,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useTerrainDetailsViewModel();

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary
        title={terrain?.name ?? 'Terreno'}
        onBackPress={goBack}
        menuDisabled={isLoading || isUnavailable || isDeleting || !!loadError}
        menuItems={[
          {
            label: 'Editar',
            icon: Pencil,
            onPress: handleEdit,
          },

          ...(stateDetails?.status !== 'occupied'
            ? [
                {
                  label: 'Deletar',
                  icon: Trash2,
                  onPress: handleDelete,
                  destructive: true,
                },
              ]
            : []),
        ]}
      />

      {isLoading ? (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator />
        </View>
      ) : loadError ? (
        <View className='flex-1 items-center justify-center gap-4 px-5'>
          <AppText color='error' align='center'>
            Não foi possível carregar o terreno.
          </AppText>

          <Button onPress={retry}>Tentar novamente</Button>
        </View>
      ) : isUnavailable ? (
        <View className='flex-1 items-center justify-center'>
          <AppText color='muted'>Terreno não encontrado.</AppText>
        </View>
      ) : terrain && stateDetails ? (
        <ScrollView
          className='flex-1'
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 32,
            gap: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <TerrainSummaryCard
            status={stateDetails.status}
            statusLabel={terrainStatusLabels[stateDetails.status]}
            restDays={terrain.restDays}
            {...getSummaryText(stateDetails)}
          />

          {showAllocateGroup && (
            <Button size='md' onPress={handleAllocateGroup}>
              Alocar Grupo
            </Button>
          )}

          <HistoryList
            title={
              stateDetails.status === 'occupied'
                ? 'Histórico de ocupações'
                : 'Histórico'
            }
            items={history}
            emptyMessage='Nenhuma ocupação registrada neste terreno.'
            isLoading={isHistoryLoading}
            hasError={hasHistoryError}
            onRetry={retryHistory}
          />
        </ScrollView>
      ) : null}

      <ConfirmDeleteModal
        visible={isDeleteModalOpen}
        title='Excluir Terreno?'
        description={
          deleteError
            ? 'Não foi possível excluir o terreno. Tente novamente.'
            : `Deseja realmente excluir o terreno "${terrain?.name ?? ''}"? Essa ação não pode ser revertida.`
        }
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
