import { ChevronLeft, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IGroupHeaderProps {
  groupName: string;
  onBack: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  actionsDisabled?: boolean;
}

export function GroupHeader({
  groupName,
  onBack,
  onUpdate,
  onDelete,
  actionsDisabled = false,
}: IGroupHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleUpdate() {
    setIsMenuOpen(false);
    onUpdate();
  }

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete();
  }

  return (
    <View className='relative z-10'>
      <View className='h-[56px] flex-row items-center bg-black-700 px-3'>
        <Pressable
          onPress={onBack}
          className='h-10 w-10 items-center justify-center'
          accessibilityLabel='Voltar'
        >
          <ChevronLeft
            size={22}
            color={colors.white}
          />
        </Pressable>

        <AppText
          color='white'
          weight='medium'
          className='flex-1'
        >
          {groupName}
        </AppText>

        <Pressable
          onPress={() => setIsMenuOpen((value) => !value)}
          className='h-10 w-10 items-center justify-center'
          accessibilityLabel='Opções do grupo'
          disabled={actionsDisabled}
        >
          <MoreVertical
            size={22}
            color={colors.white}
          />
        </Pressable>
      </View>

      {isMenuOpen && !actionsDisabled && (
        <View className='absolute right-3 top-[52px] w-[180px] overflow-hidden rounded-[10px] border border-gray-400 bg-white'>
          <Pressable
            onPress={handleUpdate}
            className='px-4 py-3'
          >
            <AppText size='sm'>
              Atualizar grupo
            </AppText>
          </Pressable>

          <View className='h-px bg-gray-400' />

          <Pressable
            onPress={handleDelete}
            className='px-4 py-3'
          >
            <AppText
              size='sm'
              color='error'
            >
              Excluir grupo
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
