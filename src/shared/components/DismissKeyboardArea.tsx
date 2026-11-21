import type { ReactNode } from 'react';
import { Keyboard, Pressable } from 'react-native';

interface IDismissKeyboardAreaProps {
  children: ReactNode;
  className?: string;
}

/**
 * Área que fecha o teclado ao tocar fora dos campos. Útil em telas sem
 * ScrollView e no teclado numérico do iOS, que não tem tecla de confirmar.
 */
export function DismissKeyboardArea({
  children,
  className = '',
}: IDismissKeyboardAreaProps) {
  return (
    <Pressable
      onPress={Keyboard.dismiss}
      accessible={false}
      className={`flex-1 ${className}`}
    >
      {children}
    </Pressable>
  );
}
