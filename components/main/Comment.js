import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TextInput } from "react-native";

// firebase
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../auth/firebaseConfig";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// firebase     

export default function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const commentsCollectionRef = collection(
        db,
        "posts",
        props.route.params.uid,
        "userPosts",
        props.route.params.postId,
        "comments"
      );

      try {
        const snapshot = await getDocs(commentsCollectionRef);
        let comments = snapshot.docs.map((doc) => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        setComments(comments);
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }

      setPostId(props.route.params.postId);
    };

    if (props.route.params.postId !== postId) {
      fetchComments();
    }
  }, [props.route.params.postId]);

  return (
  <View>
    <FlatList 
        numColumns={1}
        horizontal={false}
        data={comments}
        renderItem={({ item }) => (
          <View>
            <Text>{item.text}</Text>
          </View>
        )}
    />
  </View>
  )
}
