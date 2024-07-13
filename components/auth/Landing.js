import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

export default function Landing({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("Register")}
        style={{ marginBottom: 10 }}
      >
        Register
      </Button>
      <Button mode="contained" onPress={() => navigation.navigate("Login")}>
        Login
      </Button>
    </View>
  );
}
