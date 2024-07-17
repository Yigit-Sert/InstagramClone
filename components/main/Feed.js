import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { Card, Button, Text } from "react-native-paper";
import { connect } from "react-redux";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../auth/firebaseConfig";
import StoryProfile from "./stories/components/StoryProfile";
import StoryComponent from "./stories/components/StoryComponent";

function Feed(props) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedStoryUser, setSelectedStoryUser] = useState(null);
  const [usersData, setUsersData] = useState({});

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

  useEffect(() => {
    fetchUsersData();
  }, [props.following]);

  const fetchUsersData = async () => {
    const usersData = {};
    for (const uid of props.following) {
      const userRef = doc(db, "users", uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        usersData[uid] = userSnapshot.data();
      }
    }
    setUsersData(usersData);
  };

  const fetchStories = async () => {
    const storiesArray = [];
    for (const uid of props.following) {
      const storiesRef = collection(db, "users", uid, "stories");
      const storiesSnapshot = await getDocs(storiesRef);
      storiesSnapshot.forEach((doc) => {
        storiesArray.push({ ...doc.data(), uid });
      });
    }
    setStories(storiesArray);
  };

  const openStory = (uid) => {
    setSelectedStoryUser(uid);
  };

  const closeStory = () => {
    setSelectedStoryUser(null);
  };

  return (
    <View style={styles.container}>
      {selectedStoryUser ? (
        <StoryComponent onFinishStory={closeStory} uid={selectedStoryUser} />
      ) : (
        <>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => props.navigation.navigate("FollowingList")}
            >
              <MaterialCommunityIcons name="chat" size={24} color="white" />
              <Text style={styles.buttonText}>Go to Chat</Text>
            </TouchableOpacity>

            <FlatList
              style={styles.flatList}
              contentContainerStyle={styles.storiesList}
              horizontal
              data={props.following}
              renderItem={({ item }) => (
                <StoryProfile
                  key={item}
                  outLineColor="#33ad1d"
                  displayName={usersData[item]?.name}
                  imageUrl={usersData[item]?.profileImageUrl}
                  onPressWrapped={() => openStory(item)}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            <FlatList
              style={styles.flatList}
              contentContainerStyle={styles.flatListContent}
              numColumns={1}
              horizontal={false}
              data={posts}
              renderItem={({ item }) => (
                <Card style={styles.containerCard}>
                  <Card.Title title={item.user.name} />
                  <Card.Cover source={{ uri: item.downloadURL }} />
                  <Card.Actions>
                    {item.currentUserLike ? (
                      <Button
                        onPress={() => onDislikePress(item.user.uid, item.id)}
                      >
                        Dislike
                      </Button>
                    ) : (
                      <Button
                        onPress={() => onLikePress(item.user.uid, item.id)}
                      >
                        Like
                      </Button>
                    )}
                    <Button
                      onPress={() =>
                        props.navigation.navigate("Comment", {
                          postId: item.id,
                          uid: item.user.uid,
                        })
                      }
                    >
                      View Comments...
                    </Button>
                  </Card.Actions>
                </Card>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 10,
    backgroundColor: "#6200ee",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    flexDirection: "row",
    margin: 10,
  },
  buttonText: {
    color: "white",
    marginLeft: 5,
  },
  containerCard: {
    margin: 10,
  },
  flatList: {
    flex: 1,
    marginHorizontal: 10,
  },
  flatListContent: {
    paddingHorizontal: 5,
  },
  storiesList: {
    paddingHorizontal: 10, 
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
