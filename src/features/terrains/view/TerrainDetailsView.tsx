import { Pencil, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';

import { useTerrainDetailsViewModel } from '../viewmodels/use-terrain-details-view-model';

export default function TerrainDetailsView() {
  const {
    terrain,
    isLoading,
    loadError,
    isUnavailable,
    isDeleteModalOpen,
    isDeleting,
    deleteError,
    goBack,
    retry,
    handleEdit,
    handleDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useTerrainDetailsViewModel();

  return (
    <View className="flex-1 bg-white">
      <HeaderSecondary
        title={terrain?.name ?? 'Terreno'}
        onBackPress={goBack}
        menuDisabled={
          isLoading || isUnavailable || isDeleting || !!loadError
        }
        menuItems={[
          {
            label: 'Editar',
            icon: Pencil,
            onPress: handleEdit,
          },
          {
            label: 'Deletar',
            icon: Trash2,
            onPress: handleDelete,
            destructive: true,
          },
        ]}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : loadError ? (
        <View className="flex-1 items-center justify-center gap-4 px-5">
          <AppText color="error" align="center">
            Não foi possível carregar o terreno.
          </AppText>

          <Button onPress={retry}>Tentar novamente</Button>
        </View>
      ) : isUnavailable ? (
        <View className="flex-1 items-center justify-center">
          <AppText color="muted">
            Terreno não encontrado.
          </AppText>
        </View>
      ) : terrain ? (
        <View className="flex-1 items-center justify-center px-5">
          <AppText
            size="base"
            weight="medium"
            align="center"
            className="uppercase"
          >
            TERRENO ESPECÍFICO
          </AppText>

          <AppText
            size="base"
            weight="medium"
            align="center"
          >
            (EM CONSTRUÇÃO)
          </AppText>

          <AppText
            size="sm"
            color="muted"
            align="center"
            className="mt-2"
          >
            Período de descanso: {terrain.restDays} dias
          </AppText>
        </View>
      ) : null}

      <ConfirmDeleteModal
        visible={isDeleteModalOpen}
        title="Excluir Terreno?"
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
