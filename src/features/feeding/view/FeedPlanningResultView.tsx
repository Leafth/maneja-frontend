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
    items,
    isLoading,
    hasError,
    hasResult,
    retry,
    goBack,
  } = useFeedPlanningResultViewModel();

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
                className='uppercase tracking-wide text-neutral-textHead'
              >
                Planejamento de {days} {days === 1 ? 'dia' : 'dias'}
              </AppText>

              <AppText size='sm' className='text-neutral-textMuted'>
                {groupName}
              </AppText>
            </View>

            {items.length === 0 ? (
              <AppText color='muted'>
                Este grupo não possui necessidade alimentar cadastrada.
              </AppText>
            ) : (
              items.map((item) => (
                <PlanningItemCard
                  key={item.id}
                  feedName={item.feedName}
                  requiredLabel={item.requiredLabel}
                  stockLabel={item.stockLabel}
                  missingLabel={item.missingLabel}
                  coverage={item.coverage}
                  sufficient={item.sufficient}
                />
              ))
            )}

            <WarningAlert>
              Esta conta é só uma previsão. O app não faz nenhuma compra por
              você.
            </WarningAlert>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
