import { ActivityIndicator, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
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
    retry,
    handleBack,
    handleUpdate,
    handleDelete,
  } = useGroupViewModel();

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary
        title={group?.name ?? ''}
        onBackPress={handleBack}
        menuDisabled={actionsDisabled}
        menuItems={[
          { label: 'Atualizar grupo', onPress: handleUpdate },
          { label: 'Excluir grupo', onPress: handleDelete, destructive: true },
        ]}
      />

      <SafeAreaView edges={['bottom']} className='flex-1'>
        <View className='px-4 pt-4'>
          {isLoading ? (
            <ActivityIndicator />
          ) : error ? (
            <>
              <AppText color='error'>Não foi possível carregar o grupo.</AppText>
              <Button onPress={retry}>Tentar novamente</Button>
            </>
          ) : group ? (
            <AppText size='sm' color='muted'>Quantidade de animais: {group.animalCount}</AppText>
          ) : (
            <AppText>Grupo de animais não encontrado.</AppText>
          )}
          {isDeleting && <ActivityIndicator />}
          {deleteError && (
            <AppText color='error'>Não foi possível excluir o grupo. Tente novamente.</AppText>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
