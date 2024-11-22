// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// import MapView, { Marker } from "react-native-maps";
// import useLocation from "../../hooks/useLocation";
// import { useRouter } from "expo-router";
// import { supabase } from "../../lib/supabase";
// import { Button } from "@rneui/themed";
// import DropDownPicker from "react-native-dropdown-picker";

// const Home = () => {
//   const { latitude, longitude, errorMsg } = useLocation();
//   const [restaurants, setRestaurants] = useState([]);
//   const [availabilityDropDownOpen, setAvailabilityDropDownOpen] =
//     useState(false);
//   const [cuisineDropDownOpen, setCuisineDropDownOpen] = useState(false);
//   const [availabilityDropDownValue, setAvailabilityDropDownValue] =
//     useState("all");
//   const [availabilityTime, setAvailabilityTime] = useState(null);
//   const [availableRestaurants, setAvailableRestaurants] = useState([]);
//   const [cuisines, setCuisines] = useState([]);
//   const [selectedCuisine, setSelectedCuisine] = useState(null);
//   const router = useRouter();
//   async function signOut() {
//     const { error } = await supabase.auth.signOut();
//     router.replace("/");
//   }

//   const userLocation = {
//     latitude: Number(latitude),
//     longitude: Number(longitude),
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   };
//   const tempInitialLocation = {
//     latitude: 51.5,
//     longitude: -0.24,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   };

//   async function fetchRestaurants(latitude, longitude) {
//     const { data, error } = await supabase.rpc(
//       `get_restaurants_within_distance`,
//       { user_lat: Number(latitude), user_long: Number(longitude) }
//     );
//     console.log("All restaurants fetched:", data);
//     if (error) {
//       console.error("Error fetching restaurants:", error);
//     }
//     if (data && data.length > 0) {
//       setRestaurants(data);
//       checkRestaurantAvailability(data, availabilityTime);
//     } else {
//       console.log("No restaurants found");
//     }
//   }

//   // Fetch Cuisines
//   async function fetchCuisines() {
//     const { data, error } = await supabase.from("cuisines").select("*");
//     if (error) {
//       console.error("Error fetching cuisines:", error);
//     } else {
//       setCuisines(
//         data.map((cuisine) => ({
//           label: cuisine.cuisine_name,
//           value: cuisine.cuisine_id,
//         }))
//       );
//     }
//   }

//   // Filter Restaurants by Cuisine
//   function filterRestaurantsByCuisine() {
//     if (!selectedCuisine) {
//       setAvailableRestaurants(restaurants);
//     } else {
//       const filtered = restaurants.filter(
//         (restaurant) => restaurant.cuisine_id === selectedCuisine
//       );
//       setAvailableRestaurants(filtered);
//     }
//   }

//   async function checkRestaurantAvailability(restaurants, time) {
//     let availableList = [];
//     const timestamp = new Date().toISOString();
//     console.log(`Availability check performed at: ${timestamp}`);
//     console.log(`Checking availability for time: ${time.toISOString()}`);

//     for (const restaurant of restaurants) {
//       const { data, error } = await supabase.rpc(
//         "check_restaurant_availability",
//         {
//           chosen_restaurant_id: restaurant.restaurant_id,
//           time_to_check: time.toISOString(),
//         }
//       );
//       if (error) {
//         console.error(
//           `Error checking availability for ${restaurant.restaurant_name}:`,
//           error
//         );
//       } else if (data === true) {
//         availableList.push(restaurant);
//       }
//     }

//     console.log(
//       `Available restaurants after check at ${timestamp}:`,
//       availableList
//     );
//     setAvailableRestaurants(availableList);
//   }

//   function renderRestaurantItem({ item }) {
//     return (
//       <TouchableOpacity
//         onPress={() => {
//           router.push(`/pages/restaurant/${item.restaurant_id}`);
//         }}
//       >
//         <View className="bg-white p-4 m-2 rounded-lg shadow-sm">
//           <Text className="text-lg text-gray-800">{item.restaurant_name}</Text>
//         </View>
//       </TouchableOpacity>
//     );
//   }
//   useEffect(() => {
//     fetchRestaurants(
//       tempInitialLocation.latitude,
//       tempInitialLocation.longitude
//     );
//     fetchCuisines();
//   }, []);

