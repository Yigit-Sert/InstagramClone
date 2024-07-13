import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { StyleSheet, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button, Text } from "react-native-paper";

export default function Add({ navigation }) {
  const [facing, setFacing] = useState("back");
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);

  const takePicture = async () => {
    if (camera) {
      const data = await camera.takePictureAsync(null);
      setImage(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      <Button style={{ margin: 10 }} mode="contained" onPress={toggleCameraFacing}>Flip Image</Button>
      <Button style={{ margin: 10 }} mode="contained" onPress={takePicture}>Take Picture</Button>
      <Button style={{ margin: 10 }} mode="contained" onPress={pickImage}>Pick Image From Gallery</Button>
      <Button style={{ margin: 10 }} mode="contained" onPress={() => navigation.navigate('Save', {image})}>Save</Button>
      {image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
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