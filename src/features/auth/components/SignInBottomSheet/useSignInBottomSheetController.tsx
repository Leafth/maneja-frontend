import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useImperativeHandle, useRef } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ISignInBottomSheet } from './ISignInBottomSheet';

export function useSignInBottomSheetController(
  ref: React.Ref<ISignInBottomSheet>,
) {
  const router = useRouter();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { bottom } = useSafeAreaInsets();
  const passwordInputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetModalRef.current?.present(),
  }));

  function handleForgotPassword() {
    bottomSheetModalRef.current?.dismiss();
    router.push('/forgot-password');
  }

  return {
    bottom,
    bottomSheetModalRef,
    passwordInputRef,
    handleForgotPassword,
  };
}
