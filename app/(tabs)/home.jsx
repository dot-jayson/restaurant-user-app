import { View, Text, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../../hooks/useLocation";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "@rneui/themed";

const Home = () => {
  const router = useRouter();
  async function signOut() {
    const { error } = await supabase.auth.signOut();

    router.replace("/");
  }

  async function fetchRestaurants() {
    let { data, error } = await supabase
      .from("restaurants")
      .select(
        "restaurant_name, st_y(location::geometry) as lat, st_x(location::geometry) as long"
      );
    console.log(data);
    if (error) {
      console.error("Error fetching restaurants:", error);
    }
    if (data && data.length > 0) {
      data.forEach((restaurant) => {
        console.log(`Restaurant:${restaurant.restaurant_name} `);
        console.log(`Location:${restaurant.location} `);
      });
    } else {
      console.log("No restaurants found");
    }
  }

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const { latitude, longitude, errorMsg } = useLocation();

  if (!latitude || !longitude) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  const userLocation = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const londonLocation = {
    latitude: 51.5,
    longitude: 0.12,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <View className="relative flex-1">
          <View style={styles.verticallySpaced}>
            <Button title="Sign out" onPress={() => signOut()} />
          </View>
          <MapView initialRegion={londonLocation} style={styles.map}>
            <Marker coordinate={londonLocation} title="You are here" />
          </MapView>
          <View className="mt-2">
            <Text className="m-auto">Restaurant List</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  map: {
    height: "50%",
    width: "100%",
  },
});

export default Home;
