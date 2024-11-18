import { View, Text, TextInput } from "react-native";
import React from "react";
import { useState } from "react";
const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter Username"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
      />
    </View>
  );
};

export default SignIn;
