import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../auth/firebaseConfig";

export default function Save(props) {
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const auth = getAuth(app);
    const storage = getStorage(app);
    const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(36)}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, childPath);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed', 
      (snapshot) => {
        console.log(`transferred: ${snapshot.bytesTransferred}`);
      }, 
      (error) => {
        console.log(error);
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          savePostData(downloadURL);
          console.log(downloadURL);
        });
      }
    );
  };

  const savePostData = (downloadURL) => {
    // Function to save post data to Firestore
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} />
      <TextInput
        placeholder="Write a Caption ..."
        onChangeText={(caption) => setCaption(caption)}
      />
      <Button title="Save" onPress={() => uploadImage()} />
    </View>
  );
}
