const functions = require("firebase-functions")
const admin = require("firebase-admin")
const firestore = admin.firestore()

exports.sendFollowerNotification = functions.region("asia-east2").firestore.document('followers/{uid}').onUpdate(async (change, context) => {

  const beforeFollowers = change.before.data().followers;
  const afterFollowers = change.after.data().followers;

  const difference = afterFollowers.filter(x => !beforeFollowers.includes(x));
  if (difference.length == 0) {
    console.log("Empty");
    return null;
  }
  const newAddedUid = difference[0];

  const newAddedUser = (await (firestore.doc(`users/${newAddedUid}`).get())).data();
  const userStat = (await (firestore.doc(`usersStat/${context.params.uid}`).get())).data();

  if (userStat.token == "") {
    console.log("token is empty");
    return null;
  }

  console.log(`Send notification to token : ${userStat.token}`);
  var noti = {
    title: "New Follower",
    image: newAddedUser.profilePicUrl,
    body: `${newAddedUser.username} started following you`,

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
      type: "FOLLOW_TYPE",
      uid: newAddedUser.uid
    }
  };
  return await admin.messaging().send(payload);
});