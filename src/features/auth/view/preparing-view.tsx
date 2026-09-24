import { ActivityIndicator, View } from "react-native";

import { Screen } from "@/shared/components/layout/screen";
import { Text } from "@/shared/components/text";

export function PreparingView() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-[60px] pt-14">
        <Text variant="title" className="max-w-[330px] text-center">
          Preparando a gestão do seu rebanho, de porteira a porteira.
        </Text>
        <ActivityIndicator size="large" color="#65A30D" />
      </View>
    </Screen>
  );
}