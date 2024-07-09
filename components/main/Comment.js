import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TextInput } from "react-native";
import { initializeApp } from "firebase/app";
import { collection, getFirestore, addDoc, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../auth/firebaseConfig";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { fetchUsersData } from "../../redux/actions";

// Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function Comment(props) {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const matchUserToComment = (comments) => {
      comments.forEach((comment) => {
        if (!comment.user) {
          const user = props.users.find((x) => x.uid === comment.userId);
          if (user) {
            comment.user = user;
          } else {
            props.fetchUsersData(comment.userId, false);
          }
        }
      });
      setComments(comments);
    };

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
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        matchUserToComment(comments);
      } catch (error) {
        console.error("Error fetching comments: ", error);
      }
      setPostId(props.route.params.postId);
    };

    if (props.route.params.postId !== postId) {
      fetchComments();
    } else {
      matchUserToComment(comments);
    }
  }, [props.route.params.postId, props.users]);

  const onCommentSend = async () => {
    const user = getAuth().currentUser;
    const comment = {
      text,
      userId: user.uid,
      username: user.displayName,
    };

    const commentsCollectionRef = collection(
      db,
      "posts",
      props.route.params.uid,
      "userPosts",
      props.route.params.postId,
      "comments"
    );

    try {
      await addDoc(commentsCollectionRef, comment);
      setComments([...comments, comment]);
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  return (
    <View>
      <FlatList
        numColumns={1}
        horizontal={false}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {item.user ? <Text>{item.user.name}</Text> : null}
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View>
        <TextInput
          placeholder="Make a comment..."
          onChangeText={(text) => setText(text)}
        />
        <Button onPress={onCommentSend} title="Send" />
      </View>
    </View>
  );
}

const mapStateToProps = (store) => ({
  users: store.usersState.users,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchUsersData }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Comment);
