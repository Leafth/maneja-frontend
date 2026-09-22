import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BACKGROUND = require("@/assets/images/BackgroundInicio.png");
const LOGO = require("@/assets/images/LogoManeja.png");

export function LoginHero() {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BACKGROUND ? (
        <Image
          source={BACKGROUND}
          contentFit="cover"
          contentPosition="top"
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View className="items-center" style={{ paddingTop: insets.top + 20 }}>
        {LOGO ? (
          <Image
            source={LOGO}
            contentFit="contain"
            style={{ width: 100, height: 30 }}
          />
        ) : (
          <Text className="font-host-medium text-[28px] italic text-white">
            mane<Text className="text-primary">ja</Text>
          </Text>
        )}
      </View>
    </View>
  );
}
