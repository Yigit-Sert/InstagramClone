import React, { useState } from "react";
import { View, Image } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { app } from "../auth/firebaseConfig"; // Ensure this import points to your firebase config file

export default function Save(props) {
  const [caption, setCaption] = useState("");

  const uploadImage = async () => {
    const uri = props.route.params.image;
    const auth = getAuth(app);
    const storage = getStorage(app);
    const childPath = `post/${auth.currentUser.uid}/${Math.random().toString(
      36
    )}`;

    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, childPath);
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(`transferred: ${snapshot.bytesTransferred}`);
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          savePostData(downloadURL);
        });
      }
    );
  };

  const savePostData = async (downloadURL) => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    try {
      await addDoc(
        collection(doc(db, "posts", auth.currentUser.uid), "userPosts"),
        {
          downloadURL,
          caption,
          creation: serverTimestamp(),
        }
      );
      props.navigation.popToTop();
    } catch (error) {
      console.log("Error adding document: ", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} style={{ flex: 1 }} />
      <TextInput
        label="Write a Caption ..."
        value={caption}
        onChangeText={(caption) => setCaption(caption)}
        style={{ margin: 10 }}
      />
      <Button mode="contained" onPress={() => uploadImage()} style={{ margin: 10 }}>
        Save
      </Button>
    </View>
  );
}
