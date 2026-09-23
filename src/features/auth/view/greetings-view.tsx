import greetingsBg from '@/assets/images/greetings-bg/image.png';
import { Button } from '@/shared/components/button';
import { Logo } from '@/shared/components/Logo';
import { SignInBottomSheet } from '@/shared/components/SignInBottomSheet';
import { ISignInBottomSheet } from '@/shared/components/SignInBottomSheet/ISignInBottomSheet';
import { Text } from '@/shared/components/text';
import { useRef } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Greetings() {
  const signInBottomSheetRef = useRef<ISignInBottomSheet>(null);

  return (
    <>
      <ImageBackground
        source={greetingsBg}
        resizeMode="cover"
        className="flex-1"
      >
        <SafeAreaView className='items-center py-4 flex-1 justify-between'>
          <Logo  width={100} height={32} />

          <View className='w-full items-center'>
            <Text variant='title' className="max-w-[311px] tracking-[-0.32] text-center color-white">
              O manejo da sua propriedade sem complicação
            </Text>

            <View className='p-5 mt-6 w-full'>
              <Button
                title='Criar Conta'
              />

              <View className='mt-4 flex-row gap-2 py-[14px] justify-center'>
                <Text className='color-white'>
                  Já tem conta?
                </Text>
                <TouchableOpacity onPress={() => signInBottomSheetRef.current?.open()} >
                  <Text  variant='label' className='color-lime-400' >
                    Acessar conta
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

        </SafeAreaView>
      </ImageBackground>

      <SignInBottomSheet ref={signInBottomSheetRef} />
    </>
  );
}
