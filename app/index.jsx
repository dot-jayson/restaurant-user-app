import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import "react-native-url-polyfill/auto";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Auth from "./components/Auth";

export default function App() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) {
      if (session.user) {
        router.replace("/home");
      }
    }
  }, [session, router]);

  return (
    <View className="flex-1 bg-[#fff] justify-center gap-3">
      <Text className="text-2xl mx-auto">Restaurant App</Text>
      <StatusBar style="auto" />
      {!session && <Auth />}
    </View>
  );
}
