import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  getFirestore,
  orderBy,
} from "firebase/firestore";
import { sendMessage } from "../../redux/actions/index";
import { FETCH_MESSAGES } from "../../redux/constants/index";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../components/auth/firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function PrivateChat({ route }) {
  const { userId, userName } = route.params;
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.messagesState.messages);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = collection(db, `chats/${userId}/messages`);
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text,
            from: data.from,
            to: data.to,
            userName: data.userName,
           createdAt:
              data.createdAt instanceof Date
                ? data.createdAt.toISOString()
                : new Date(data.createdAt).toISOString(),
          };
        });

        dispatch({ type: FETCH_MESSAGES, messages });
        setLoading(false);
      },
      (error) => {
        Alert.alert("Error", "Failed to fetch messages.");
        console.error("Error fetching messages:", error);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [dispatch, userId]);

  const handleSend = () => {
    if (message.trim()) {
      dispatch(sendMessage(message, userId))
        .then(() => setMessage(""))
        .catch((error) => {
          Alert.alert("Error", "Failed to send message.");
          console.error("Error sending message:", error);
        });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {userName} ile sohbet
      </Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          item ? (
            <View
              style={{ padding: 5, borderBottomWidth: 1, borderColor: "#ccc" }}
            >
              <Text>
                {item.userName}: {item.text}
              </Text>
            </View>
          ) : null
        }
      />

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Mesajınızı yazın"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginVertical: 10,
        }}
      />
      <Button title="Gönder" onPress={handleSend} />
    </View>
  );
}
