import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/auth/firebaseConfig";

async function sendNotification(userId, title, body, data) {
  try {
    const userRef = doc(db, 'users', userId);
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
      title: title,
      body: body,
      data: data,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error("Failed to send push notification");
    }
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

export async function sendCommentNotification(postOwnerId, commenterId, postId) {
  const commenterName = await getUserName(commenterId);
  const title = "New Comment";
  const body = `${commenterName} commented on your post`;
  const data = { type: "comment", postId, commenterId };

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
