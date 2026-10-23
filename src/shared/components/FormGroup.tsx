import { cloneElement } from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';

interface IFormGroupProps {
  label: string;
  children: React.ReactElement<{ error?: boolean }>;
  error?: string;
  required?: boolean;
}

export function FormGroup({
  label,
  children,
  error,
  required = false,
}: IFormGroupProps) {
  return (
    <View className='gap-2'>
      <AppText weight='medium'>
        {label}
        {required && (
          <AppText color='error'> *</AppText>
        )}
      </AppText>

      {cloneElement(children, { error: !!error })}

      {error && (
        <AppText size='sm' color='error'>
          {error}
        </AppText>
      )}
    </View>
  );
}
