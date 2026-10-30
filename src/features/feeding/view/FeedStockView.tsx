import { Plus } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderPrimary } from '@/shared/components/Header';
import colors from '@/styles/colors';

import { FeedStockCard } from '../components/FeedStockCard';
import { useFeedStockViewModel } from '../viewmodels/use-feed-stock-view-model';

export default function FeedStockView() {
  const {
    types,
    section,
    setSection,
    isLoading,
    isError,
    retry,
    isOnline,
    openType,
    createType,
  } = useFeedStockViewModel();

  return (
    <View className='flex-1 bg-white'>
      <HeaderPrimary isOnline={isOnline} />

      <View className='flex-1 rounded-t-2xl bg-white px-5 pt-3'>
        <AppText size='lg' weight='medium' className='uppercase'>
          ALIMENTAÇÃO
        </AppText>

        <View className='mt-3 flex-row rounded-xl bg-gray-300 p-1'>
          <Pressable
            onPress={() => setSection('stock')}
            className={`h-14 flex-1 items-center justify-center rounded-lg ${
              section === 'stock' ? 'bg-forestGreen-400' : ''
            }`}
            accessibilityRole='tab'
            accessibilityState={{
              selected: section === 'stock',
            }}
          >
            <AppText
              size='sm'
              weight={section === 'stock' ? 'medium' : 'regular'}
              color={section === 'stock' ? 'white' : 'muted'}
            >
              Estoque
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setSection('planning')}
            className={`h-14 flex-1 items-center justify-center rounded-lg ${
              section === 'planning' ? 'bg-forestGreen-400' : ''
            }`}
            accessibilityRole='tab'
            accessibilityState={{
              selected: section === 'planning',
            }}
          >
            <AppText
              size='sm'
              weight={section === 'planning' ? 'medium' : 'regular'}
              color={section === 'planning' ? 'white' : 'muted'}
            >
              Planejamento
            </AppText>
          </Pressable>
        </View>

        {section === 'stock' ? (
          <>
            {isLoading ? (
              <ActivityIndicator className='mt-6' />
            ) : isError ? (
              <View className='mt-4 gap-4'>
                <AppText size='sm' color='error'>
                  Não foi possível carregar o estoque.
                </AppText>

                <Button onPress={retry}>Tentar novamente</Button>
              </View>
            ) : (
              <ScrollView
                className='mt-4 flex-1'
                contentContainerStyle={{
                  gap: 12,
                  paddingBottom: 84,
                }}
                showsVerticalScrollIndicator={false}
              >
                {types.map((type) => (
                  <FeedStockCard
                    key={type.id}
                    name={type.name}
                    availableKg={type.availableKg}
                    onPress={() => openType(type.id)}
                  />
                ))}

                {types.length === 0 && (
                  <AppText color='muted'>
                    Cadastre seu primeiro tipo de ração.
                  </AppText>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={createType}
              accessibilityRole='button'
              accessibilityLabel='Cadastrar tipo de ração'
              className='absolute bottom-5 right-5 h-[52px] w-[52px] items-center justify-center rounded-[12px] bg-forestGreen-400'
            >
              <Plus size={28} strokeWidth={2} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <View className='flex-1 items-center justify-center'>
            <AppText color='muted'>Planejamento em desenvolvimento</AppText>
          </View>
        )}
      </View>
    </View>
  );
}
