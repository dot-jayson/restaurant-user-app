import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../../hooks/useLocation";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "@rneui/themed";
import DropDownPicker from "react-native-dropdown-picker";
import { getDistance } from "geolib";

const Home = () => {
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const { latitude, longitude, errorMsg } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [cuisineFilteredRestaurants, setCuisineFilteredRestaurants] = useState([]);
  const [openCuisineDropdown, setOpenCuisineDropdown] = useState(false);
  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [openAvailabilityDropdown, setOpenAvailabilityDropdown] = useState(false);
  const [openPartySizeDropdown, setOpenPartySizeDropdown] = useState(false);
  const [availabilityDropDownValue, setAvailabilityDropDownValue] = useState("all");
  const [availabilityTime, setAvailabilityTime] = useState(null);
  const [partySize, setPartySize] = useState(null);
  const router = useRouter();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    router.replace("/");
  }

  const userLocation = {
    latitude: Number(latitude),
    longitude: Number(longitude),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const tempInitialLocation = {
    latitude: 51.5,
    longitude: -0.24,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const togglePanel = () => {
    const toValue = isPanelVisible ? 0 : 1;
    Animated.timing(panelAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setIsPanelVisible(!isPanelVisible));
  };

  const panelWidth = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "60%"], 
  });

  const panelOpacity = panelAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  async function fetchCuisines() {
    const { data, error } = await supabase.from("cuisines").select("*");
    if (error) {
      console.error("Error fetching cuisines:", error);
    } else {
      const cuisinesWithAll = [
        { label: "All", value: null },
        ...data.map((cuisine) => ({
          label: cuisine.cuisine_name,
          value: cuisine.cuisine_id,
        })),
      ];
      setCuisines(cuisinesWithAll);
    }
  }

  async function fetchRestaurants(latitude, longitude) {
    const { data, error } = await supabase.rpc(
      `get_restaurants_within_distance`,
      { user_lat: Number(latitude), user_long: Number(longitude) }
    );
    console.log("All restaurants fetched:", data);
    if (error) {
      console.error("Error fetching restaurants:", error);
    }
    if (data && data.length > 0) {
      setRestaurants(data);
      checkRestaurantAvailability(data, availabilityTime);
    } else {
      console.log("No restaurants found");
    }
  }

  async function checkRestaurantAvailability(restaurants, time, partySize) {
    let availableList = [];
    const timestamp = new Date().toISOString();
    console.log(`Availability check performed at: ${timestamp}`);
    console.log(`Checking availability for time: ${time.toISOString()}`);
    for (const restaurant of restaurants) {
      const { data, error } = await supabase.rpc(
        "check_restaurant_availability",
        {
          chosen_restaurant_id: restaurant.restaurant_id,
          time_to_check: time.toISOString(),
          group_size: partySize,
        }
      );
      if (error) {
        console.error(
          `Error checking availability for ${restaurant.restaurant_name}:`,
          error
        );
      } else if (data === true) {
        availableList.push(restaurant);
      }
    }

    console.log(
      `Available restaurants after check at ${timestamp}:`,
      availableList
    );
    setAvailableRestaurants(availableList);
  }

  async function filterRestaurantsByCuisine(restaurants, cuisineId) {
    if (cuisineId === null) {
      setCuisineFilteredRestaurants(restaurants);
      return;
    }
    const { data, error } = await supabase.rpc(
      "filter_restaurants_by_cuisine",
      {
        chosen_cuisine_id: cuisineId,
      }
    );
    if (error) {
      console.error("Error filtering by cuisine:", error);
    } else {
      const cuisineIds = new Set(data.map((r) => r.restaurant_id));
      const filtered = restaurants.filter((restaurant) =>
        cuisineIds.has(restaurant.restaurant_id)
      );

      setCuisineFilteredRestaurants(filtered);
      console.log("Cuisine filtered restaurants:", filtered);
    }
  }

  function renderRestaurantItem({ item }) {
    const distance = getDistance(
      {
        latitude: tempInitialLocation.latitude,
        longitude: tempInitialLocation.longitude,
      },
      { latitude: item.latitude, longitude: item.longitude }
    );
    const distanceInKm = (distance / 1000).toFixed(2);
    return (
      <TouchableOpacity
        onPress={() => {
          router.push(`/pages/restaurant/${item.restaurant_id}`);
        }}
      >
        <View style={styles.restaurantItem}>
          <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
          <Text style={styles.restaurantDistance}>{distanceInKm} km away</Text>
        </View>
      </TouchableOpacity>
    );
  }

  useEffect(() => {
    fetchCuisines();
    fetchRestaurants(
      tempInitialLocation.latitude,
      tempInitialLocation.longitude
    );
  }, []);

  useEffect(() => {
    let targetTime = new Date();

    switch (availabilityDropDownValue) {
      case "15 minutes":
        targetTime.setMinutes(targetTime.getMinutes() + 15);
        break;
      case "1 hour":
        targetTime.setHours(targetTime.getHours() + 1);
        break;
      case "all":
        targetTime = null;
        break;
      default:
        break;
    }
    setAvailabilityTime(targetTime);
    console.log(
      `${availabilityDropDownValue} selected, target time: ${
        targetTime ? targetTime.toISOString() : "None (Show all)"
      }`
    );

    if (availabilityDropDownValue === "all") {
      setAvailableRestaurants(restaurants);
    } else {
      if (partySize !== null) {
        checkRestaurantAvailability(restaurants, targetTime, partySize);
      }
    }
  }, [availabilityDropDownValue, restaurants, partySize]);

  useEffect(() => {
    filterRestaurantsByCuisine(availableRestaurants, selectedCuisine);
  }, [selectedCuisine, availableRestaurants, partySize]);

  if (!latitude || !longitude) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Map */}
          <MapView initialRegion={tempInitialLocation} style={styles.map}>
            <Marker coordinate={tempInitialLocation} title="You are here">
              <Image
                style={styles.locationMarker}
                source={require("../../assets/location-marker.png")}
              />
            </Marker>

            {cuisineFilteredRestaurants.map((restaurant) => (
              <Marker
                key={restaurant.restaurant_id}
                coordinate={{
                  latitude: restaurant.latitude,
                  longitude: restaurant.longitude,
                }}
                title={restaurant.restaurant_name}
                onPress={() => {
                  router.push(`/pages/restaurant/${restaurant.restaurant_id}`);
                }}
              />
            ))}
          </MapView>

          {/* Open Filters Button */}
          <TouchableOpacity
            style={styles.openFiltersButton}
            onPress={togglePanel}
          >
            <Text style={styles.panelButtonText}>
              {isPanelVisible ? "Hide Filters" : "Show Filters"}
            </Text>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={signOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Sliding Panel */}
          <Animated.View
            style={[
              styles.slidingPanel,
              { width: panelWidth, opacity: panelOpacity },
            ]}
          >
            <View style={styles.panelContent}>
              <TouchableOpacity
                style={styles.panelButton}
                onPress={togglePanel}
              >
                <Text style={styles.panelButtonText}>
                  {isPanelVisible ? "Hide Filters" : "Show Filters"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.panelTitle}>Filter Options</Text>

              {/* Availability Dropdown */}
              <DropDownPicker
                open={openAvailabilityDropdown}
                value={availabilityDropDownValue}
                items={[
                  { label: "All", value: "all" },
                  { label: "Available in 15", value: "15 minutes" },
                  { label: "Available in 1 hour", value: "1 hour" },
                ]}
                setOpen={setOpenAvailabilityDropdown}
                setValue={setAvailabilityDropDownValue}
                placeholder="Select Availability"
                style={styles.dropdown}
                dropDownStyle={styles.dropdownList}
                zIndex={3}
              />

              {/* Party Size Dropdown */}
              {availabilityDropDownValue !== "all" && (
                <DropDownPicker
                  open={openPartySizeDropdown}
                  value={partySize}
                  items={Array.from({ length: 8 }, (_, index) => ({
                    label: `${index + 1}`,
                    value: index + 1,
                  }))}
                  setOpen={setOpenPartySizeDropdown}
                  setValue={setPartySize}
                  placeholder="Select Party Size"
                  style={styles.dropdown}
                  dropDownStyle={styles.dropdownList}
                  zIndex={2}
                />
              )}

              {/* Cuisine Dropdown */}
              <DropDownPicker
                open={openCuisineDropdown}
                value={selectedCuisine}
                items={cuisines}
                setOpen={setOpenCuisineDropdown}
                setValue={setSelectedCuisine}
                placeholder="Select Cuisine"
                style={styles.dropdown}
                dropDownStyle={styles.dropdownList}
                zIndex={1}
              />
            </View>
          </Animated.View>

          {/* Restaurant List Heading and List */}
          <Text style={styles.restaurantListHeading}>Restaurant List</Text>
          <FlatList
            data={cuisineFilteredRestaurants}
            renderItem={renderRestaurantItem}
            keyExtractor={(item) => item.restaurant_id}
            contentContainerStyle={styles.restaurantListContainer}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  map: {
    height: "55%", 
    width: "100%",
  },
  signOutButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "#ff5c5c",
    padding: 10,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  locationMarker: {
    width: 30,
    height: 30,
  },
  openFiltersButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  slidingPanel: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: "#f1f1f1",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    padding: 20,
    zIndex: 10,
  },
  panelContent: {
    flex: 1,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  restaurantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: 'center', 
  },
  restaurantName: {
    fontSize: 16,
  },
  restaurantDistance: {
    color: "#888",
    fontSize: 12,
  },
  dropdown: {
    marginBottom: 10,
  },
  dropdownList: {
    zIndex: 5,
  },
  panelButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  panelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  restaurantListHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "center", 
  },
  restaurantListContainer: {
    flexGrow: 0,  
    paddingHorizontal: 10,
  },
});

export default Home;
