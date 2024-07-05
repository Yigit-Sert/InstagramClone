import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE } from "../constants/index";
import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, getDocs, getDoc, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../components/auth/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function fetchUser() {
  return async (dispatch) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // console.log("User data:", userDoc.data());
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
        const userPostsCollection = collection(doc(collection(db, "posts"), user.uid), "userPosts");
        const userPostsQuery = query(userPostsCollection, orderBy("creation", "asc"));
        const userPostsQuerySnapshot = await getDocs(userPostsQuery);
        
        if (!userPostsQuerySnapshot.empty) {
          const posts = userPostsQuerySnapshot.docs.map(doc => doc.data());
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
