import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { GroupHeader } from '@/shared/components/GroupHeader';
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
    <SafeAreaView
      edges={['top']}
      className='flex-1 bg-black-700'
    >
      <View className='flex-1 bg-white'>
        <GroupHeader
          groupName={group?.name ?? ''}
          onBack={handleBack}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          actionsDisabled={actionsDisabled}
        />
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
      </View>
    </SafeAreaView>
  );
}
