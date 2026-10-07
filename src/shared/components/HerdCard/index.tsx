import { ChevronRight, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IHerdCardProps {
  name: string;
  location: string;
  onPress: () => void;
  onRegisterFeeding: () => void;
  onMove: () => void;
}

export function HerdCard({
  name,
  location,
  onPress,
  onRegisterFeeding,
  onMove,
}: IHerdCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className='rounded-[14px] border border-gray-400 bg-white px-5 py-4'
    >
      <AppText size='lg' weight='medium'>
        {name}
      </AppText>

      <AppText color='muted' className='mt-1'>
        Em: {location}
      </AppText>

      <View className='mt-6 flex-row items-center justify-between'>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onRegisterFeeding();
          }}
          className='flex-row items-center rounded-[10px] bg-lime-500 px-3.5 py-2.5'
        >
          <AppText size='sm' weight='medium'>
            Registrar Alimentação
          </AppText>

          <Plus size={18} strokeWidth={2} color={colors.black[700]} />
        </Pressable>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onMove();
          }}
          className='ml-3 flex-row items-center rounded-[10px] bg-[#5B87E5] px-4 py-2.5'
        >
          <AppText
            size='sm'
            weight='medium'
            style={{ color: colors.black[700] }}
          >
            Mover
          </AppText>

          <ChevronRight size={18} strokeWidth={2} color={colors.black[700]} />
        </Pressable>
      </View>
    </Pressable>
  );
}
