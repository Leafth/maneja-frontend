import { Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import imageGroup from '@/assets/images/group-terreno-bg/image.png';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderPrimary } from '@/shared/components/Header';
import { HerdCard } from '@/shared/components/HerdCard';
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
    handleRegisterFeeding,
    handleMove,
  } = useHerdViewModel();
  const hasHerds = herds.length > 0;

  return (
    <View className='flex-1 bg-white'>

      <HeaderPrimary isOnline={isOnline} />

      {/* Conteúdo */}
      <View className='flex-1'>
        <View className='px-5 pt-3'>
          <AppText
            size='lg'
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
          className='absolute bottom-5 right-5 h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-forestGreen-400'
        >
          <Plus
            size={28}
            strokeWidth={2}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
