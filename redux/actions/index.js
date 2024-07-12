import {
  USER_STATE_CHANGE,
  USER_POSTS_STATE_CHANGE,
  USER_FOLLOWING_STATE_CHANGE,
  USERS_DATA_STATE_CHANGE,
  USERS_POSTS_STATE_CHANGE,
  USERS_LIKES_STATE_CHANGE,
  CLEAR_DATA,
  FETCH_MESSAGES,
  SEND_MESSAGE,
  FETCH_FOLLOWING_USERS,
} from "../constants/index";
import { initializeApp } from "firebase/app";
import {
  collection,
  getFirestore,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../components/auth/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function clearData() {
  return (dispatch) => {
    dispatch({ type: CLEAR_DATA });
  };
}

export function fetchUser() {
  return async (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          dispatch({ type: USER_STATE_CHANGE, currentUser: userDoc.data() });
        } else {
          console.log("User does not exist.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      console.log("No user is currently signed in.");
    }
  };
}

export function fetchUserPosts() {
  return async (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      try {
        console.log("Current user:", user.uid);

        // Reference to the user's "posts" collection under "userPosts"
        const userPostsCollection = collection(
          doc(collection(db, "posts"), user.uid),
          "userPosts"
        );
        console.log("User posts collection path:", userPostsCollection.path);

        // Create a query to order the posts by the "creation" field in ascending order
        const userPostsQuery = query(
          userPostsCollection,
          orderBy("creation", "asc")
        );

        // Execute the query
        const userPostsQuerySnapshot = await getDocs(userPostsQuery);

        console.log("Query snapshot size:", userPostsQuerySnapshot.size);

        if (!userPostsQuerySnapshot.empty) {
          // Map the documents to their data and include the document ID
          const posts = userPostsQuerySnapshot.docs.map((doc) => {
            const data = doc.data();
            const id = doc.id;
            // Convert Timestamp to a serializable format
            if (data.creation) {
              data.creation = data.creation.toDate().toISOString();
            }
            return { id, ...data };
          });

          // Dispatch the action to update the state with the fetched posts
          dispatch({ type: USER_POSTS_STATE_CHANGE, posts });
          console.log("User posts:", posts);
        } else {
          console.log("User has no posts.");
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    } else {
      console.log("No user is currently signed in.");
    }
  };
}

export function fetchUserFollowing() {
  return async (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Reference to the "following" collection under the current user's ID
        const followingCollection = collection(
          doc(db, "following", user.uid),
          "userFollowing"
        );

        // Execute the query
        const followingCollectionSnapshot = await getDocs(followingCollection);

        console.log(
          "Following collection snapshot size:",
          followingCollectionSnapshot.size
        );

        if (!followingCollectionSnapshot.empty) {
          // Map the documents to their data and include the document ID
          const following = followingCollectionSnapshot.docs.map(
            (doc) => doc.id
          );

          // Dispatch the action to update the state with the fetched following
          dispatch({ type: USER_FOLLOWING_STATE_CHANGE, following });
          console.log("Following:", following);
          for (let i = 0; i < following.length; i++) {
            dispatch(fetchUsersData(following[i], true));
          }
        } else {
          console.log("User is not following anyone.");
        }
      } catch (error) {
        console.error("Error fetching user following:", error);
      }
    } else {
      console.log("No user is currently signed in.");
    }
  };
}

export function fetchUsersData(uid, getPosts) {
  return async (dispatch, getState) => {
    const found = getState().usersState.users.some((el) => el.uid === uid);
    if (!found) {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          let user = userDoc.data();
          user.uid = userDoc.id;

          dispatch({ type: USERS_DATA_STATE_CHANGE, user });

          if (getPosts) {
            dispatch(fetchUsersFollowingPosts(uid));
          }
        } else {
          console.log("User does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };
}

export function fetchUsersFollowingPosts(uid) {
  return async (dispatch, getState) => {
    try {
      const userPostsCollectionRef = collection(
        doc(db, "posts", uid),
        "userPosts"
      );
      const userPostsQuery = query(
        userPostsCollectionRef,
        orderBy("creation", "asc")
      );
      const userPostsQuerySnapshot = await getDocs(userPostsQuery);

      const user = getState().usersState.users.find((el) => el.uid === uid);
      let posts = userPostsQuerySnapshot.docs.map((doc) => {
        const data = doc.data();
        const id = doc.id;
        const creation = data.creation.toDate().toISOString();

        return { id, ...data, creation, user };
      });

      for (let i = 0; i < posts.length; i++) {
        dispatch(fetchUsersFollowingLikes(uid, posts[i].id));
      }

      dispatch({ type: USERS_POSTS_STATE_CHANGE, posts, uid });
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };
}

export function fetchUsersFollowingLikes(uid, postId) {
  return async (dispatch, getState) => {
    try {
      const likesCollectionRef = collection(db, `posts/${uid}/userPosts/${postId}/likes`);
      const likesQuerySnapshot = await getDocs(likesCollectionRef);

      let currentUserLike = false;

      if (!likesQuerySnapshot.empty) {
        // Check if the current user has liked the post
        likesQuerySnapshot.forEach(doc => {
          if (doc.id === auth.currentUser.uid) {
            currentUserLike = true;
          }
        });
      }

      dispatch({ type: USERS_LIKES_STATE_CHANGE, postId, currentUserLike });
      console.log("User likes:", currentUserLike);
    } catch (error) {
      console.error("Error fetching user likes:", error);
    }
  };
}



export function sendMessage(text, userId) {
  return async (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const message = {
          text,
          from: user.uid,
          to: userId,
          createdAt: new Date().toISOString(), // Ensure serialization
        };

        await addDoc(collection(db, `chats/${userId}/messages`), message);
        dispatch({ type: SEND_MESSAGE, message });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.log('No user is currently signed in.');
    }
  };
}


export function fetchFollowingUsers() {
  return async (dispatch) => {
    const user = getAuth().currentUser;
    if (user) {
      try {
        const followingCollectionRef = collection(db, `following/${user.uid}/userFollowing`);
        const followingSnapshot = await getDocs(followingCollectionRef);

        if (!followingSnapshot.empty) {
          let followingUsers = [];

          for (const docRef of followingSnapshot.docs) {
            const userDoc = await getDoc(doc(db, "users", docRef.id));
            if (userDoc.exists()) {
              followingUsers.push({ uid: userDoc.id, name: userDoc.data().name });
            }
          }

          dispatch({ type: FETCH_FOLLOWING_USERS, followingUsers });
        } else {
          console.log("User is not following anyone.");
        }
      } catch (error) {
        console.error("Error fetching following users:", error);
      }
    }
  };
}
