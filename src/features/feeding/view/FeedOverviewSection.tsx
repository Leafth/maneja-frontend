import { CircleAlert, Info, WifiOff } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import colors from '@/styles/colors';

import { FeedOverviewItemCard } from '../components/FeedOverviewItemCard';
import { useFeedOverviewViewModel } from '../hooks/use-feed-overview-view-model';
import type { PlanningPeriod } from '../schemas/feed-planning.schema';

const periods: {
  value: PlanningPeriod;
  label: string;
}[] = [
  {
    value: '7',
    label: '7 dias',
  },
  {
    value: '15',
    label: '15 dias',
  },
  {
    value: '30',
    label: '30 dias',
  },
  {
    value: 'custom',
    label: 'Outro',
  },
];

export default function FeedOverviewSection() {
  const {
    period,
    customDays,
    selectedDays,

    handlePeriodChange,
    handleCustomDaysChange,

    isOnline,

    shortageItems,
    sufficientItems,
    shortageCount,

    hasResult,
    hasValidCustomDays,

    isLoading,
    errorMessage,

    retry,
    openGroup,
  } = useFeedOverviewViewModel();

  return (
    <ScrollView
      className='mt-5 flex-1'
      contentContainerStyle={{
        paddingBottom: 100,
        gap: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      <AppText className='text-neutral-textMuted'>
        Consumo de todos os grupos comparado com o estoque atual.
      </AppText>

      {/* Período */}

      <View className='gap-3'>
        <AppText weight='medium' className='text-neutral-textHead'>
          Período
        </AppText>

        <View className='flex-row rounded-xl bg-gray-300 p-1'>
          {periods.map((item) => {
            const selected = period === item.value;

            return (
              <Pressable
                key={item.value}
                disabled={!isOnline}
                onPress={() => handlePeriodChange(item.value)}
                className={`h-12 flex-1 items-center justify-center rounded-lg ${
                  selected ? 'bg-white' : ''
                }`}
              >
                <AppText
                  size='sm'
                  weight={selected ? 'semiBold' : 'regular'}
                  className={
                    selected
                      ? 'text-neutral-textHead'
                      : 'text-neutral-textMuted'
                  }
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {period === 'custom' && isOnline && (
          <View className='flex-row items-center rounded-xl border border-neutral-border px-4'>
            <TextInput
              value={customDays}
              onChangeText={handleCustomDaysChange}
              keyboardType='number-pad'
              placeholder='Ex.: 45'
              className='flex-1 py-4 text-base text-neutral-textHead'
            />

            <AppText className='text-neutral-textMuted'>dias</AppText>
          </View>
        )}
      </View>

      {/* Offline */}

      {!isOnline ? (
        <View className='flex-row gap-3 rounded-2xl bg-neutral-surface p-4'>
          <View className='h-10 w-10 items-center justify-center rounded-full bg-white'>
            <WifiOff size={20} color={colors.neutral.textHead} />
          </View>

          <View className='flex-1 gap-1'>
            <AppText weight='semiBold' className='text-neutral-textHead'>
              Visão geral indisponível
            </AppText>

            <AppText size='sm' className='leading-5 text-neutral-textMuted'>
              O planejamento de todos os grupos requer conexão com a internet.
            </AppText>
          </View>
        </View>
      ) : period === 'custom' && !hasValidCustomDays ? (
        <View className='rounded-2xl bg-neutral-surface p-4'>
          <AppText className='text-neutral-textMuted'>
            Informe a quantidade de dias para calcular o planejamento.
          </AppText>
        </View>
      ) : isLoading ? (
        <View className='items-center py-10'>
          <ActivityIndicator />
        </View>
      ) : errorMessage ? (
        <View className='gap-4 rounded-2xl border border-support-danger-border bg-support-danger-bg p-4'>
          <AppText className='text-support-danger-text'>{errorMessage}</AppText>

          <Button variant='secondary' onPress={retry}>
            Tentar novamente
          </Button>
        </View>
      ) : hasResult ? (
        <>
          {/* Resumo */}

          {shortageCount > 0 ? (
            <View className='flex-row gap-3 rounded-2xl bg-support-danger-bg p-4'>
              <View className='h-10 w-10 items-center justify-center rounded-full bg-white'>
                <CircleAlert size={20} color={colors.support.danger.solid} />
              </View>

              <View className='flex-1 gap-1'>
                <AppText
                  weight='semiBold'
                  className='text-support-danger-solid'
                >
                  {shortageCount === 1
                    ? `1 ração com estoque insuficiente para ${selectedDays} dias`
                    : `${shortageCount} rações com estoque insuficiente para ${selectedDays} dias`}
                </AppText>

                <AppText size='sm' className='text-neutral-textBody'>
                  Veja abaixo quanto falta para cobrir o período selecionado.
                </AppText>
              </View>
            </View>
          ) : (
            <View className='rounded-2xl bg-support-success-bg p-4'>
              <AppText weight='semiBold' className='text-support-success-text'>
                Estoque suficiente para o período
              </AppText>

              <AppText size='sm' className='mt-1 text-neutral-textBody'>
                Todas as rações possuem estoque suficiente para os próximos{' '}
                {selectedDays} dias.
              </AppText>
            </View>
          )}

          {/* Insuficientes */}

          {shortageItems.length > 0 && (
            <View className='gap-3'>
              <View className='flex-row items-center gap-2'>
                <AppText weight='medium' className='text-neutral-textHead'>
                  Estoque insuficiente
                </AppText>

                <View className='min-w-6 items-center rounded-full bg-gray-300 px-2 py-0.5'>
                  <AppText size='xs' className='text-neutral-textMuted'>
                    {shortageItems.length}
                  </AppText>
                </View>
              </View>

              <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white px-4'>
                {shortageItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`py-4 ${
                      index > 0 ? 'border-t border-neutral-border' : ''
                    }`}
                  >
                    <FeedOverviewItemCard {...item} onGroupPress={openGroup} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Suficientes */}

          {sufficientItems.length > 0 && (
            <View className='gap-3'>
              <View className='flex-row items-center gap-2'>
                <AppText weight='medium' className='text-neutral-textHead'>
                  Estoque suficiente
                </AppText>

                <View className='min-w-6 items-center rounded-full bg-gray-300 px-2 py-0.5'>
                  <AppText size='xs' className='text-neutral-textMuted'>
                    {sufficientItems.length}
                  </AppText>
                </View>
              </View>

              <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white px-4'>
                {sufficientItems.map((item, index) => (
                  <View
                    key={item.id}
                    className={`py-4 ${
                      index > 0 ? 'border-t border-neutral-border' : ''
                    }`}
                  >
                    <FeedOverviewItemCard {...item} onGroupPress={openGroup} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informação */}

          <View className='flex-row items-start gap-2 px-1'>
            <Info size={17} color={colors.neutral.textMuted} />

            <AppText
              size='xs'
              className='flex-1 leading-4 text-neutral-textMuted'
            >
              A necessidade considera todos os grupos que utilizam cada ração.
              Toque em um grupo para visualizar seus detalhes.
            </AppText>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
