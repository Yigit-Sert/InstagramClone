import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkbXvrg_uUXOFMnpR9Rhi8m2zUABIXNno",
  authDomain: "instagram-dev-58752.firebaseapp.com",
  projectId: "instagram-dev-58752",
  storageBucket: "instagram-dev-58752.appspot.com",
  messagingSenderId: "823225858944",
  appId: "1:823225858944:web:63b6e5b6ae5411b53e9f65",
  measurementId: "G-P7HFEZWESQ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default firebaseConfig;