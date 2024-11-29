// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   TouchableOpacity,
//   ScrollView,
//   TouchableWithoutFeedback,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { supabase } from "../../../../lib/supabase";
// import { Link, useLocalSearchParams, useRouter } from "expo-router";
// import { Modal } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const restaurantProfile = () => {
//   const router = useRouter();
//   const [restaurant, setRestaurant] = useState();
//   const [isLoading, setIsLoading] = useState(true);
//   const { restaurant_id } = useLocalSearchParams();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);

//   async function fetchRestaurant() {
//     let { data, error } = await supabase
//       .from("restaurants")
//       .select("*")
//       .eq("restaurant_id", restaurant_id);
//     setRestaurant(data[0]);
//     if (error) {
//       console.error("Error fetching restaurant:", error);
//     } else {
//       setIsLoading(false);
//     }
//   }

//   useEffect(() => {
//     if (restaurant_id) {
//       fetchRestaurant();
//     }
//   }, [restaurant_id]);

//   if (isLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-xl"> Loading ... </Text>
//       </View>
//     );
//   }

//   function handleImageClick(imageUrl) {
//     console.log("Selected Image URL:", imageUrl);
//     setSelectedImage(imageUrl);
//     setModalVisible(true);
//   }
//   function closeModal() {
//     setModalVisible(false);
//     setSelectedImage(null);
//   }
//   return (
//     <SafeAreaView className="flex-1 p-4">
//       <View className="flex-row items-center">
//         <TouchableOpacity
//           onPress={() => router.back()}
//           className="p-2 bg-[#3772FF] rounded-lg"
//         >
//           <Text className="text-white text-lg font-semibold">Back</Text>
//         </TouchableOpacity>
//       </View>
//       <Text className="text-2xl font-semibold text-gray-800 mb-2">
//         {restaurant["restaurant_name"]}
//       </Text>
//       <Text className="text-base text-gray-600 mb-4">
//         {restaurant["description"]}
//       </Text>
//       <Image
//         source={{ uri: restaurant["restaurant_img"] }}
//         className="w-full h-64 rounded-lg mb-4"
//       />
//       {restaurant["is_menu_img"] ? (
//         <TouchableOpacity
//           onPress={() => handleImageClick(restaurant["menu_link"])}
//         >
//           <Image
//             source={{ uri: restaurant["menu_link"] }}
//             className="w-full h-64 rounded-lg mb-4"
//           />
//         </TouchableOpacity>
//       ) : (
//         <Link href={restaurant["menu_link"]} className="text-blue-500 mb-4">
//           menu link
//         </Link>
//       )}
//       <Text className="text-base text-gray-700 mb-4">
//         {restaurant["restaurant_email"]}
//       </Text>
//       <Pressable
//         onPress={() => {
//           router.push(`/pages/restaurant/${restaurant_id}/booking_page`);
//         }}
//         className="mt-4 w-[200px] mx-auto bg-[#3772FF] p-4 rounded-full shadow-md "
//       >
//         <Text className="text-white text-center font-semibold">Book Table</Text>
//       </Pressable>

//       <Modal
//         visible={modalVisible}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={closeModal}
//       >
//         <TouchableWithoutFeedback onPress={closeModal}>
//           <View className="flex-1 justify-center items-center bg-black">
//             <Image
//               source={{ uri: selectedImage }}
//               className="w-full h-full object-contain"
//               resizeMode="contain"
//             />
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default restaurantProfile;

import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
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
    if (error) {
      console.error("Error fetching restaurant:", error);
    } else {
      setRestaurant(data[0]);
      console.log("Restaurant data:", data[0]); // Log the restaurant data for debugging
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
        <Text className="text-xl">Loading ...</Text>
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
      {/* Back button and Book Table button in a row at the top */}
      <View className="flex-row justify-between items-center mb-4">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-[#3772FF] rounded-lg shadow-md"
        >
          <Text className="text-white text-lg font-semibold">Back</Text>
        </TouchableOpacity>
        {/* Book Table Button */}
        <Pressable
          onPress={() => {
            router.push(`/pages/restaurant/${restaurant_id}/booking_page`);
          }}
          className="py-2 px-4 bg-[#3772FF] rounded-lg shadow-md"
        >
          <Text className="text-white text-center font-semibold">
            Book Table
          </Text>
        </Pressable>
      </View>
      {/* Restaurant Name with additional margin-top */}
      <Text className="text-2xl font-semibold text-gray-800 mb-2 mt-4">
        {restaurant["restaurant_name"]}
      </Text>
      {/* Restaurant Email in Italics and with different color */}
      <Text className="text-base text-gray-600 italic mb-2">
        {restaurant["restaurant_email"]}
      </Text>
      {/* Render Phone Number only if available */}
      {restaurant["restaurant_phone"] && (
        <Text className="text-base text-gray-700 mb-4">
          {restaurant["restaurant_phone"]}
        </Text>
      )}
      {/* Restaurant Description with subtle padding-top */}
      <Text className="text-base text-gray-600 mb-4 pt-1">
        {restaurant["description"]}
      </Text>
      {/* Restaurant Image - Larger Size */}
      <Image
        source={{ uri: restaurant["restaurant_img"] }}
        className="w-full h-80 rounded-lg mb-6" // Larger image size (height increased)
      />
      {/* View Menu Button */}
      <View className="flex-row justify-center mt-4">
        {restaurant["is_menu_img"] ? (
          // View Menu button
          <Pressable
            onPress={() => handleImageClick(restaurant["menu_link"])}
            className="py-4 px-8 bg-[#3772FF] rounded-lg shadow-md w-4/5"
          >
            <Text className="text-white text-center font-semibold">
              View Menu
            </Text>
          </Pressable>
        ) : (
          // If no menu image, show link to the menu
          <Pressable
            onPress={() => router.push(restaurant["menu_link"])}
            className="py-4 px-8 bg-[#3772FF] rounded-lg shadow-md w-4/5" // Default blue color
          >
            <Text className="text-white text-center font-semibold">
              View Menu
            </Text>
          </Pressable>
        )}
      </View>
      {/* Modal for viewing menu image */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-70">
            <View
              className="w-[90%] h-[90%] bg-white rounded-lg p-4" // Increased white space size (h-[90%] for more height)
            >
              {/* Back Button inside the Modal */}
              <TouchableOpacity onPress={closeModal} className="mb-4">
                <Text className="text-[#3772FF] text-lg font-semibold">
                  Back
                </Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full rounded-lg" // Image fills the white space container
                resizeMode="contain" // Ensures the image is contained within the modal without distortion
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};
export default restaurantProfile;
