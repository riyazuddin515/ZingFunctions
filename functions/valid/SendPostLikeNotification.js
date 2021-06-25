const functions = require("firebase-functions")
const admin = require("firebase-admin")
const firestore = admin.firestore() 

exports.sendNewPostLikeNotification = functions.region("asia-east2").firestore.document('postLikes/{postId}').onUpdate(async (change, context) => {

  const uid = change.after.data().uid

  const beforeLikedBy = change.before.data().likedBy
  const afterLikedBy = change.after.data().likedBy

  const difference = afterLikedBy.filter(x => !beforeLikedBy.includes(x));
  const newAddedUid = difference[0];
  if(newAddedUid == uid){
    console.log("Own Like");
    return null;
  }
  if (difference.length == 0) {
    console.log("Empty");
    return null;
  }

  const newAddedUser = (await (firestore.doc(`users/${newAddedUid}`).get())).data();
  const userStat = (await (firestore.doc(`usersStat/${uid}`).get())).data();

  if (userStat.token == "") {
    console.log("token is empty");
    return null;
  }

  console.log(`Send notification to token : ${userStat.token}`);
  var noti = {
    title: "New Like",
    image: newAddedUser.profilePicUrl,
    body: `${newAddedUser.username} liked your post`,

    sound: "notification.mp3",
    notification_priority: "PRIORITY_HIGH",
    channel_id: "normal_notification_channel_id"
  }

  const payload = {
    token: userStat.token,
    android: {
      priority: "HIGH",
    },
    data: {
      notification: JSON.stringify(noti),
      type: "POST_LIKE_TYPE",
      postId: context.params.postId
    }
  };
  return await admin.messaging().send(payload);
});