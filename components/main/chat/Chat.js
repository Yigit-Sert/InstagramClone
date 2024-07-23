import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { collection, addDoc, orderBy, query, onSnapshot, getFirestore, doc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { db, auth } from "../../auth/firebaseConfig";
import { sendMessageNotification } from "../../../utils/notifications";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const route = useRoute();
  const { userId, userName } = route.params;

  const currentUser = auth.currentUser;
  const chatId = [currentUser.uid, userId].sort().join("_");

  useLayoutEffect(() => {
    const collectionRef = collection(db, `chats/${chatId}/messages`);
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const _messages = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const _id = doc.id;
        return { _id, ...data };
      });
      setMessages(_messages);
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback(async (messages = []) => {
    if (!auth.currentUser) {
      console.error("User not authenticated");
      return;
    }

    const { uid, displayName } = auth.currentUser;
    const { text, createdAt } = messages[0];

    const message = {
      text,
      createdAt: new Date(),
      user: {
        _id: uid,
        name: displayName || "Anonymous",
      },
    };

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), message);
      await sendMessageNotification(userId, uid, text);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }, [userId, chatId, onSend]);

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth.currentUser ? auth.currentUser.uid : undefined,
        name: auth.currentUser ? auth.currentUser.displayName : "Anonymous",
      }}
    />
  );
}
