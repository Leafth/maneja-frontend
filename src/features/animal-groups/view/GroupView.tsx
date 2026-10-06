import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { GroupHeader } from '../../../shared/components/GroupHeader';
import { useRouter } from 'expo-router';

export default function GroupView() {
  const router = useRouter();

  function handleBack() {
    router.back();
  }

  function handleUpdate() {
    // atualizar grupo
  }

  function handleDelete() {
    // excluir grupo
  }

  return (
    <SafeAreaView
      edges={['top']}
      className='flex-1 bg-black-700'
    >
      <View className='flex-1 bg-white'>
        <GroupHeader
          groupName='Grupo Bovino A'
          onBack={handleBack}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
}
