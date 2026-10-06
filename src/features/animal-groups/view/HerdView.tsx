import { Plus } from 'lucide-react-native';
import { Image, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import imageGroup from '@/assets/images/group-terreno-bg/image.png';

import { AppText } from '@/shared/components/AppText';
import { BottomNavigation } from '@/shared/components/BottomNavigation';
import { HerdCard } from '@/shared/components/HerdCard';
import { OnlineStatus } from '@/shared/components/OnlineStatus';
import colors from '@/styles/colors';
import { useRouter } from 'expo-router';

const herds = [
  {
    id: '1',
    name: 'Grupo A',
    location: 'Curral Sul',
  },
  {
    id: '2',
    name: 'Grupo B',
    location: 'Fazenda Nova',
  },
  {
    id: '3',
    name: 'Grupo C',
    location: 'Sítio Verde',
  },
];

export default function HerdView() {
  const router = useRouter();
  const hasHerds = herds.length > 0;

  function handleAddHerd() {
    router.push('/create-group');
  }

  function handleRegisterFeeding(herdId: string) {
    console.log('Registrar alimentação:', herdId);
  }

  function handleMove(herdId: string) {
    console.log('Mover grupo:', herdId);
  }

  return (
    <View className='flex-1 bg-white'>
      {/* Cabeçalho */}
      <SafeAreaView edges={['top']} className='bg-lime-400'>
        <View className='h-[64px] px-4'>
          <View className='flex-1 flex-row items-center justify-between'>
            <View className='h-10 w-10 items-center justify-center rounded-full bg-lime-600'>
              <AppText
                size='sm'
                weight='medium'
                color='white'
              >
                TA
              </AppText>
            </View>

            <OnlineStatus isOnline />
          </View>
        </View>
      </SafeAreaView>

      {/* Conteúdo */}
      <View className='flex-1'>
        <View className='px-5 pt-3'>
          <AppText
            size='sm'
            weight='medium'
            className='uppercase'
          >
            REBANHO
          </AppText>

          {!hasHerds ? (
            <View className='mt-2'>
              <AppText size='sm' color='muted'>
                Nada por aqui!
              </AppText>

              <AppText size='sm' color='muted'>
                Cadastre seu primeiro rebanho.
              </AppText>
            </View>
          ) : (
            <AppText size='sm' color='muted' className='mt-2'>
              Cadastre seus grupos de animais.
            </AppText>
          )}
        </View>

        {hasHerds ? (
          <View className='mt-5 flex-1 px-5'>
            <View className='gap-3'>
              {herds.map((herd) => (
                <HerdCard
                  key={herd.id}
                  name={herd.name}
                  location={herd.location}
                  onPress={() => router.push('/group')}
                  onRegisterFeeding={() =>
                    handleRegisterFeeding(herd.id)
                  }
                  onMove={() => handleMove(herd.id)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View className='flex-1 items-center justify-center'>
            <Image
              source={imageGroup}
              resizeMode='contain'
              className='h-[270px] w-[270px]'
            />
          </View>
        )}

        {/* Botão adicionar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddHerd}
          className='absolute bottom-5 right-5 h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-lime-500'
        >
          <Plus
            size={28}
            strokeWidth={2}
            color={colors.lime[800]}
          />
        </TouchableOpacity>
      </View>

      {/* Navegação */}
      <BottomNavigation activeItem='herd' />
    </View>
  );
}
