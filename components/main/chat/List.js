import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../auth/firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function ProfileList() {
  const [profiles, setProfiles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfiles = async () => {
      const user = auth.currentUser;
      const profilesCollection = collection(db, `following/${user.uid}/userFollowing`);
      const profilesSnapshot = await getDocs(profilesCollection);
      const profilesList = profilesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProfiles(profilesList);
    };

    fetchProfiles();
  }, []);

  const handleProfilePress = (profile) => {
    navigation.navigate("Chat", { userId: profile.id, userName: profile.name });
  };

  return (
    <View>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleProfilePress(item)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
