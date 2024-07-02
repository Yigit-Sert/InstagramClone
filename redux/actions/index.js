import { USER_STATE_CHANGE } from "../constants/index";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
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
