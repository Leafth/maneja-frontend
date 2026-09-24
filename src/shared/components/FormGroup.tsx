import { cloneElement } from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

interface IFormGroupProps {
  label: string;
  children: React.ReactElement<{error?: boolean}>;
  error?: string;
}

export function FormGroup({ label, children, error }: IFormGroupProps) {
  return (
    <View className="gap-2">
      <AppText weight="medium">{label}</AppText>
      {cloneElement(children, { error: !!error })}
      {error && (
        <AppText size="sm" className="color-support-red">{error}</AppText>
      )}
    </View>
  );
}
