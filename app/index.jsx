import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 bg-[#fff] items-center justify-center gap-4">
      <Text className="text-2xl">Restaurant App</Text>
      <StatusBar style="auto" />
      <Link href="/sign-in">Sign in</Link>
      <Link href="/sign-up">Need to register? Sign up here</Link>
    </View>
  );
}
