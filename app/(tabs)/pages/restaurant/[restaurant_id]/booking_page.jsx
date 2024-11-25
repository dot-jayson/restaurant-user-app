import { View, Text, Button, TextInput } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const bookingPage = () => {
  const router = useRouter();

  const { restaurant_id } = useLocalSearchParams();

  const [biggestTable, setBiggestTable] = useState();
  const [restaurant, setRestaurant] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState(new Date());
  // const [partySize, setPartySize] = useState();
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [selectedGroupSize, setSelectedGroupSize] = useState();
  const [userId, setUserId] = useState();

  const [bookingData, setBookingData] = useState();

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
      booking_time: date,
      chosen_restaurant_id: restaurant_id,
      customer_id: userId,
      customer_info: additionalInfo,
      group_size: selectedGroupSize,
    });

    if (error) {
      console.error("Error creating booking:", error);
    }
    if (data) {
      console.log(data);
      setBookingData(data);
    }
  }

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

  const redirectBooking = () => {
    if (bookingData) {
      router.push({
        pathname: `/pages/restaurant/${restaurant_id}/confirmation_page`,
        booking_data: bookingData,
      });
    }
  };

  const combinedFunctions = () => {
    createBooking();
    redirectBooking();
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchRestaurant(), fetchHighestTable(), getUserId()]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <Text>Loading ...</Text>;
  }

  return (
    <View>
      <Text>{restaurant["restaurant_name"]}</Text>
      <Text>choose group size</Text>
      <Picker
        selectedValue={selectedGroupSize}
        onValueChange={(itemValue, itemIndex) => {
          setSelectedGroupSize(itemValue);
        }}
      >
        {maxGroupSize(biggestTable)}
      </Picker>

      <DateTimePicker
        value={date}
        mode="datetime"
        is24Hour={true}
        minuteInterval={5}
        display="default"
        onChange={getDate}
      />

      <TextInput
        style={{ height: 40 }}
        placeholder="Any additional info"
        onChangeText={(newText) => setAdditionalInfo(newText)}
        defaultValue={additionalInfo}
      />

      <Button title="confirm time" onPress={combinedFunctions}></Button>
    </View>
  );
};

export default bookingPage;
