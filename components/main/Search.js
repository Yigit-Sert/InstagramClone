// Search.js
import React, { useState, useEffect } from "react";
import { View, FlatList, Image, StyleSheet } from "react-native";
import { TextInput, List, Divider } from "react-native-paper"; 
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
} from "firebase/firestore";
import { db } from "../auth/firebaseConfig";

export default function Search(props) {
  const [users, setUsers] = useState([]);
  const [allUserPosts, setAllUserPosts] = useState([]);

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

  const fetchAllUserPosts = async () => {
    try {
      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const allPosts = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userPostsCollectionRef = collection(db, "posts", userId, "userPosts");
        const userPostsSnapshot = await getDocs(userPostsCollectionRef);
        
        userPostsSnapshot.forEach((postDoc) => {
          const data = postDoc.data();
          const id = postDoc.id;
          allPosts.push({ id, ...data });
        });
      }

      setAllUserPosts(allPosts);
    } catch (error) {
      console.error("Error fetching user posts: ", error);
    }
  };

  useEffect(() => {
    fetchAllUserPosts();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        label="Search"
        placeholder="Search users..."
        onChangeText={(search) => fetchUsers(search)}
        style={{ margin: 10 }}
      />
      <FlatList
      numColumns={3}
      horizontal={false}
        data={users.length > 0 ? users : allUserPosts}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => {
          if (users.length > 0) {
            return (
              <List.Item
                title={item.name}
                onPress={() =>
                  props.navigation.navigate("Profile", { uid: item.id })
                }
              />
            );
          } else {
            return (
              <View style={styles.containerImage}>
                <Image style={styles.image} source={{ uri: item.downloadURL }} />
              </View>
            );
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});
