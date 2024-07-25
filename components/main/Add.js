import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { StyleSheet, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button, Text } from "react-native-paper";

export default function Add({ navigation }) {
  const [facing, setFacing] = useState("back");
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [media, setMedia] = useState(null);
  // const [isVideo, setIsVideo] = useState(false);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setMedia({ uri: data.uri, type: 'image' });
    }
  };

/*   const recordVideo = async () => {
    if (camera) {
      const data = await camera.recordAsync(null);
      setMedia({ uri: data.uri, type: 'video' });
    }
  };

  const stopVideoRecording = async () => {
    if (camera) {
      camera.stopRecording();
    }
  }; */

  const pickMedia = async (mediaType) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia({ uri: result.assets[0].uri, type: mediaType === ImagePicker.MediaTypeOptions.Images ? 'image' : 'video' });
    }
  };

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your camera permission to show the camera
        </Text>
        <Button onPress={requestPermission} mode="contained">Grant Permission</Button>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ratio={"1:1"}
          style={styles.fixedRatio}
          facing={facing}
          ref={ref => setCamera(ref)}
        />
      </View>
      <Button style={{ margin: 2 }} mode="contained" onPress={toggleCameraFacing}>Flip Camera</Button>
      <Button style={{ margin: 2 }} mode="contained" onPress={takePicture}>Take Picture</Button>
      {/* <Button style={{ margin: 2 }} mode="contained" onPress={recordVideo}>Record Video</Button> */}
      {/* <Button style={{ margin: 2 }} mode="contained" onPress={stopVideoRecording}>Stop Recording</Button> */}
      <Button style={{ margin: 2 }} mode="contained" onPress={() => pickMedia(ImagePicker.MediaTypeOptions.Images)}>Pick Image From Gallery</Button>
      <Button style={{ margin: 2 }} mode="contained" onPress={() => pickMedia(ImagePicker.MediaTypeOptions.Videos)}>Pick Video From Gallery</Button>
      <Button style={{ margin: 2 }} mode="contained" onPress={() => navigation.navigate('Save', { media })}>Save</Button>
      {media && <Image source={{ uri: media.uri }} style={{ flex: 1 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    flexDirection: "row",
  },
  fixedRatio: {
    flex: 1,
    aspectRatio: 1,
  },
});
