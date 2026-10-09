import { Pencil, Trash2 } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { ConfirmDeleteModal } from '@/shared/components/ConfirmDeleteModal';
import { HeaderSecondary } from '@/shared/components/Header';

import { useGroupViewModel } from '../viewmodels/use-group-view-model';

export default function GroupView() {
  const {
    group,
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
    <View className="flex-1 bg-white">
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

      <SafeAreaView edges={['bottom']} className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center gap-4 px-5">
            <AppText color="error" align="center">
              Não foi possível carregar o grupo.
            </AppText>

            <Button onPress={retry}>
              Tentar novamente
            </Button>
          </View>
        ) : group ? (
          <View className="flex-1 items-center justify-center px-5">
            <AppText
              size="base"
              weight="medium"
              align="center"
              className="uppercase"
            >
              GRUPO ESPECÍFICO
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
              Quantidade de animais: {group.animalCount}
            </AppText>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <AppText color="muted">
              Grupo de animais não encontrado.
            </AppText>
          </View>
        )}
      </SafeAreaView>

      <ConfirmDeleteModal
        visible={isDeleteModalOpen}
        title="Excluir Grupo?"
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
