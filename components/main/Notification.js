import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../auth/firebaseConfig";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const currentUserUid = auth.currentUser.uid;
    const notificationsRef = collection(db, `users/${currentUserUid}/notifications`);
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const _notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(_notifications);
    });

    return unsubscribe;
  }, []);

  const markAsRead = async (notificationId) => {
    const currentUserUid = auth.currentUser.uid;
    const notificationRef = doc(db, `users/${currentUserUid}/notifications`, notificationId);
    await updateDoc(notificationRef, { read: true });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.notification} onPress={() => markAsRead(item.id)}>
      <Text style={item.read ? styles.read : styles.unread}>{item.title}</Text>
      <Text>{item.body}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  notification: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  read: {
    fontWeight: "normal",
  },
  unread: {
    fontWeight: "bold",
  },
});
