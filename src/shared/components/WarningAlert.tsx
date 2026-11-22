import { TriangleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from '@/shared/components/AppText';
import colors from '@/styles/colors';

interface IWarningAlertProps {
  children: ReactNode;
}

/** Aviso informativo em destaque (ícone de alerta + texto). */
export function WarningAlert({ children }: IWarningAlertProps) {
  return (
    <View
      accessibilityRole='alert'
      className='flex-row items-center gap-2 rounded-[8px] border border-support-warning-border bg-support-warning-bg px-3 py-2'
    >
      <TriangleAlert size={16} color={colors.support.warning.solid} />

      <AppText size='xs' className='flex-1 text-support-warning-text'>
        {children}
      </AppText>
    </View>
  );
}
