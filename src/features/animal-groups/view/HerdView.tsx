import { Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import imageGroup from '@/assets/images/group-terreno-bg/image.png';

import { AppText } from '@/shared/components/AppText';
import { BottomNavigation } from '@/shared/components/BottomNavigation';
import { Button } from '@/shared/components/Button';
import { HerdCard } from '@/shared/components/HerdCard';
import { OnlineStatus } from '@/shared/components/OnlineStatus';
import colors from '@/styles/colors';
import { useHerdViewModel } from '../viewmodels/use-herd-view-model';

export default function HerdView() {
  const {
    herds,
    isLoading,
    error,
    retry,
    isOnline,
    handleAddHerd,
    handleOpenGroup,
  } = useHerdViewModel();
  const hasHerds = herds.length > 0;

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

            <OnlineStatus isOnline={isOnline} />
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

          {isLoading ? (
            <ActivityIndicator className='mt-2' />
          ) : error ? (
            <View className='mt-2'>
              <AppText size='sm' color='error'>Não foi possível carregar os grupos.</AppText>
              <Button onPress={retry}>Tentar novamente</Button>
            </View>
          ) : !hasHerds ? (
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
          <ScrollView
            className='mt-5 flex-1 px-5'
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <View className='gap-3'>
              {herds.map((herd) => (
                <HerdCard
                  key={herd.localId}
                  name={herd.name}
                  location='—'
                  onPress={() => handleOpenGroup(herd.localId)}
                  onRegisterFeeding={() =>
                    handleRegisterFeeding(herd.localId)
                  }
                  onMove={() => handleMove(herd.localId)}
                />
              ))}
            </View>
          </ScrollView>
        ) : !isLoading && !error ? (
          <View className='flex-1 items-center justify-center'>
            <Image
              source={imageGroup}
              resizeMode='contain'
              className='h-[270px] w-[270px]'
            />
          </View>
        ) : null}

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
