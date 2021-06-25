const functions = require("firebase-functions")
const admin = require("firebase-admin")
const firestore = admin.firestore() 

exports.sendChatNotification = functions.region("asia-east2").firestore.document('chats/{chatThread}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const chatThread = context.params.chatThread
      const messageId = context.params.messageId

      const message = snapshot.data()
      const senderId = message['senderAndReceiverUid'][0]

      const receiverUserStatDocumentSnapshot = await firestore.doc(`usersStat/${message['senderAndReceiverUid'][1]}`).get();

      if(!receiverUserStatDocumentSnapshot.exists){
        return null
      }

      const receiverUserStat = receiverUserStatDocumentSnapshot.data()
      if (receiverUserStat.token == "") {
        return null
      }

      console.log('message to sent', message['messageId']);

      const senderUser = (await firestore.doc(`users/${senderId}`).get()).data();

      const user = {
        name: senderUser.name,
        uid: senderUser.uid,
        username: senderUser.username,
        profilePicUrl: senderUser.profilePicUrl,
        bio: senderUser.bio,
        followingCount: senderUser.followingCount,
        followersCount: senderUser.followersCount,
        postCount: senderUser.postCount
      }

      var noti = {
        title: senderUser.username,
        tag: senderUser.uid,
        image: senderUser.profilePicUrl,
        body: message.message,

        sound: "notification.mp3",
        notification_priority: "PRIORITY_HIGH",
        channel_id: "chat_channel_id"
      }

      const payload = {
        token: receiverUserStat.token,
        android: {
          priority: "HIGH",
        },
        data: {
          notification: JSON.stringify(noti),
          type: "CHAT_TYPE",
          ou: JSON.stringify(user),
          "chatThread": `${chatThread}`,
          "messageId": `${messageId}`
        }
      };
      return await admin.messaging().send(payload)
    } catch (error) {
      return console.error(error);
    }
  });