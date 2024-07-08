import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, FlatList } from 'react-native';
import { connect } from 'react-redux';

function Feed(props) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
      let postsArray = [];
      if (props.following && props.usersLoaded !== undefined && props.usersLoaded === props.following.length) {
          for (let i = 0; i < props.following.length; i++) {
              const user = props.users.find(el => el.uid === props.following[i]);
              if (user && user.posts) {
                  postsArray = [...postsArray, ...user.posts];
              }
          }

          postsArray.sort((x, y) => x.creation - y.creation);
          setPosts(postsArray);
      }
  }, [props.usersLoaded, props.following, props.users]);

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
                            <Image
                                style={styles.image}
                                source={{ uri: item.downloadURL }}
                            />
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
        margin: 20
    },
    containerGallery: {
        flex: 1
    },
    containerImage: {
        flex: 1 
    },
    image: {
        flex: 1,
        aspectRatio: 1 / 1
    }
});

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser,
    following: store.userState.following,
    users: store.usersState.users,
    usersLoaded: store.usersState.usersLoaded,
});

export default connect(mapStateToProps, null)(Feed);
