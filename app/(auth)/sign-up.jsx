import { View, Text, TextInput } from "react-native";
import React, { useState } from "react";

const SignUp = () => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  return (
    <View className="flex-1 bg-[#fff] items-center justify-center gap-3">
      <TextInput
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="Enter Username"
      />
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter Password"
      />
      <TextInput
        value={newConfirmPassword}
        onChangeText={setNewConfirmPassword}
        placeholder="Confirm Password"
      />
    </View>
  );
};

export default SignUp;
