import { useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

import { otpInputStyles } from './styles';

export interface IOtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled,
  autoFocus,
}: IOtpInputProps) {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  function handleChangeText(text: string, index: number) {
    const pasted = text.replace(/\D/g, '');

    if (pasted.length > 1) {
      const nextValue = (value.slice(0, index) + pasted).slice(0, length);
      onChange(nextValue);

      const lastFilledIndex = Math.min(nextValue.length, length) - 1;
      inputsRef.current[lastFilledIndex]?.focus();

      if (nextValue.length === length) {
        onComplete?.(nextValue);
      }

      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = pasted;
    const nextValue = nextDigits.join('').slice(0, length);
    onChange(nextValue);

    if (pasted && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (nextValue.length === length) {
      onComplete?.(nextValue);
    }
  }

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  return (
    <View className="flex-row justify-between">
      {digits.map((digit, index) => {
        const status = error
          ? 'error'
          : focusedIndex === index
            ? 'focus'
            : digit
              ? 'filled'
              : 'default';

        return (
          <TextInput
            key={index}
            ref={(inputRef) => {
              inputsRef.current[index] = inputRef;
            }}
            className={otpInputStyles({ status, disabled: !!disabled })}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() =>
              setFocusedIndex((current) => (current === index ? null : current))
            }
            keyboardType="number-pad"
            maxLength={length}
            textAlign="center"
            editable={!disabled}
            autoFocus={autoFocus && index === 0}
            accessibilityLabel={`Dígito ${index + 1} do código`}
          />
        );
      })}
    </View>
  );
}
