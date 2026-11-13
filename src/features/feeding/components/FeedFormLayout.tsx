import type { ComponentRef, ReactNode, Ref } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderSecondary } from '@/shared/components/Header';

interface Props {
  title: string;
  onBack: () => void;
  children: ReactNode;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>;
}

export function FeedFormLayout({ title, onBack, children, scrollRef }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <HeaderSecondary title={title} onBackPress={onBack} />
        {/* O recuo inferior fica no fim da rolagem: num SafeAreaView ele virava
            uma faixa branca fixa acima do teclado. */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 + bottom, gap: 16 }}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
