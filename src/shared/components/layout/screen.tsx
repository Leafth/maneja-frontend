import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/shared/utils/cn";

type ScreenProps = {
  children: ReactNode;
  header?: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
};

export function Screen({
  children,
  header,
  scroll = false,
  contentClassName,
}: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {header}

      {scroll ? (
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          <ScrollView
            className="flex-1"
            contentContainerClassName={cn("px-6 pb-8", contentClassName)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View className={cn("flex-1 px-6", contentClassName)}>{children}</View>
      )}
    </SafeAreaView>
  );
}