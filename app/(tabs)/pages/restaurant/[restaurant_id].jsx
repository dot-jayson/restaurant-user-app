import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const restaurantProfile = () => {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const { restaurant_id } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-xl"> Loading ... </Text>
      </View>
    );
  }

  function handleImageClick(imageUrl) {
    console.log("Selected Image URL:", imageUrl);
    setSelectedImage(imageUrl);
    setModalVisible(true);
  }
  function closeModal() {
    setModalVisible(false);
    setSelectedImage(null);
  }
  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-[#3772FF] rounded-lg"
        >
          <Text className="text-white text-lg font-semibold">Back</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-semibold text-gray-800 mb-2">
        {restaurant["restaurant_name"]}
      </Text>
      <Text className="text-base text-gray-600 mb-4">
        {restaurant["description"]}
      </Text>
      <Image
        source={{ uri: restaurant["restaurant_img"] }}
        className="w-full h-64 rounded-lg mb-4"
      />
      {restaurant["is_menu_img"] ? (
        <TouchableOpacity
          onPress={() => handleImageClick(restaurant["menu_link"])}
        >
          <Image
            source={{ uri: restaurant["menu_link"] }}
            className="w-full h-64 rounded-lg mb-4"
          />
        </TouchableOpacity>
      ) : (
        <Link href={restaurant["menu_link"]} className="text-blue-500 mb-4">
          menu link
        </Link>
      )}
      <Text className="text-base text-gray-700 mb-4">
        {restaurant["restaurant_email"]}
      </Text>
      <Pressable
        onPress={() => {
          router.push(`/pages/restaurant/${restaurant_id}/booking_page`);
        }}
        className="mt-4 w-[200px] mx-auto bg-[#3772FF] p-4 rounded-full shadow-md "
      >
        <Text className="text-white text-center font-semibold">Book Table</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-black">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full object-contain"
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default restaurantProfile;
