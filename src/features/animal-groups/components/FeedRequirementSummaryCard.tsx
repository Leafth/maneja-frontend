import { ChevronRight, Pencil, Plus, Wheat } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import colors from '@/styles/colors';

interface FeedRequirementSummaryCardProps {
  hasRequirements: boolean;
  disabled?: boolean;
  onRequirementPress: () => void;
  onPlanningPress?: () => void;
}

export function FeedRequirementSummaryCard({
  hasRequirements,
  disabled = false,
  onRequirementPress,
  onPlanningPress,
}: FeedRequirementSummaryCardProps) {
  return (
    <View className='overflow-hidden rounded-2xl border border-neutral-border bg-white'>
      <View className='gap-1 px-4 pt-4'>
        <AppText weight='semiBold' className='text-neutral-textHead'>
          Necessidade alimentar
        </AppText>

        <AppText size='sm' className='text-neutral-textMuted'>
          {hasRequirements
            ? 'Necessidade alimentar cadastrada'
            : 'Nenhuma ração cadastrada'}
        </AppText>
      </View>

      {!hasRequirements ? (
        <View className='items-center px-5 pb-4 pt-4'>
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
            Informe quanto cada animal consome por dia para ver por quantos dias
            o estoque dura e planejar a alimentação.
          </AppText>
        </View>
      ) : null}

      <View className='px-4 pb-4'>
        <Button
          size='md'
          disabled={disabled}
          onPress={onRequirementPress}
          className={hasRequirements ? 'bg-black-600' : undefined}
        >
          <View className='flex-row items-center justify-center gap-2'>
            <AppText size='sm' weight='medium' color='white'>
              {hasRequirements
                ? 'Editar necessidade alimentar'
                : 'Cadastrar necessidade'}
            </AppText>

            {hasRequirements ? (
              <Pencil size={16} strokeWidth={2} color={colors.white} />
            ) : (
              <Plus size={16} strokeWidth={2} color={colors.white} />
            )}
          </View>
        </Button>
      </View>

      <View className='mx-4 h-px bg-neutral-border' />

      <Pressable
        disabled={!hasRequirements || disabled || !onPlanningPress}
        onPress={onPlanningPress}
        className={`flex-row items-center justify-center gap-2 px-4 py-4 ${
          !hasRequirements || disabled || !onPlanningPress ? 'opacity-40' : ''
        }`}
      >
        <AppText
          size='sm'
          weight='medium'
          className='text-support-success-text'
        >
          Planejar alimentação
        </AppText>

        <ChevronRight
          size={16}
          strokeWidth={2}
          color={colors.support.success.solid}
        />
      </Pressable>
    </View>
  );
}
