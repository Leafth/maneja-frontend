import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { HeaderPrimary } from '@/shared/components/Header';

import { HomeFeedAlertsSection } from '../components/HomeFeedAlertsSection';
import { HomeFeedStockCard } from '../components/HomeFeedStockCard';
import { HomeSummaryCard } from '../components/HomeSummaryCard';
import { HomeTerrainCard } from '../components/HomeTerrainCard';

import { useHomeViewModel } from '../viewmodels/use-home-view-model';

export default function HomeView() {
  const {
    groupsCount,
    totalAnimals,
    terrainSummary,
    feedSummary,
    feedAlerts,
    isLoading,
    isError,
    error,
    retry,
  } = useHomeViewModel();

  return (
    <View className='flex-1 bg-forestGreen-300'>
      {/* Cabeçalho compartilhado */}

      <HeaderPrimary />

      {/* Conteúdo com bordas arredondadas */}

      <View className='flex-1 overflow-hidden rounded-t-3xl bg-white'>
        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' />
          </View>
        ) : (
          <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
          >
            {/* Erro de carregamento */}

            {isError && (
              <View className='mx-5 mt-5 gap-3 rounded-2xl bg-support-danger-bg p-4'>
                <AppText weight='semiBold' className='text-support-danger-text'>
                  Não foi possível carregar o resumo.
                </AppText>

                {error && (
                  <AppText size='sm' className='text-neutral-textMuted'>
                    {error}
                  </AppText>
                )}

                <Pressable
                  onPress={() => void retry()}
                  className='self-start'
                  accessibilityRole='button'
                >
                  <AppText
                    weight='semiBold'
                    className='text-support-danger-solid'
                  >
                    Tentar novamente
                  </AppText>
                </Pressable>
              </View>
            )}

            {/* Alertas das rações */}

            <HomeFeedAlertsSection alerts={feedAlerts} />

            {/* Resumo do rebanho */}

            <View className='gap-4 border-b border-neutral-border px-5 py-5'>
              <AppText
                size='lg'
                weight='medium'
                className='tracking-wide text-neutral-textHead'
              >
                RESUMO REBANHO
              </AppText>

              <View className='flex-row gap-4'>
                <HomeSummaryCard
                  title='Grupos'
                  value={groupsCount}
                  description='Grupos ativos'
                />

                <HomeSummaryCard
                  title='Animais'
                  value={totalAnimals}
                  description='Total na fazenda'
                />
              </View>
            </View>

            {/* Resumo dos terrenos */}

            <View className='gap-4 border-b border-neutral-border px-5 py-5'>
              <AppText
                size='lg'
                weight='medium'
                className='tracking-wide text-neutral-textHead'
              >
                RESUMO TERRENOS
              </AppText>

              <View className='flex-row gap-3'>
                <HomeTerrainCard
                  title='Disponíveis'
                  value={terrainSummary.available}
                  status='available'
                />

                <HomeTerrainCard
                  title='Em uso'
                  value={terrainSummary.occupied}
                  status='occupied'
                />

                <HomeTerrainCard
                  title='Descanso'
                  value={terrainSummary.resting}
                  status='resting'
                />
              </View>
            </View>

            {/* Estoque de rações */}

            <View className='gap-4 px-5 py-5'>
              <AppText
                size='lg'
                weight='medium'
                className='tracking-wide text-neutral-textHead'
              >
                ESTOQUE DE RAÇÕES
              </AppText>

              {feedSummary.length === 0 ? (
                <View className='rounded-2xl border border-neutral-border p-4'>
                  <AppText className='text-neutral-textMuted'>
                    Nenhum alerta de ração disponível.
                  </AppText>
                </View>
              ) : (
                feedSummary.map((feed) => (
                  <HomeFeedStockCard
                    key={feed.id}
                    name={feed.name}
                    stockLabel={feed.stockLabel}
                    coverage={feed.coverage}
                    alertLevel={feed.alertLevel}
                  />
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
