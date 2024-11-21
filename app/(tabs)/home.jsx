import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../../hooks/useLocation";
import { useRouter, Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "@rneui/themed";

const Home = () => {
  const { latitude, longitude, errorMsg } = useLocation();
  const [currentDate, setCurrentDate] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const router = useRouter();
  async function signOut() {
    const { error } = await supabase.auth.signOut();

    router.replace("/");
  }

  async function fetchRestaurants(latitude, longitude) {
    const { data, error } = await supabase.rpc(
      `get_restaurants_within_distance`,
      { user_lat: Number(latitude), user_long: Number(longitude) }
    );
    console.log("data received:", data);
    if (error) {
      console.error("Error fetching restaurants:", error);
    }
    if (data && data.length > 0) {
      setRestaurants(data);
    } else {
      console.log("No restaurants found");
    }
  }

  function renderRestaurantItem({ item }) {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/pages/restaurant/${item.restaurant_id}`);
        }}
      >
        <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
          <Text className="text-lg text-gray-800">{item.restaurant_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    fetchRestaurants(latitude, longitude);
    // var date = new Date().getDate(); //Current Date
    // var month = new Date().getMonth() + 1; //Current Month
    // var year = new Date().getFullYear(); //Current Year
    // var hours = new Date().getHours(); //Current Hours
    // var min = new Date().getMinutes(); //Current Minutes

    // setCurrentDate(date + "/" + month + "/" + year + " " + hours + ":" + min);
  }, []);

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
  const tempInitialLocation = {
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
          <MapView initialRegion={tempInitialLocation} style={styles.map}>
            <Marker coordinate={tempInitialLocation} title="You are here">
              <Image
                className="w-[50px] h-[50px]"
                source={require("../../assets/location-marker.png")}
              />
            </Marker>

            {restaurants.map((restaurant) => {
              return (
                <Marker
                  key={restaurant.restaurant_id}
                  coordinate={{
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  title={restaurant.restaurant_name}
                  onPress={() => {
                    router.push(
                      `/pages/restaurant/${restaurant.restaurant_id}`
                    );
                  }}
                />
              );
            })}
          </MapView>
          <View className="flex-1 p-4">
            <Text className="text-center text-xl font-bold mb-4">
              Restaurant List
            </Text>

            {restaurants.length === 0 ? (
              <Text>No Restaurants Within Range</Text>
            ) : (
              <FlatList
                data={restaurants}
                renderItem={renderRestaurantItem}
                keyExtractor={(item) => item.restaurant_id}
              />
            )}
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
