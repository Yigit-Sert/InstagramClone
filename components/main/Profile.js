import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Image, FlatList, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import { connect } from "react-redux";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Appbar } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker'; 
import { sendFollowNotification } from "../../utils/notifications";
import { collection, doc, setDoc, deleteDoc, getDoc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { db, auth } from "../auth/firebaseConfig";

const placeholderImage = 'https://placehold.co/600x400/png'; 

function Profile(props) {
  const [userPosts, setUserPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    const { currentUser, posts } = props;

    if (!props.route.params || !props.route.params.uid) {
      console.log("UID is not provided");
      return;
    }

    const uid = props.route.params.uid;

    if (uid === auth.currentUser.uid) {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.name);
        setEmail(currentUser.email);
        setProfileImage(currentUser.profileImage);
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
            setName(snapshot.data().name);
            setEmail(snapshot.data().email);
            setProfileImage(snapshot.data().profileImage);
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

  const onFollow = async () => {
    const followingRef = doc(
      db,
      "following",
      auth.currentUser.uid,
      "userFollowing",
      props.route.params.uid
    );
    setDoc(followingRef, {});
  
    await sendFollowNotification(props.route.params.uid, auth.currentUser.uid);
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
  };

  const openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const updatedData = { name, email };
    
    if (profileImage) {
      updatedData.profileImage = profileImage;
    }

    await setDoc(userRef, updatedData, { merge: true });
    setModalVisible(false);
  };

  const editPostHandler = (post) => {
    setEditPost(post);
    setCaption(post.caption);
    setEditModalVisible(true);
  };

  const saveEditPost = async () => {
    const postRef = doc(db, "posts", auth.currentUser.uid, "userPosts", editPost.id);
    await updateDoc(postRef, { caption });
    setEditModalVisible(false);
    setUserPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === editPost.id ? { ...post, caption } : post
      )
    );
  };

  const deletePostHandler = (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const postRef = doc(db, "posts", auth.currentUser.uid, "userPosts", postId);
              await deleteDoc(postRef);
              setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
            } catch (error) {
              console.error("Error deleting post: ", error);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };


  if (user === null) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content 
          title={
            <Image
              source={{ uri: profileImage || placeholderImage }}
              style={styles.profileImageHeader}
            />
          }
        />
        <Appbar.Action icon="pencil" onPress={() => setModalVisible(true)} />
      </Appbar.Header>

      <View style={styles.containerInfo}>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>

        {props.route.params.uid !== auth.currentUser.uid ? (
          <View>
            {following ? (
              <Button
                mode="contained"
                onPress={() => {
                  onUnfollow();
                }}
              >
                Following
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => {
                  onFollow();
                }}
              >
                Follow
              </Button>
            )}
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={() => {
              onLogout();
            }}
          >
            Logout
          </Button>
        )}
      </View>
      
      <View style={styles.containerGallery}>
        <FlatList
          numColumns={3}
          horizontal={false}
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.containerImage}>
              <Image style={styles.image} source={{ uri: item.downloadURL }} />
              {props.route.params.uid === auth.currentUser.uid && (
                <View style={styles.postActions}>
                  <Button mode="text" onPress={() => editPostHandler(item)}>
                    <MaterialCommunityIcons name="pencil" size={24} color="black" />
                  </Button>
                  <Button mode="text" onPress={() => deletePostHandler(item.id)}>
                    <MaterialCommunityIcons name="delete" size={24} color="black" />
                  </Button>
                </View>
              )}
            </View>
          )}
        />
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <Button mode="contained" onPress={openImagePicker}>
            Pick Profile Image
          </Button>
          {profileImage && (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          )}
          <Button mode="contained" onPress={saveProfile}>
            Save
          </Button>
          <Button mode="contained" onPress={() => setModalVisible(false)}>
            Cancel
          </Button>
        </View>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Caption"
            value={caption}
            onChangeText={setCaption}
          />
          <Button mode="contained" onPress={saveEditPost}>
            Save
          </Button>
          <Button mode="contained" onPress={() => setEditModalVisible(false)}>
            Cancel
          </Button>
        </View>
      </Modal>
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
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  profileImageHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  posts: store.userState.posts,
  following: store.userState.following,
});

export default connect(mapStateToProps, null)(Profile);
