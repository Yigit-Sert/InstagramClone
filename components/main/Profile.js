import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Button } from "react-native";
import { connect } from "react-redux";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import firebaseConfig from "../auth/firebaseConfig";
import { firebase } from "@react-native-firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const { currentUser, posts } = props;
    console.log({ currentUser, posts });

    if (!props.route.params || !props.route.params.uid) {
      console.log("UID is not provided");
      return;
    }

    const uid = props.route.params.uid;

    if (uid === auth.currentUser.uid) {
      if (currentUser) {
        setUser(currentUser);
      }
      if (posts) {
        setUserPosts(posts);
      }
    } else {
      const userDocRef = doc(db, "users", uid);
      getDoc(userDocRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data());
          } else {
            console.log("User does not exist");
          }
        })
        .catch((error) => {
          console.error("Error getting user data: ", error);
        });

      const postsCollectionRef = collection(db, "posts", uid, "userPosts");
      const q = query(postsCollectionRef, orderBy("creation", "asc"));
      getDocs(q)
        .then((snapshot) => {
          let posts = snapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            return { id, ...data };
          });
          setUserPosts(posts);
        })
        .catch((error) => {
          console.error("Error getting posts: ", error);
        });
    }

    if ((props.following ?? []).indexOf(uid) > -1) {
      setFollowing(true);
    } else {
      setFollowing(false);
    }
  }, [props.route.params, props.currentUser, props.posts, props.following]);

  const { currentUser, posts } = props;
  console.log({ currentUser, posts });

  const onFollow = () => {
    const followingRef = doc(
      db,
      "following",
      auth.currentUser.uid,
      "userFollowing",
      props.route.params.uid
    );
    setDoc(followingRef, {});
  };

  const onUnfollow = () => {
    const followingRef = doc(
      db,
      "following",
      auth.currentUser.uid,
      "userFollowing",
      props.route.params.uid
    );
    deleteDoc(followingRef);
  };

  const onLogout = () => {
    auth.signOut();
  }

  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== auth.currentUser.uid ? (
          <View>
            {following ? (
              <Button
                title="Following"
                onPress={() => {
                  onUnfollow();
                }}
              />
            ) : (
              <Button
                title="Follow"
                onPress={() => {
                  onFollow();
                }}
              />
            )}
          </View>
        ) :
          <Button
            title="Logout"
            onPress={() => {
              onLogout();
            }}
          />
        }
      </View>
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
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
    marginTop: 40,
  },
  containerInfo: {
    margin: 20,
  },
  containerGallery: {
    flex: 1,
  },
  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },
  containerImage: {
    flex: 1 / 3,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
