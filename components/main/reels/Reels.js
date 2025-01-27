import React from "react";
import { View, Text, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ReelsComponent from "./ReelsComponent";

const Reels = () => {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  return (
    <View
      style={{
        width: windowWidth,
        height: windowHeight,
        backgroundColor: "white",
        position: "relative",
        backgroundColor: "black",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "space-between",
          zIndex: 1,
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          REELS
        </Text>
        <MaterialIcons name="camera" size={24} color="white" />
      </View>
      <ReelsComponent />
    </View>
  );
};

export default Reels;
