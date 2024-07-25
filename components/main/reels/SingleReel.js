import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";

const SingleReel = ({ item, index, currentIndex }) => {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const videoRef = useRef(null);
  const [mute, setMute] = useState(false);
  // const [like, setLike] = useState(item.isLike);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        onBuffer={(buffer) => console.log("Buffering", buffer)}
        onError={(error) => console.log("Error", error)}
        shouldPlay={currentIndex === index}
        isMuted={mute}
        resizeMode={Video.RESIZE_MODE_CONTAIN}
        source={{ uri: item.downloadURL }}
        style={styles.video}
      />
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setMute(!mute)}
        style={styles.muteButton}
      >
        <Ionicons
          name={mute ? "volume-mute" : "volume-high"}
          style={styles.muteIcon}
        />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <View>
          <TouchableOpacity style={styles.profileContainer}>
            <View style={styles.profileImageWrapper}>
              <Image source={item.postProfile} style={styles.profileImage} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
          <Text style={styles.description}>{item.caption}</Text>
        </View>
      </View>
      {/* <View style={styles.interactions}>
        <TouchableOpacity onPress={() => setLike(!like)} style={styles.interactionButton}>
          <AntDesign
            name={like ? 'heart' : 'hearto'}
            style={[styles.icon, { color: like ? 'red' : 'white' }]}
          />
          <Text style={styles.likes}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons
            name="ios-chatbubble-outline"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons
            name="paper-plane-outline"
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <Feather
            name="more-vertical"
            style={styles.icon}
          />
        </TouchableOpacity>
        <View style={styles.profileThumbnail}>
          <Image
            source={item.postProfile}
            style={styles.profileThumbnailImage}
          />
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  muteButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  muteIcon: {
    fontSize: 30,
    color: "white",
  },
  infoContainer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0,
    padding: 10,
  },
  profileContainer: {
    width: 150,
  },
  profileImageWrapper: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: "white",
    margin: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 100,
  },
  title: {
    color: "white",
    fontSize: 16,
  },
  description: {
    color: "white",
    fontSize: 14,
    marginHorizontal: 10,
  },
  audioInfo: {
    flexDirection: "row",
    padding: 10,
  },
  audioIcon: {
    color: "white",
    fontSize: 16,
  },
  audioText: {
    color: "white",
  },
  interactions: {
    position: "absolute",
    bottom: 10,
    right: 0,
  },
  interactionButton: {
    padding: 10,
  },
  icon: {
    color: "white",
    fontSize: 25,
  },
  likes: {
    color: "white",
  },
  profileThumbnail: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    margin: 10,
  },
  profileThumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
});

export default SingleReel;
