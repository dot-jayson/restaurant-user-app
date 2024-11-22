import { View, Text, Button, TextInput } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../../lib/supabase";
import { useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

const bookingPage = () => {
  const { restaurant_id } = useLocalSearchParams();

  const [biggestTable, setBiggestTable] = useState();
  const [restaurant, setRestaurant] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [date, setDate] = useState(new Date());
  const [partySize, setPartySize] = useState();
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [selectedGroupSize, setSelectedGroupSize] = useState();

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

  const getDate = (event, selectedDate) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const maxGroupSize = (max) => {
    let arr = [];
    for (let i = 1; i < max + 1; i++) {
      arr.push(<Picker.Item label={i} value={i} />);
    }
    return arr;
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchRestaurant(), fetchHighestTable()]);
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
        selectedValue={biggestTable}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedGroupSize(itemValue)
        }
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

      <Button title="confirm time"></Button>
    </View>
  );
};

export default bookingPage;
