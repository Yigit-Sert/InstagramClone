import React, { useState } from "react";
import { View, FlatList } from "react-native";
import { TextInput, List, Divider } from "react-native-paper"; // React Native Paper bileşenleri

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import firebaseConfig from "../auth/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Search(props) {
  const [users, setUsers] = useState([]);

  const fetchUsers = async (search) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("name", ">=", search));
    const querySnapshot = await getDocs(q);

    const usersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(usersData);
  };

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        label="Search"
        placeholder="Search users..."
        onChangeText={(search) => fetchUsers(search)}
        style={{ margin: 10 }}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            onPress={() =>
              props.navigation.navigate("Profile", { uid: item.id })
            }
          />
        )}
      />
    </View>
  );
}
