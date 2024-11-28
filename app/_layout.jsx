import React from "react";
import { Stack } from "expo-router";
import "../global.css";
import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RootLayout = () => {
  const router = useRouter();
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)/home" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)/pages/restaurant/[restaurant_id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)/pages/restaurant/[restaurant_id]/booking_page"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
};

export default RootLayout;
