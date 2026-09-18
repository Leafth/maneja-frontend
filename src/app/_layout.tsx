import "../styles/global.css";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "HostGrotesk-Light": require("../../assets/fonts/HostGrotesk-Light.ttf"),
    "HostGrotesk-Regular": require("../../assets/fonts/HostGrotesk-Regular.ttf"),
    "HostGrotesk-Medium": require("../../assets/fonts/HostGrotesk-Medium.ttf"),
    "HostGrotesk-SemiBold": require("../../assets/fonts/HostGrotesk-SemiBold.ttf"),
    "HostGrotesk-Bold": require("../../assets/fonts/HostGrotesk-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
