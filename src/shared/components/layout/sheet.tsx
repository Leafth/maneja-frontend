import type { ReactNode } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/shared/utils/cn";

type SheetProps = {
  children: ReactNode;
  minHeightRatio?: number;
  className?: string;
};


export function Sheet({ children, minHeightRatio = 0.55, className }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  return (
    <ScrollView
      className={cn("shrink grow-0 overflow-hidden rounded-t-2xl bg-white", className)}
      style={{ minHeight: windowHeight * minHeightRatio }}
      contentContainerClassName="px-6 pt-8"
      contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {children}
    </ScrollView>
  );
}