//   useEffect(() => {
//     let targetTime = new Date();
//     switch (availabilityDropDownValue) {
//       case "available15":
//         targetTime.setMinutes(targetTime.getMinutes() + 15);
//         break;
//       case "available60":
//         targetTime.setHours(targetTime.getHours() + 1);

//         break;
//       case "all":
//         targetTime = null;
//         break;
//       default:
//         break;
//     }
//     setAvailabilityTime(targetTime);
//     console.log(
//       `${availabilityDropDownValue} selected, target time: ${
//         targetTime ? targetTime.toISOString() : "All" //
//       }`
//     );

//     if (targetTime === null) {
//       // show all restaurants when all is selected
//       setAvailableRestaurants(restaurants); // Show all restaurants without filtering
//     } else {
//       //
//       checkRestaurantAvailability(restaurants, targetTime);
//     }
//   }, [availabilityDropDownValue, restaurants]);

//   useEffect(() => {
//     filterRestaurantsByCuisine(); // Filter restaurants by selected cuisine
//   }, [selectedCuisine, restaurants]);

//   if (!latitude || !longitude) {
//     return (
//       <SafeAreaView>
//         <Text>Loading...</Text>
//       </SafeAreaView>
//     );
//   }
//   return (
//     <SafeAreaProvider>
//       <SafeAreaView className="flex-1">
//         <View className="relative flex-1">
//           <View style={styles.verticallySpaced}>
//             <Button title="Sign out" onPress={() => signOut()} />
//           </View>
//           <MapView initialRegion={tempInitialLocation} style={styles.map}>
//             <Marker coordinate={tempInitialLocation} title="You are here">
//               <Image
//                 className="w-[50px] h-[50px]"
//                 source={require("../../assets/location-marker.png")}
//               />
//             </Marker>
//             {availableRestaurants.map((restaurant) => {
//               return (
//                 <Marker
//                   key={restaurant.restaurant_id}
//                   coordinate={{
//                     latitude: restaurant.latitude,
//                     longitude: restaurant.longitude,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                   }}
//                   title={restaurant.restaurant_name}
//                   onPress={() => {
//                     router.push(
//                       `/pages/restaurant/${restaurant.restaurant_id}`
//                     );
//                   }}
//                 />
//               );
//             })}
//           </MapView>
//           <View className="flex-1 p-4">
//             <Text className="text-center text-xl font-bold mb-4">
//               Restaurant List
//             </Text>
//             <DropDownPicker
//               open={availabilityDropDownOpen}
//               value={availabilityDropDownValue}
//               items={[
//                 { label: "All", value: "all" },
//                 { label: "Available in 15", value: "available15" },
//                 { label: "Available in 1 hour", value: "available60" },
//               ]}
//               setOpen={setAvailabilityDropDownOpen}
//               setValue={setAvailabilityDropDownValue}
//               placeholder="Select Availability"
//             />
//             <DropDownPicker
//               open={cuisineDropDownOpen}
//               value={selectedCuisine}
//               items={cuisines}
//               setOpen={setCuisineDropDownOpen}
//               setValue={setSelectedCuisine}
//               placeholder="Select Cuisine"
//             />

