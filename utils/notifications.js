import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/auth/firebaseConfig";

export async function sendLikeNotification(like) {
  try {
    const userRef = doc(db, 'users', like.user_id);
    const userDoc = await getDoc(userRef);
    console.log("User document:", userDoc);

    if (!userDoc.exists()) {
      console.error("User does not exist!");
      return;
    }

    const userData = userDoc.data();
    const pushToken = userData?.pushToken;
    console.log("User push token:", pushToken);

    if (!pushToken) {
      console.error("Cannot send notification, user has no token");
      return;
    }

    sendPushNotification(pushToken);
  } catch (error) {
    console.error("Error fetching user document:", error);
  }
}

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "New Like",
    body: "Your post has been liked!",
    data: { someData: "goes here" },
  };

  try {
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
