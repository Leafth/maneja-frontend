import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { View } from 'react-native';

import { Pressable, TouchableOpacity } from 'react-native-gesture-handler';

import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormGroup } from '@/shared/components/FormGroup';
import { Input } from '@/shared/components/Input';
import colors from '@/styles/colors';

import { useLoginViewModel } from '../../viewmodels/use-login-view-model';
import { ISignInBottomSheet } from './ISignInBottomSheet';
import { useSignInBottomSheetController } from './useSignInBottomSheetController';

interface ISignInBottomSheetProps {
  ref: React.Ref<ISignInBottomSheet>;
}

export function SignInBottomSheet({ ref }: ISignInBottomSheetProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    bottom,
    bottomSheetModalRef,
    passwordInputRef,
    handleForgotPassword,
  } = useSignInBottomSheetController(ref);

  const { control, onSubmit, isError, isSubmitting, isValid } =
    useLoginViewModel();

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal ref={bottomSheetModalRef}>
        <BottomSheetView style={{ paddingBottom: bottom }} className='px-6'>
          <AppText weight='semiBold' size='3xl' className='tracking-[-0.32px]'>
            Acesse a sua conta
          </AppText>

          <View className='mt-6 gap-8'>
            <Controller
              control={control}
              name='email'
              render={({ field, fieldState }) => (
                <FormGroup label='E-mail' error={fieldState.error?.message}>
                  <Input
                    InputComponent={BottomSheetTextInput}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='email'
                    returnKeyType='next'
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    disabled={isSubmitting}
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                  />
                </FormGroup>
              )}
            />

            <Controller
              control={control}
              name='password'
              render={({ field, fieldState }) => (
                <FormGroup label='Senha' error={fieldState.error?.message}>
                  <View className='relative'>
                    <Input
                      key={
                        showPassword ? 'password-visible' : 'password-hidden'
                      }
                      ref={passwordInputRef}
                      InputComponent={BottomSheetTextInput}
                      secureTextEntry={!showPassword}
                      autoCapitalize='none'
                      autoCorrect={false}
                      autoComplete='current-password'
                      returnKeyType='done'
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      disabled={isSubmitting}
                      className='pr-14'
                      onSubmitEditing={onSubmit}
                    />

                    <Pressable
                      onPress={() => {
                        setShowPassword((previous) => !previous);
                      }}
                      hitSlop={12}
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        zIndex: 999,
                        elevation: 999,
                      }}
                    >
                      {showPassword ? (
                        <EyeOffIcon size={20} color={colors.black[700]} />
                      ) : (
                        <EyeIcon size={20} color={colors.black[700]} />
                      )}
                    </Pressable>
                  </View>
                </FormGroup>
              )}
            />

            {isError && (
              <AppText align='center' color='error'>
                E-mail ou senha inválidos.
              </AppText>
            )}

            <Button
              onPress={onSubmit}
              isLoading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              Entrar
            </Button>

            <View className='flex-row justify-center gap-1'>
              <AppText>Esqueceu a senha?</AppText>

              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isSubmitting}
              >
                <AppText
                  color='primary'
                  weight='semiBold'
                  className='underline'
                >
                  Recuperar senha
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