//             {availableRestaurants.length === 0 ? (
//               <Text>No Restaurants Available</Text>
//             ) : (
//               <FlatList
//                 data={availableRestaurants}
//                 renderItem={renderRestaurantItem}
//                 keyExtractor={(item) => item.restaurant_id}
//               />
//             )}
//           </View>
//         </View>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   innerContainer: {
//     flex: 1,
//   },
//   buttonContainer: {
//     margin: 10,
//   },
//   map: {
//     height: "50%",
//     width: "100%",
//   },
//   restaurantListContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   listTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   restaurantItem: {
//     padding: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//   },
//   restaurantName: {
//     fontSize: 16,
//   },
// });
// export default Home;

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import useLocation from "../../hooks/useLocation";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Button } from "@rneui/themed";
import DropDownPicker from "react-native-dropdown-picker";
const Home = () => {
  const { latitude, longitude, errorMsg } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [availableRestaurants, setAvailableRestaurants] = useState([]);
  const [cuisineFilteredRestaurants, setCuisineFilteredRestaurants] = useState(
    []
  );
  const [openCuisineDropdown, setOpenCuisineDropdown] = useState(false);
  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [openAvailabilityDropdown, setOpenAvailabilityDropdown] =
    useState(false);
  const [availabilityDropDownValue, setAvailabilityDropDownValue] =
    useState("all");
  const [availabilityTime, setAvailabilityTime] = useState(null);
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
  // Fetch Cuisines
  async function fetchCuisines() {
    const { data, error } = await supabase.from("cuisines").select("*");
    if (error) {
      console.error("Error fetching cuisines:", error);
    } else {
      setCuisines(
        data.map((cuisine) => ({
          label: cuisine.cuisine_name,
          value: cuisine.cuisine_id,
        }))
      );
    }
  }
  // Fetch Restaurants within distance
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
  // Check Availability of Restaurants
  async function checkRestaurantAvailability(restaurants, time) {
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
  // Filter Restaurants by Cuisine
  async function filterRestaurantsByCuisine(restaurants, cuisineId) {
    if (!cuisineId) {
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
  // Render Restaurant Item
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
    fetchCuisines();
    fetchRestaurants(
      tempInitialLocation.latitude,
      tempInitialLocation.longitude
    );
  }, []);
  useEffect(() => {
    let targetTime = new Date();
    switch (availabilityDropDownValue) {
      case "available15":
        targetTime.setMinutes(targetTime.getMinutes() + 15);
        break;
      case "available60":
        targetTime.setHours(targetTime.getHours() - 25);
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
    if (targetTime === null) {
      // If "All" is selected, show all restaurants
      setAvailableRestaurants(restaurants);
    } else {
      // Otherwise, filter by availability
      checkRestaurantAvailability(restaurants, targetTime);
    }
  }, [availabilityDropDownValue, restaurants]);
  useEffect(() => {
    filterRestaurantsByCuisine(availableRestaurants, selectedCuisine);
  }, [selectedCuisine, availableRestaurants]);
  if (!latitude || !longitude) {
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <View className="relative flex-1">
          <View style={styles.verticallySpaced}>
            <Button title="Sign out" onPress={() => signOut()} />
          </View>
          <MapView initialRegion={tempInitialLocation} style={styles.map}>
            <Marker coordinate={tempInitialLocation} title="You are here" />
            {cuisineFilteredRestaurants.map((restaurant) => {
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
            <DropDownPicker
              open={openAvailabilityDropdown}
              value={availabilityDropDownValue}
              items={[
                { label: "All", value: "all" },
                { label: "Available in 15", value: "available15" },
                { label: "Available in 1 hour", value: "available60" },
              ]}
              setOpen={setOpenAvailabilityDropdown}
              setValue={setAvailabilityDropDownValue}
              placeholder="Select Availability"
            />
            <DropDownPicker
              open={openCuisineDropdown}
              value={selectedCuisine}
              items={cuisines}
              setOpen={setOpenCuisineDropdown}
              setValue={setSelectedCuisine}
              placeholder="Select Cuisine"
            />
            {cuisineFilteredRestaurants.length === 0 ? (
              <Text>No Restaurants Available</Text>
            ) : (
              <FlatList
                data={cuisineFilteredRestaurants}
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
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  buttonContainer: {
    margin: 10,
  },
  map: {
    height: "50%",
    width: "100%",
  },
  restaurantListContainer: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  restaurantItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  restaurantName: {
    fontSize: 16,
  },
});
export default Home;
