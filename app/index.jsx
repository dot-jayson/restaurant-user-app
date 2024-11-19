import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Auth from "./components/Auth";
import { supabase } from "../lib/supabase";
import "react-native-url-polyfill/auto";
import { useEffect, useState } from "react";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View className="flex-1 bg-[#fff] justify-center gap-3">
      <Text className="text-2xl mx-auto">Restaurant App</Text>
      <StatusBar style="auto" />
      <Auth />
      {session && session.user && <Text>{session.user.id}</Text>}
    </View>
  );
}
