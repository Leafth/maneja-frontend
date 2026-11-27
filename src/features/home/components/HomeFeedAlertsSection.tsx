import { useRouter } from 'expo-router';
import { ChevronRight, CircleCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

import { HomeFeedAlertBadge } from './HomeFeedAlertBadge';

interface HomeFeedAlertItem {
  id: string;
  name: string;
  alertLevel: 'critical' | 'urgency' | 'attention' | 'info';
  daysRemaining: number;
  stockScaled: number;
}

interface HomeFeedAlertsSectionProps {
  alerts: HomeFeedAlertItem[];
}

export function HomeFeedAlertsSection({ alerts }: HomeFeedAlertsSectionProps) {
  const router = useRouter();

  const hasAlerts = alerts.length > 0;

  const extraAlertsCount = alerts.length > 3 ? alerts.length - 3 : 0;

  const visibleAlerts = alerts.slice(0, 3);

  function handleOpenFeeding() {
    router.push('/feeding');
  }

  return (
    <View className='gap-4 border-b border-neutral-border px-5 py-5'>
      <AppText
        size='lg'
        weight='medium'
        className='tracking-wide text-neutral-textHead'
      >
        ALERTAS DE ESTOQUE
      </AppText>

      {hasAlerts ? (
        <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white px-4'>
          {visibleAlerts.map((alert, index) => (
            <View
              key={alert.id}
              className={`flex-row items-center justify-between py-4 ${
                index > 0 ? 'border-t border-neutral-border' : ''
              }`}
            >
              <AppText
                weight='semiBold'
                className='flex-1 text-neutral-textHead'
              >
                {alert.name}
              </AppText>

              <HomeFeedAlertBadge
                alertLevel={alert.alertLevel}
                daysRemaining={alert.daysRemaining}
                stockScaled={alert.stockScaled}
              />
            </View>
          ))}

          <Pressable
            onPress={handleOpenFeeding}
            className='flex-row items-center justify-center gap-1 border-t border-neutral-border py-4'
            accessibilityRole='button'
            accessibilityLabel='Ver estoque de rações'
          >
            <AppText weight='semiBold' className='text-support-success-text'>
              {extraAlertsCount > 0
                ? `+${extraAlertsCount} ração em alerta · Ver estoque`
                : 'Ver estoque'}
            </AppText>

            <ChevronRight size={18} color={colors.support.success.text} />
          </Pressable>
        </View>
      ) : (
        <View
          className='flex-row gap-4 rounded-3xl p-5'
          style={{
            backgroundColor: colors.support.success.bg,
          }}
        >
          <View className='h-16 w-16 items-center justify-center rounded-full bg-white'>
            <CircleCheck
              size={30}
              strokeWidth={2.2}
              color={colors.support.success.text}
            />
          </View>

          <View className='flex-1'>
            <AppText
              size='xl'
              weight='semiBold'
              className='text-support-success-text'
            >
              Estoque em dia
            </AppText>

            <AppText className='mt-1 text-neutral-textHead'>
              Nenhuma ração acaba nos próximos 30 dias.
            </AppText>
          </View>
        </View>
      )}
    </View>
  );
}
