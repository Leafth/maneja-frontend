import { Plus } from 'lucide-react-native';
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { HeaderPrimary } from '@/shared/components/Header';
import colors from '@/styles/colors';

import { FeedActionButton } from '../components/FeedActionButton';
import { useFeedStockViewModel } from '../viewmodels/use-feed-stock-view-model';

interface FeedStockCardItem {
  name: string;
  availableKg: number;
}

interface CardProps {
  type: FeedStockCardItem;
  onOpen: () => void;
  onEntry: () => void;
  onExit: () => void;
}

function FeedStockCard({ type, onOpen, onEntry, onExit }: CardProps) {
  return (
    <View className='rounded-2xl border border-gray-300 bg-white p-4'>
      <Pressable
        onPress={onOpen}
        accessibilityRole='button'
        accessibilityLabel={`Ver ${type.name}`}
      >
        <AppText weight='semiBold'>{type.name}</AppText>

        <AppText size='sm' weight='semiBold' color='muted'>
          {type.availableKg} disponíveis
        </AppText>
      </Pressable>

      <View className='mt-3 flex-row gap-2'>
        <FeedActionButton onPress={onEntry} className='h-9 px-4'>
          + Entrada
        </FeedActionButton>

        <FeedActionButton onPress={onExit} secondary className='h-9 px-4'>
          − Saída
        </FeedActionButton>
      </View>
    </View>
  );
}

export default function FeedStockView() {
  const {
    types,
    section,
    setSection,
    isOnline,
    openType,
    createType,
    addEntry,
    addExit,
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
                  type={type}
                  onOpen={() => openType(type.id)}
                  onEntry={() => addEntry(type.id)}
                  onExit={() => addExit(type.id)}
                />
              ))}

              {types.length === 0 && (
                <AppText color='muted'>
                  Cadastre seu primeiro tipo de ração.
                </AppText>
              )}
            </ScrollView>

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
