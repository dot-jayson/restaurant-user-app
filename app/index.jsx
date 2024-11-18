import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import SignIn from "./(auth)/sign-in";

export default function App() {
  return (
    <View className="flex-1 bg-[#fff] items-center justify-center gap-3">
      <Text className="text-2xl">Restaurant App</Text>
      <StatusBar style="auto" />
      <SignIn />
      <Link href="/sign-up">Need to register? Sign up here</Link>
      <Link href="/home">Home</Link>
    </View>
  );
}
