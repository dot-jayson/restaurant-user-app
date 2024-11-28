import {
  View,
  Text,
  Button,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

const bookingPage = () => {
  const router = useRouter();

  const { restaurant_id } = useLocalSearchParams();

  const [biggestTable, setBiggestTable] = useState();
  const [restaurant, setRestaurant] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState(new Date());
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedGroupSize, setSelectedGroupSize] = useState();
  const [userId, setUserId] = useState();

  async function fetchRestaurant() {
    let { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("restaurant_id", restaurant_id);
    setRestaurant(data[0]);
    if (error) {
      console.error("Error fetching restaurant:", error);
    } else {
      console.log(data[0]);
    }
  }

  async function fetchHighestTable() {
    let { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .order("size", { ascending: false })
      .limit(1);
    setBiggestTable(data[0].size);
    if (error) {
      console.error("Error fetching restaurant:", error);
    } else {
      console.log(data[0]);
    }
  }

  async function createBooking() {
    const { data, error } = await supabase.rpc("create_booking", {
      booking_time: date.toISOString().slice(0, -5).replace("T", " ") + "+00",
      chosen_restaurant_id: restaurant_id,
      customer_id: userId,
      customer_info: additionalInfo,
      group_size: selectedGroupSize,
    });

    if (error) {
      console.error("Error creating booking:", error);
    }

    if (data && data.length > 0) {
      console.log(data[0]);
      createBookingAlert(data[0]);
    }
    if (!data || data.length === 0) {
      failedBookingAlert();
    }
  }

  const failedBookingAlert = () =>
    Alert.alert("Timeslot Unavailable", "", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  async function getUserId() {
    const { data, error } = await supabase.auth.getSession();

    setUserId(data.session.user.id);

    if (error) {
      console.error(error);
    }
  }
  const getDate = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const maxGroupSize = (max) => {
    let arr = [];
    for (let i = 1; i < max + 1; i++) {
      arr.push(<Picker.Item label={i} value={i} key={i} />);
    }
    return arr;
  };

  const createBookingAlert = (data) => {
    Alert.alert(
      "Booking Confirmed!",
      ` Your booking for ${
        restaurant.restaurant_name
      } has been confirmed for ${format(
        data.booking_start_time,
        "dd MMMM yyyy 'at' hh:mm a"
      )} to ${format(data.booking_end_time, "hh:mm a")} for a party of ${
        data.party_size
      } `,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchRestaurant(), fetchHighestTable(), getUserId()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Text className="text-center text-lg font-semibold mt-4">
        Loading ...
      </Text>
    );
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
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">
          {restaurant["restaurant_name"]}
        </Text>
        <Text className="text-lg font-medium text-gray-700 mb-2">
          Choose group size
        </Text>
        <Picker
          selectedValue={selectedGroupSize}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedGroupSize(itemValue);
          }}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ddd",
            marginBottom: 16,
          }}
        >
          {maxGroupSize(biggestTable)}
        </Picker>

        <Text className="text-lg font-medium text-gray-700 mb-4">
          Select booking time
        </Text>
        <View className="mb-6">
          <DateTimePicker
            value={date}
            mode="datetime"
            is24Hour={true}
            minuteInterval={5}
            display="default"
            onChange={getDate}
            style={{ width: "100%", marginBottom: 16 }}
          />
        </View>
        <Text className="text-lg font-medium text-gray-700 mb-4">
          Additional info (optional)
        </Text>
        <TextInput
          placeholder="Any additional info"
          onChangeText={(newText) => setAdditionalInfo(newText)}
          value={additionalInfo}
          className="h-16 border border-gray-300 rounded-lg px-4 py-2 text-lg mb-6"
        />

        <TouchableOpacity
          onPress={createBooking}
          className="mt-6 w-[200px] mx-auto bg-[#3772FF] p-4 rounded-full shadow-md"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Confirm Booking
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default bookingPage;
