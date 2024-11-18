import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../../hooks/useLocation";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();
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
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <View className="relative flex-1">
          <MapView initialRegion={userLocation} style={styles.map}>
            <Marker coordinate={userLocation} title="You are here" />
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
