import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import { connect } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { runTransaction } from 'firebase/firestore';
import { db, auth } from '../auth/firebaseConfig';
import StoryProfile from './stories/components/StoryProfile';
import StoryComponent from './stories/components/StoryComponent';

function Feed(props) {
  const [posts, setPosts] = useState([]);
  const [insideStory, setInsideStory] = useState(false);

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

  const openStory = () => {
    setInsideStory(true);
  };

  const closeStory = () => {
    setInsideStory(false);
  };

  const onLikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;

    try {
      const likeRef = db.doc(`posts/${uid}/userPosts/${postId}/likes/${currentUserUid}`);
      const postRef = db.doc(`posts/${uid}/userPosts/${postId}`);

      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw 'Post does not exist!';
        }

        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter + 1;

        transaction.set(likeRef, {});
        transaction.update(postRef, { likeCounter: newLikeCounter });
      });

      console.log('Like successfully added and likeCounter updated!');
    } catch (error) {
      console.error('Error adding like: ', error);
    }
  };

  const onDislikePress = async (uid, postId) => {
    const currentUserUid = auth.currentUser.uid;

    const likeRef = db.doc(`posts/${uid}/userPosts/${postId}/likes/${currentUserUid}`);
    const postRef = db.doc(`posts/${uid}/userPosts/${postId}`);

    try {
      await runTransaction(db, async (transaction) => {
        const postDoc = await transaction.get(postRef);
        if (!postDoc.exists) {
          throw 'Post does not exist!';
        }

        const currentLikeCounter = postDoc.data().likeCounter || 0;
        const newLikeCounter = currentLikeCounter - 1;

        transaction.delete(likeRef);
        transaction.update(postRef, { likeCounter: newLikeCounter });
      });

      console.log('Like successfully removed and likeCounter updated!');
    } catch (error) {
      console.error('Error removing like: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {insideStory ? (
        <StoryComponent onFinishStory={closeStory} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => props.navigation.navigate('FollowingList')}
          >
            <MaterialCommunityIcons name='chat' size={24} color='white' />
            <Text style={styles.buttonText}>Go to Chat</Text>
          </TouchableOpacity>
          <StoryProfile
            outLineColor='#33ad1d'
            displayName='Binaryhood'
            onPressWrapped={openStory}
          />
          <FlatList
            numColumns={1}
            horizontal={false}
            data={posts}
            renderItem={({ item }) => (
              <Card style={styles.containerCard}>
                <Card.Title title={item.user.name} />
                <Card.Cover source={{ uri: item.downloadURL }} />
                <Card.Actions>
                  {item.currentUserLike ? (
                    <Button onPress={() => onDislikePress(item.user.uid, item.id)}>Dislike</Button>
                  ) : (
                    <Button onPress={() => onLikePress(item.user.uid, item.id)}>Like</Button>
                  )}
                  <Button onPress={() => props.navigation.navigate('Comment', { postId: item.id, uid: item.user.uid })}>
                    View Comments...
                  </Button>
                </Card.Actions>
              </Card>
            )}
          />
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
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    flexDirection: 'row',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
  containerCard: {
    margin: 10,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  following: store.userState.following,
  feed: store.usersState.feed,
  usersFollowingLoaded: store.usersState.usersFollowingLoaded,
});

export default connect(mapStateToProps, null)(Feed);
