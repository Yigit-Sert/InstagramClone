export function sendLikeNotification(
  senderPushToken,
  receiverPushToken,
  senderUsername,
  postId
) {
  const message = {
    to: receiverPushToken,
    sound: "default",
    title: "New Like",
    body: `${senderUsername} liked your post`,
    data: { postId },
  };

  sendPushNotification(message);
}