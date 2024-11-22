import { View, Text, Image, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Link, useLocalSearchParams, useRouter } from "expo-router";

const restaurantProfile = () => {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { restaurant_id } = useLocalSearchParams();

  async function fetchRestaurant() {
    let { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("restaurant_id", restaurant_id);
    setRestaurant(data[0]);
    if (error) {
      console.error("Error fetching restaurant:", error);
    } else {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (restaurant_id) {
      fetchRestaurant();
    }
  }, [restaurant_id]);

  if (isLoading) {
    return <Text> loading ... </Text>;
  }
  return (
    <View>
      <Text>{restaurant["restaurant_name"]}</Text>
      <Text>{restaurant["description"]}</Text>
      <Image
        source={{ uri: restaurant["restaurant_img"] }}
        style={{ width: 300, height: 300 }}
      />
      {restaurant["is_menu_img"] ? (
        <Image
          source={{ uri: restaurant["menu_link"] }}
          style={{ width: 300, height: 300 }}
        />
      ) : (
        <Link href={restaurant["menu_link"]}>menu link</Link>
      )}
      <Text>{restaurant["restaurant_email"]}</Text>
      <Button
        title="Book Table"
        onPress={() => {
          router.push(`/pages/restaurant/${restaurant_id}/booking_page`);
        }}
      />
    </View>
  );
};

export default restaurantProfile;
