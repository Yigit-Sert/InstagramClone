import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../components/auth/firebaseConfig";

async function saveNotification(userId, notification) {
  const notificationsRef = collection(db, `users/${userId}/notifications`);
  await addDoc(notificationsRef, notification);
}


export async function sendNotification(receiverId, title, body, data) {
  const userRef = doc(db, 'users', receiverId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    console.error("User does not exist!");
    return;
  }

  const userData = userDoc.data();
  const pushToken = userData?.pushToken;

  if (!pushToken) {
    console.error("Cannot send notification, user has no token");
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    await sendPushNotification(message);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }

  const notification = {
    title,
    body,
    data,
    timestamp: new Date(),
    read: false,
  };

  await saveNotification(receiverId, notification);
}

export async function sendPushNotification(message) {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  return response;
}

export async function sendCommentNotification(postOwnerId, commenterId, postId, commentText) {
  const commenterName = await getUserName(commenterId);
  const title = "New Comment";
  const body = `${commenterName} commented on your post: ${commentText}`;
  const data = { type: "comment", postId, commenterId, commentText };

  await sendNotification(postOwnerId, title, body, data);
}

export async function sendLikeNotification(postOwnerId, likerId, postId) {
  const likerName = await getUserName(likerId);
  const title = "New Like";
  const body = `${likerName} liked your post`;
  const data = { type: "like", postId, likerId };

  await sendNotification(postOwnerId, title, body, data);
}

export async function sendFollowNotification(followedUserId, followerId) {
  const title = "New Follower";
  const body = `${await getUserName(followerId)} started following you`;
  const data = { type: "follow", followerId };

  await sendNotification(followedUserId, title, body, data);
}

export async function sendMessageNotification(receiverId, senderId, messageText) {
  const senderName = await getUserName(senderId);
  const title = "New Message";
  const body = `${senderName}: ${messageText}`;
  const data = { type: "message", senderId, messageText };

  await sendNotification(receiverId, title, body, data);
}

/* async function getPostOwnerId(postId) {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  return postDoc.exists() ? postDoc.data().userId : "Unknown";
} */

async function getUserName(userId) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data().name : "Unknown";
}
