import React, { useState, useEffect } from "react";
import { View, FlatList, Image, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { TextInput, List, Divider, Card, Button, Text } from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { collection, query, where, getDocs, doc, runTransaction, getDoc } from "firebase/firestore";
import { db, auth } from "../auth/firebaseConfig";
import { sendLikeNotification } from "../../utils/notifications";

export default function Search(props) {
  const [users, setUsers] = useState([]);
  const [allUserPosts, setAllUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPostOwner, setSelectedPostOwner] = useState(null);

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
      const user = auth.currentUser;
      setCurrentUser(user);

      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const allPosts = [];

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userPostsCollectionRef = collection(db, "posts", userId, "userPosts");
        const userPostsSnapshot = await getDocs(userPostsCollectionRef);

        for (const postDoc of userPostsSnapshot.docs) {
          const data = postDoc.data();
          const id = postDoc.id;

          // Check if the current user has liked the post
          const likesCollectionRef = collection(db, "posts", userId, "userPosts", id, "likes");
          const likesSnapshot = await getDocs(likesCollectionRef);
          const currentUserLike = likesSnapshot.docs.some((likeDoc) => likeDoc.id === user.uid);

          allPosts.push({ id, ...data, userId, currentUserLike });
        }
      }

      setAllUserPosts(allPosts);
    } catch (error) {
      console.error("Error fetching user posts: ", error);
    }
  };

  useEffect(() => {
    fetchAllUserPosts();
  }, []);

  const openPostModal = async (post) => {
    setSelectedPost(post);
    setModalVisible(true);

    // Fetch the post owner's data
    const userDocRef = doc(db, "users", post.userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setSelectedPostOwner(userDocSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  const closePostModal = () => {
    setSelectedPost(null);
    setModalVisible(false);
    setSelectedPostOwner(null);
  };

  const onLikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;

    try {
      const likeRef = doc(db, `posts/${uid}/userPosts/${postId}/likes/${currentUserUid}`);
      const postRef = doc(db, `posts/${uid}/userPosts/${postId}`);

      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw "Post does not exist!";
        }

        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter + 1;

        transaction.set(likeRef, {});
        transaction.update(postRef, { likeCounter: newLikeCounter });

        await sendLikeNotification(uid, currentUserUid, postId);
      });

      console.log("Like successfully added and likeCounter updated!");
    } catch (error) {
      console.error("Error adding like: ", error);
    }
  };

  const onDislikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;

    const likeRef = doc(db, `posts/${uid}/userPosts/${postId}/likes/${currentUserUid}`);
    const postRef = doc(db, `posts/${uid}/userPosts/${postId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw "Post does not exist!";
        }

        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter - 1;

        transaction.delete(likeRef);
        transaction.update(postRef, { likeCounter: newLikeCounter });
      });

      console.log("Like successfully removed and likeCounter updated!");
    } catch (error) {
      console.error("Error removing like: ", error);
    }
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
                onPress={() => props.navigation.navigate("Profile", { uid: item.id })}
              />
            );
          } else {
            return (
              <TouchableOpacity
                style={styles.containerImage}
                onPress={() => openPostModal(item)}
              >
                <Image style={styles.image} source={{ uri: item.downloadURL }} />
              </TouchableOpacity>
            );
          }
        }}
      />
      {selectedPost && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closePostModal}
        >
          <View style={styles.modalView}>
            <Card>
              {/* {selectedPostOwner && selectedPostOwner.profileImageUrl ? (
                <Image
                  source={{ uri: selectedPostOwner.profileImage }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <MaterialIcons name="account-circle" size={50} color="black" />
              )} */}
              {selectedPostOwner && (
                  <TouchableOpacity
                  style={{ margin: 10 }}
                    onPress={() => props.navigation.navigate("Profile", { uid: selectedPost.userId })}
                  >
                    <Text>{selectedPostOwner.name}</Text>
                  </TouchableOpacity>
                )}
              
              <Card.Cover source={{ uri: selectedPost.downloadURL }} />
              <Card.Content>
                <Text>{selectedPost.caption}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={closePostModal}>
                  <MaterialCommunityIcons name="close" size={24} color="black" />
                </Button>
                {selectedPost.currentUserLike ? (
                  <Button onPress={() => onDislikePress(selectedPost.userId, selectedPost.id)}>
                    Dislike
                  </Button>
                ) : (
                  <Button onPress={() => onLikePress(selectedPost.userId, selectedPost.id)}>
                    Like
                  </Button>
                )}
                <Button
                  onPress={() => props.navigation.navigate("Comment", {
                    postId: selectedPost.id,
                    uid: selectedPost.userId,
                  })}
                >
                  <MaterialCommunityIcons name="comment" size={24} color="white" />
                </Button>
              </Card.Actions>
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerImage: {
    flex: 1 / 3,
  },
  image: {
    flex: 1,
    aspectRatio: 1,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
});
