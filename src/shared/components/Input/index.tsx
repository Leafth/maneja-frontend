import { BlurEvent, FocusEvent, TextInput, TextInputProps, View } from 'react-native';

import colors from '@/styles/colors';
import { useState } from 'react';
import { AppText } from '../AppText';
import { inputStyles } from './styles';

type BaseTextInputProps = Omit<React.ComponentProps<typeof TextInput>, 'readOnly'>;

export interface IInputProps extends BaseTextInputProps {
  error?: boolean;
  disabled?: boolean;
  InputComponent?: React.ComponentType<TextInputProps>;
  ref?: React.Ref<TextInput>;
  formatter?: (value: string) => string;
  suffix?: string;
}

export function Input({
  className,
  onFocus,
  onBlur,
  error,
  disabled,
  InputComponent = TextInput,
  onChangeText,
  formatter,
  suffix,
  ...props
}: IInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  function handleFocus(event: FocusEvent) {
    setIsFocused(true);
    onFocus?.(event);
  }

  function handleBlur(event: BlurEvent) {
    setIsFocused(false);
    onBlur?.(event);
  }

  function handleChangeText(value: string) {
    const formattedValue = formatter?.(value) ?? value;

    onChangeText?.(formattedValue);
  }

  const { container, input: inputClass, suffix: suffixClass } = inputStyles({
    status: error ? 'error' : isFocused ? 'focus' : 'default',
    disabled: !!disabled,
    hasSuffix: !!suffix,
  });

  const input = (
    <InputComponent
      className={inputClass({ className })}
      placeholderTextColor={colors.gray[700]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      readOnly={disabled}
      onChangeText={handleChangeText}
      {...props}
    />
  );

  if (suffix) {
    return (
      <View className={container()}>
        {input}
        <View className={suffixClass()}>
          <AppText color="muted">{suffix}</AppText>
        </View>
      </View>
    );
  }

  return input;
}
