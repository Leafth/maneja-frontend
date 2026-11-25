import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderSecondary } from '@/shared/components/Header';
import { WarningAlert } from '@/shared/components/WarningAlert';

import { PlanningItemCard } from '../components/PlanningItemCard';
import { useFeedPlanningResultViewModel } from '../viewmodels/use-feed-planning-result-view-model';

export default function FeedPlanningResultView() {
  const {
    groupName,
    days,
    status,
    shortageCount,
    items,
    isLoading,
    hasError,
    hasResult,
    retry,
    goBack,
  } = useFeedPlanningResultViewModel();

  const isSufficient = status === 'sufficient';

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary title='Planejamento' onBackPress={goBack} />

      <SafeAreaView edges={['bottom']} className='flex-1'>
        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator />
          </View>
        ) : hasError ? (
          <View className='flex-1 items-center justify-center gap-4 px-5'>
            <AppText color='error' align='center'>
              Não foi possível carregar o grupo.
            </AppText>

            <Button onPress={retry}>Tentar novamente</Button>
          </View>
        ) : !hasResult ? (
          <View className='flex-1 items-center justify-center gap-4 px-5'>
            <AppText color='muted' align='center'>
              Nenhum planejamento calculado. Volte e calcule novamente.
            </AppText>

            <Button variant='secondary' onPress={goBack}>
              Voltar
            </Button>
          </View>
        ) : (
          <ScrollView
            className='flex-1'
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 32,
              gap: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className='gap-1'>
              <AppText
                size='lg'
                weight='semiBold'
                className='text-neutral-textHead'
              >
                Planejamento de {days} {days === 1 ? 'dia' : 'dias'}
              </AppText>

              <AppText size='sm' className='text-neutral-textMuted'>
                {groupName}
              </AppText>
            </View>

            {items.length > 0 && (
              <View
                className={`gap-1 rounded-[14px] border px-4 py-4 ${
                  isSufficient
                    ? 'border-support-success-border bg-support-success-bg'
                    : 'border-support-danger-border bg-support-danger-bg'
                }`}
              >
                <AppText
                  weight='semiBold'
                  className={
                    isSufficient
                      ? 'text-support-success-text'
                      : 'text-support-danger-text'
                  }
                >
                  {isSufficient ? 'Estoque suficiente' : 'Estoque insuficiente'}
                </AppText>

                <AppText
                  size='sm'
                  className={
                    isSufficient
                      ? 'text-support-success-text'
                      : 'text-support-danger-text'
                  }
                >
                  {isSufficient
                    ? `Seu estoque atende às necessidades deste grupo pelos próximos ${days} ${
                        days === 1 ? 'dia' : 'dias'
                      }.`
                    : `${shortageCount} ${
                        shortageCount === 1
                          ? 'ração precisa'
                          : 'rações precisam'
                      } de reposição para atender todo o período.`}
                </AppText>
              </View>
            )}

            {items.length === 0 ? (
              <View className='rounded-[14px] border border-neutral-border bg-neutral-card p-4'>
                <AppText weight='medium' className='text-neutral-textHead'>
                  Nenhuma necessidade cadastrada
                </AppText>

                <AppText size='sm' className='mt-1 text-neutral-textMuted'>
                  Este grupo ainda não possui necessidade alimentar cadastrada.
                </AppText>
              </View>
            ) : (
              <View className='gap-3'>
                <AppText weight='semiBold' className='text-neutral-textHead'>
                  Rações
                </AppText>

                {items.map((item) => (
                  <PlanningItemCard
                    key={item.id}
                    feedName={item.feedName}
                    requiredLabel={item.requiredLabel}
                    stockLabel={item.stockLabel}
                    missingLabel={item.missingLabel}
                    remainingLabel={item.remainingLabel}
                    coverage={item.coverage}
                    sufficient={item.sufficient}
                  />
                ))}
              </View>
            )}

            {items.length > 0 && (
              <WarningAlert>
                Esta conta é apenas uma previsão baseada nas necessidades
                cadastradas e no estoque atual.
              </WarningAlert>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
