import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { connect } from "react-redux";
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  runTransaction,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../auth/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function Feed(props) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (
      props.following &&
      props.usersFollowingLoaded !== undefined &&
      props.usersFollowingLoaded === props.following.length &&
      props.following.length !== 0
    ) {
      props.feed.sort((x, y) => x.creation - y.creation);
      setPosts(props.feed);
    }
  }, [props.usersFollowingLoaded, props.following, props.users, props.feed]);

  const onLikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;
  
    try {
      // Reference to the like document
      const likeRef = doc(
        db,
        "posts",
        uid,
        "userPosts",
        postId,
        "likes",
        currentUserUid
      );
  
      // Reference to the post document
      const postRef = doc(db, "posts", uid, "userPosts", postId);
  
      // Use a transaction to set the like and update the likeCounter
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Post does not exist!";
        }
  
        // Get the current likeCounter value or initialize it to 0
        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter + 1;
  
        // Set the like document
        transaction.set(likeRef, {});
  
        // Update the likeCounter field
        transaction.update(postRef, { likeCounter: newLikeCounter });
      });
  
      console.log("Like successfully added and likeCounter updated!");
    } catch (error) {
      console.error("Error adding like: ", error);
      // Handle error
    }
  };
  
  const onDislikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;
  
    // Reference to the like document
    const likeRef = doc(
      db,
      "posts",
      uid,
      "userPosts",
      postId,
      "likes",
      currentUserUid
    );
  
    // Reference to the post document
    const postRef = doc(db, "posts", uid, "userPosts", postId);
  
    try {
      // Use a transaction to delete the like and update the likeCounter
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists()) {
          throw "Post does not exist!";
        }
  
        // Get the current likeCounter value or initialize it to 0
        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter - 1;
  
        // Delete the like document
        transaction.delete(likeRef);
  
        // Update the likeCounter field
        transaction.update(postRef, { likeCounter: newLikeCounter });
      });
  
      console.log("Like successfully removed and likeCounter updated!");
    } catch (error) {
      console.error("Error removing like: ", error);
      // Handle error
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={1}
          horizontal={false}
          data={posts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Text style={styles.container}>{item.user.name}</Text>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
              {item.currentUserLike ? (
                <Button
                  title="Dislike"
                  onPress={() => onDislikePress(item.user.uid, item.id)}
                />
              ) : (
                <Button
                  title="Like"
                  onPress={() => onLikePress(item.user.uid, item.id)}
                />
              )}
              <Text
                onPress={() =>
                  props.navigation.navigate("Comment", {
                    postId: item.id,
                    uid: item.user.uid,
                  })
                }
              >
                View Comments...
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  containerImage: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
