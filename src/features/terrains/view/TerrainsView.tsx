import { Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderPrimary } from '@/shared/components/Header';
import colors from '@/styles/colors';

import { TerrainCard } from '../components/TerrainCard';
import { TerrainsEmptyState } from '../components/TerrainsEmptyState';
import type { Terrain } from '../models/terrain.model';
import { useTerrainsViewModel } from '../viewmodels/use-terrains-view-model';

export default function TerrainsView() {
  const {
    terrains,
    isLoading,
    error,
    retry,
    handleAddTerrain,
    handleOpenTerrain,
  } = useTerrainsViewModel();

  const hasTerrains = terrains.length > 0;
  const showEmptyState = !isLoading && !error && !hasTerrains;

  return (
    <View className='flex-1 bg-forestGreen-300'>
      <HeaderPrimary />

      <View className='flex-1 overflow-hidden rounded-t-3xl bg-white'>
        {/* Cabeçalho */}
        <View className='px-5 pt-3'>
          <AppText size='lg' weight='medium' className='uppercase'>
            TERRENOS
          </AppText>

          {isLoading ? (
            <ActivityIndicator className='mt-2' />
          ) : error ? (
            <View className='mt-2'>
              <AppText size='xl' color='error'>
                Não foi possível carregar os terrenos.
              </AppText>

              <Button onPress={retry}>Tentar novamente</Button>
            </View>
          ) : showEmptyState ? (
            <View className='mt-2'>
              <AppText size='sm' color='muted'>
                Você ainda não tem terrenos.
              </AppText>

              <AppText size='sm' color='muted'>
                Toque no + para cadastrar o primeiro.
              </AppText>
            </View>
          ) : (
            <AppText size='sm' color='muted' className='mt-2'>
              Veja seus terrenos e quais estão livres, em uso ou em descanso.
            </AppText>
          )}
        </View>

        {/* Lista ou estado vazio */}
        {hasTerrains && !isLoading && !error ? (
          <FlatList<Terrain>
            data={terrains}
            keyExtractor={(item) => item.localId}
            renderItem={({ item }) => (
              <TerrainCard
                terrain={item}
                onPress={() => handleOpenTerrain(item.localId)}
              />
            )}
            className='mt-5 flex-1 px-5'
            contentContainerStyle={{ paddingBottom: 80 }}
            ItemSeparatorComponent={() => <View className='h-3' />}
            showsVerticalScrollIndicator={false}
          />
        ) : showEmptyState ? (
          <View className='flex-1 items-center justify-center'>
            <TerrainsEmptyState />
          </View>
        ) : null}

        {/* Botão de adicionar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddTerrain}
          accessibilityRole='button'
          accessibilityLabel='Criar terreno'
          className='absolute bottom-5 right-5 h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-forestGreen-400'
        >
          <Plus size={28} strokeWidth={2} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
