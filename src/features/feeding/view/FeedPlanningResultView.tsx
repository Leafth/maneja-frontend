import { CircleAlert, CircleCheck, Info, WifiOff } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HeaderSecondary } from '@/shared/components/Header';
import colors from '@/styles/colors';

import type { PlanningPeriod } from '../schemas/feed-planning.schema';
import { useFeedPlanningResultViewModel } from '../viewmodels/use-feed-planning-result-view-model';

const periods: {
  value: PlanningPeriod;
  label: string;
}[] = [
  { value: '7', label: '7 dias' },
  { value: '15', label: '15 dias' },
  { value: '30', label: '30 dias' },
  { value: 'custom', label: 'Outro' },
];

export default function FeedPlanningResultView() {
  const {
    groupName,
    animalCount,

    period,
    customDays,
    selectedDays,
    handlePeriodChange,
    handleCustomDaysChange,

    isOnline,

    status,
    shortageCount,
    items,
    offlineItems,

    isLoading,
    hasError,
    planningError,
    hasResult,
    hasValidCustomDays,

    retry,
    goBack,
  } = useFeedPlanningResultViewModel();

  const isSufficient = status === 'sufficient';

  return (
    <View className='flex-1 bg-white'>
      <HeaderSecondary title='Planejamento alimentar' onBackPress={goBack} />

      <SafeAreaView edges={['bottom']} className='flex-1'>
        {hasError ? (
          <View className='flex-1 items-center justify-center gap-4 px-5'>
            <AppText color='error' align='center'>
              Não foi possível carregar os dados do grupo.
            </AppText>

            <Button onPress={retry}>Tentar novamente</Button>
          </View>
        ) : (
          <ScrollView
            className='flex-1'
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 32,
              gap: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Grupo */}
            <AppText className='text-neutral-textMuted'>
              {groupName}
              {animalCount > 0
                ? ` · ${animalCount} ${
                    animalCount === 1 ? 'cabeça' : 'cabeças'
                  }`
                : ''}
            </AppText>

            {/* Período */}
            <View className='gap-3'>
              <AppText weight='medium' className='text-neutral-textHead'>
                Período
              </AppText>

              <View
                className={`flex-row rounded-xl bg-neutral-surface p-1 ${
                  !isOnline ? 'opacity-40' : ''
                }`}
              >
                {periods.map((item) => {
                  const selected = period === item.value;

                  return (
                    <Pressable
                      key={item.value}
                      disabled={!isOnline}
                      onPress={() => handlePeriodChange(item.value)}
                      className={`flex-1 items-center justify-center rounded-lg py-3 ${
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

            {/* OFFLINE */}
            {!isOnline ? (
              <>
                <View className='flex-row gap-3 rounded-2xl bg-neutral-surface p-4'>
                  <View className='h-10 w-10 items-center justify-center rounded-full bg-white'>
                    <WifiOff
                      size={20}
                      strokeWidth={2}
                      color={colors.neutral.textHead}
                    />
                  </View>

                  <View className='flex-1 gap-1'>
                    <AppText
                      weight='semiBold'
                      className='text-neutral-textHead'
                    >
                      Você está sem conexão
                    </AppText>

                    <AppText
                      size='sm'
                      className='leading-5 text-neutral-textMuted'
                    >
                      Mostrando por quantos dias o estoque dura com os dados
                      salvos no aparelho. O cálculo por período volta quando
                      você estiver online.
                    </AppText>
                  </View>
                </View>

                <View className='gap-3'>
                  <AppText weight='medium' className='text-neutral-textHead'>
                    Duração do estoque
                  </AppText>

                  <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white px-4'>
                    {offlineItems.map((item, index) => (
                      <View
                        key={item.id}
                        className={`gap-2 py-4 ${
                          index > 0 ? 'border-t border-neutral-border' : ''
                        }`}
                      >
                        <View className='flex-row items-center justify-between gap-3'>
                          <AppText
                            weight='semiBold'
                            className='text-neutral-textHead'
                          >
                            {item.feedName}
                          </AppText>

                          {item.daysRemaining !== null && (
                            <AppText
                              weight='medium'
                              className={
                                item.daysRemaining <= 5
                                  ? 'text-support-danger-text'
                                  : item.daysRemaining <= 15
                                    ? 'text-orange-700'
                                    : 'text-support-success-text'
                              }
                            >
                              Acaba em {item.daysRemaining}{' '}
                              {item.daysRemaining === 1 ? 'dia' : 'dias'}
                            </AppText>
                          )}
                        </View>

                        <AppText size='sm' className='text-neutral-textMuted'>
                          Tem {item.stockLabel} · consome{' '}
                          {item.dailyRequiredLabel}
                          /dia
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Esperando período customizado */}
                {period === 'custom' && !hasValidCustomDays ? (
                  <View className='rounded-2xl border border-neutral-border bg-neutral-surface p-4'>
                    <AppText className='text-neutral-textMuted'>
                      Informe a quantidade de dias para calcular o planejamento.
                    </AppText>
                  </View>
                ) : isLoading ? (
                  <View className='items-center justify-center py-12'>
                    <ActivityIndicator />
                  </View>
                ) : planningError ? (
                  <View className='gap-4 rounded-2xl border border-support-danger-border bg-support-danger-bg p-4'>
                    <AppText className='text-support-danger-text'>
                      {planningError}
                    </AppText>

                    <Button variant='secondary' onPress={retry}>
                      Tentar novamente
                    </Button>
                  </View>
                ) : hasResult ? (
                  <>
                    {/* Resumo geral */}
                    <View
                      className={`flex-row gap-3 rounded-2xl p-4 ${
                        isSufficient
                          ? 'bg-support-success-bg'
                          : 'bg-support-danger-bg'
                      }`}
                    >
                      <View className='h-10 w-10 items-center justify-center rounded-full bg-white'>
                        {isSufficient ? (
                          <CircleCheck
                            size={21}
                            strokeWidth={2}
                            color={colors.support.success.solid}
                          />
                        ) : (
                          <CircleAlert
                            size={21}
                            strokeWidth={2}
                            color={colors.support.danger.solid}
                          />
                        )}
                      </View>

                      <View className='flex-1 gap-1'>
                        <AppText
                          weight='semiBold'
                          className={
                            isSufficient
                              ? 'text-support-success-text'
                              : 'text-support-danger-text'
                          }
                        >
                          {isSufficient
                            ? `Estoque suficiente para ${selectedDays} ${
                                selectedDays === 1 ? 'dia' : 'dias'
                              }`
                            : shortageCount === 1
                              ? `Falta 1 ração para ${selectedDays} dias`
                              : `Faltam ${shortageCount} rações para ${selectedDays} dias`}
                        </AppText>

                        <AppText
                          size='sm'
                          className='leading-5 text-neutral-textHead'
                        >
                          {isSufficient
                            ? 'Todas as rações cobrem o período selecionado.'
                            : 'O estoque atual não cobre toda a necessidade deste período.'}
                        </AppText>
                      </View>
                    </View>

                    {/* Por ração */}
                    <View className='gap-3'>
                      <AppText
                        weight='medium'
                        className='text-neutral-textHead'
                      >
                        Por ração
                      </AppText>

                      <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white px-4'>
                        {items.map((item, index) => (
                          <View
                            key={item.id}
                            className={`gap-3 py-4 ${
                              index > 0 ? 'border-t border-neutral-border' : ''
                            }`}
                          >
                            <View className='flex-row items-center justify-between gap-3'>
                              <AppText
                                weight='semiBold'
                                className='text-neutral-textHead'
                              >
                                {item.feedName}
                              </AppText>

                              <AppText
                                weight='semiBold'
                                className={
                                  item.sufficient
                                    ? 'text-support-success-text'
                                    : 'text-support-danger-text'
                                }
                              >
                                {item.sufficient
                                  ? `Sobram ${item.remainingLabel}`
                                  : `Faltam ${item.missingLabel}`}
                              </AppText>
                            </View>

                            <View className='h-1.5 overflow-hidden rounded-full bg-neutral-surface'>
                              <View
                                className={`h-full rounded-full ${
                                  item.sufficient
                                    ? 'bg-support-success-solid'
                                    : 'bg-support-danger-solid'
                                }`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(item.coverage * 100, 100),
                                  )}%`,
                                }}
                              />
                            </View>

                            <AppText
                              size='sm'
                              className='text-neutral-textMuted'
                            >
                              Precisa de {item.requiredLabel} · tem{' '}
                              {item.stockLabel}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Observação */}
                    <View className='flex-row gap-2'>
                      <Info
                        size={16}
                        strokeWidth={2}
                        color={colors.neutral.textMuted}
                      />

                      <AppText
                        size='sm'
                        className='flex-1 leading-5 text-neutral-textMuted'
                      >
                        Previsão com base na necessidade cadastrada. Rações
                        divididas com outros grupos consideram o consumo de
                        todos eles.
                      </AppText>
                    </View>
                  </>
                ) : null}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
