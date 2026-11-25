import {
  CalendarDays,
  ChevronRight,
  Pencil,
  Plus,
  TriangleAlert,
  Wheat,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import colors from '@/styles/colors';

interface FeedRequirementSummaryItem {
  id: string;
  name: string;
  quantityPerAnimalLabel: string;
  dailyTotalLabel: string;
  daysRemaining: number | null;
  alertLevel: 'critical' | 'urgency' | 'attention' | 'info' | null;
}

interface FeedRequirementSummaryCardProps {
  items: FeedRequirementSummaryItem[];
  disabled?: boolean;
  onRequirementPress: () => void;
  onPlanningPress?: () => void;
}

function getAlertClasses(alertLevel: FeedRequirementSummaryItem['alertLevel']) {
  switch (alertLevel) {
    case 'critical':
      return {
        container: 'bg-support-danger-bg',
        text: 'text-support-danger-text',
        color: colors.support.danger.solid,
      };

    case 'urgency':
    case 'attention':
      return {
        container: 'bg-orange-100',
        text: 'text-orange-700',
        color: '#C65D00',
      };

    default:
      return {
        container: 'bg-support-success-bg',
        text: 'text-support-success-text',
        color: colors.support.success.solid,
      };
  }
}

export function FeedRequirementSummaryCard({
  items,
  disabled = false,
  onRequirementPress,
  onPlanningPress,
}: FeedRequirementSummaryCardProps) {
  const hasRequirements = items.length > 0;

  return (
    <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white'>
      <View className='px-4 pt-4'>
        <View className='flex-row items-start justify-between gap-3'>
          <View className='flex-1 gap-1'>
            <AppText
              size='lg'
              weight='semiBold'
              className='text-neutral-textHead'
            >
              Necessidade alimentar
            </AppText>

            <AppText className='text-neutral-textMuted'>
              {hasRequirements
                ? 'Consumo diário e estoque restante'
                : 'Nenhuma ração cadastrada'}
            </AppText>
          </View>

          {hasRequirements && (
            <Pressable
              disabled={disabled}
              onPress={onRequirementPress}
              className='flex-row items-center gap-2'
            >
              <Pencil
                size={18}
                strokeWidth={2}
                color={colors.support.success.solid}
              />

              <AppText weight='medium' className='text-support-success-text'>
                Editar
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      {!hasRequirements ? (
        <>
          <View className='items-center px-5 pb-4 pt-5'>
            <View className='mb-3 h-12 w-12 items-center justify-center rounded-full bg-support-success-bg'>
              <Wheat
                size={22}
                strokeWidth={1.8}
                color={colors.support.success.solid}
              />
            </View>

            <AppText
              weight='semiBold'
              align='center'
              className='text-neutral-textHead'
            >
              Cadastre a primeira ração
            </AppText>

            <AppText
              size='sm'
              align='center'
              className='mt-2 max-w-[250px] leading-5 text-neutral-textMuted'
            >
              Informe quanto cada animal consome por dia para ver por quantos
              dias o estoque dura e planejar a alimentação.
            </AppText>
          </View>

          <View className='px-4 pb-4'>
            <Button size='md' disabled={disabled} onPress={onRequirementPress}>
              <View className='flex-row items-center justify-center gap-2'>
                <AppText size='sm' weight='medium' color='white'>
                  Cadastrar necessidade
                </AppText>

                <Plus size={16} strokeWidth={2} color={colors.white} />
              </View>
            </Button>
          </View>
        </>
      ) : (
        <View className='mt-4 px-4'>
          {items.map((item, index) => {
            const alert = getAlertClasses(item.alertLevel);

            return (
              <View
                key={item.id}
                className={`flex-row items-center justify-between gap-3 py-4 ${
                  index > 0
                    ? 'border-t border-neutral-border'
                    : 'border-t border-neutral-border'
                }`}
              >
                <View className='flex-1 gap-1'>
                  <AppText
                    size='lg'
                    weight='semiBold'
                    className='text-neutral-textHead'
                  >
                    {item.name}
                  </AppText>

                  <AppText className='text-neutral-textMuted'>
                    {item.quantityPerAnimalLabel}/animal ·{' '}
                    {item.dailyTotalLabel}/dia
                  </AppText>
                </View>

                {item.daysRemaining !== null && (
                  <View
                    className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${alert.container}`}
                  >
                    <TriangleAlert
                      size={17}
                      strokeWidth={2}
                      color={alert.color}
                    />

                    <AppText weight='semiBold' className={alert.text}>
                      {item.daysRemaining}{' '}
                      {item.daysRemaining === 1 ? 'dia' : 'dias'}
                    </AppText>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View className='mx-4 h-px bg-neutral-border' />

      <Pressable
        disabled={!hasRequirements || disabled || !onPlanningPress}
        onPress={onPlanningPress}
        className={`flex-row items-center justify-center gap-3 px-4 py-5 ${
          !hasRequirements || disabled || !onPlanningPress ? 'opacity-40' : ''
        }`}
      >
        <CalendarDays
          size={20}
          strokeWidth={2}
          color={colors.support.success.solid}
        />

        <AppText weight='semiBold' className='text-support-success-text'>
          Planejar alimentação
        </AppText>

        <ChevronRight
          size={18}
          strokeWidth={2}
          color={colors.support.success.solid}
        />
      </Pressable>
    </View>
  );
}
