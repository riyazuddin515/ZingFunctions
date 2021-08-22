const functions = require("firebase-functions")

let is_onUserLastSeenChage_initilized = false
let is_NewFollowerNotification_initilized = false
let is_sendNewPostLikeNotification_initilized = false
let is_sendPostCommentNotification_initilized = false
let is_sendChatNotification_initilized = false
let is_deletePostToTheFollowersFeedOnPostDeletion_initilized = false
let is_addPostToTheFollowersFeedOnPostCreation_initilized = false
let is_updateUserFeedOnFollow_initilized = false
let is_updateUserFeedOnUnFollow_initilized = false

const runtimeOpts = {
    timeoutSeconds: 540,
    memory: '1GB'
}

exports.onUserLastSeenChage = functions.region("asia-east2").database.ref('/status/{uid}').onUpdate(async (change, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_onUserLastSeenChage_initilized) {
            admin.initializeApp()
            is_onUserLastSeenChage_initilized = true
        }

        const firestore = admin.firestore()
        const FieldValue = admin.firestore.FieldValue;
        const eventStatus = change.after.val()
        const firestoreRef = firestore.doc(`usersStat/${context.params.uid}`)

        const statusSnapshot = await change.after.ref.once('value')
        const status = statusSnapshot.val()

        if (status.lastSeen > eventStatus.lastSeen) {
            return null;
        }

        eventStatus.lastSeen = FieldValue.serverTimestamp()
        return await firestoreRef.set(eventStatus, { merge: true })
    } catch (error) {
        return error
    }

})

exports.NewFollowerNotification = functions.region("asia-east2").firestore.document('users/{userUid}/followers/{followerUid}').onCreate(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_NewFollowerNotification_initilized) {
            admin.initializeApp()
            is_NewFollowerNotification_initilized = true
        }

        const firestore = admin.firestore()
        const followerObj = (await firestore.collection("users").doc(context.params.followerUid).get()).data()
        const notificationReceiverUserStatDS = await firestore.collection("usersStat").doc(context.params.userUid).get()

        if (!notificationReceiverUserStatDS.exists)
            return console.log("DS not exists");

        const receiverToken = notificationReceiverUserStatDS.data().token
        if (receiverToken == "")
            return console.log("token is empty");

        var noti = {
            title: "New Follower",
            image: followerObj.profilePicUrl,
            body: `${followerObj.name} started following you`,
            tag: `${followerObj.uid}`,
            sound: "notification.mp3",
            notification_priority: "PRIORITY_HIGH",
            channel_id: "normal_notification_channel_id"
        }

        const payload = {
            token: receiverToken,
            android: {
                priority: "HIGH",
            },
            data: {
                notification: JSON.stringify(noti),
                type: "FOLLOW_TYPE",
                uid: followerObj.uid
            }
        }
        console.log("Sending Notification");
        return await admin.messaging().send(payload)
    } catch (error) {
        return error
    }
})

exports.NewPostLikeNotification = functions.region("asia-east2").firestore.document('postLikes/{postId}').onUpdate(async (change, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_sendNewPostLikeNotification_initilized) {
            admin.initializeApp()
            is_sendNewPostLikeNotification_initilized = true
        }
        const firestore = admin.firestore()

        const uid = change.after.data().uid
        const beforeLikedBy = change.before.data().likedBy
        const afterLikedBy = change.after.data().likedBy

        const difference = afterLikedBy.filter(x => !beforeLikedBy.includes(x));
        const newAddedUid = difference[0];
        if (newAddedUid == uid) {
            return null;
        }
        if (difference.length == 0) {
            return null;
        }

        const newAddedUser = (await (firestore.doc(`users/${newAddedUid}`).get())).data();
        const userStat = (await (firestore.doc(`usersStat/${uid}`).get())).data();

        if (userStat.token == "") {
            return null;
        }

        var noti = {
            title: "New Like",
            image: newAddedUser.profilePicUrl,
            body: `${newAddedUser.username} liked your post`,
            tag: `${context.params.postId}${newAddedUid}`,
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
        }
        return await admin.messaging().send(payload)
    } catch (error) {
        return error
    }
})

exports.NewPostCommentNotification = functions.region("asia-east2").firestore.document("comments/{postId}/comments/{commentId}").onCreate(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_sendPostCommentNotification_initilized) {
            admin.initializeApp()
            is_sendPostCommentNotification_initilized = true
        }
        const firestore = admin.firestore()

        const commentObj = snapshot.data()
        const postDocumentSnapshot = await firestore.collection("posts").doc(commentObj["postId"]).get()
        if (!postDocumentSnapshot.exists) {
            return null
        }

        const post = postDocumentSnapshot.data()
        if (post.postedBy == commentObj.commentedBy) {
            return null
        }

        const userStatDocumentSnapshot = await firestore.collection("usersStat").doc(post["postedBy"]).get()
        if (!userStatDocumentSnapshot.exists) {
            return null
        }

        const userStat = userStatDocumentSnapshot.data()
        const token = userStat["token"]
        if (token == "") {
            return null
        }

        const commentedUserDocumentSnapshot = await firestore.collection("users").doc(commentObj["commentedBy"]).get()
        if (!commentedUserDocumentSnapshot.exists) {
            return null
        }
        const commentedUser = commentedUserDocumentSnapshot.data()

        var noti = {
            "title": "New Comment",
            "tag": `${commentObj.postId}${commentObj.commentedBy}`,
            "image": commentedUser.profilePicUrl,
            "body": `${commentedUser.name} commented on your post`,
            "notification_priority": "PRIORITY_HIGH",
            "channel_id": "normal_notification_channel_id"
        }
        const payload = {
            token: token,
            android: {
                priority: "HIGH",
            },
            data: {
                notification: JSON.stringify(noti),
                type: "COMMENT_TYPE",
                postId: commentObj.postId
            }
        }
        return await admin.messaging().send(payload)
    } catch (err) {
        return err
    }
})

exports.sendChatNotification = functions.region("asia-east2").firestore.document('chats/{chatThread}/messages/{messageId}').onCreate(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_sendChatNotification_initilized) {
            admin.initializeApp()
            is_sendChatNotification_initilized = true
        }
        const firestore = admin.firestore()

        const chatThread = context.params.chatThread
        const messageId = context.params.messageId

        const message = snapshot.data()
        const senderId = message['senderAndReceiverUid'][0]

        const receiverUserStatDocumentSnapshot = await firestore.doc(`usersStat/${message['senderAndReceiverUid'][1]}`).get();

        if (!receiverUserStatDocumentSnapshot.exists) {
            return null
        }

        const receiverUserStat = receiverUserStatDocumentSnapshot.data()
        if (receiverUserStat.token == "") {
            return null
        }

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

        let messageBody
        if (message.type == "IMAGE") {
            messageBody = "🖼 Photo"
        } else {
            messageBody = message.message
        }
        var noti = {
            title: senderUser.username,
            tag: senderUser.uid,
            image: senderUser.profilePicUrl,
            body: messageBody,

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
        }
        return await admin.messaging().send(payload)
    } catch (error) {
        return console.error(error);
    }
})

exports.deletePostToTheFollowersFeedOnPostDeletion = functions.region("asia-east2").firestore.document('posts/{postId}').onDelete(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_deletePostToTheFollowersFeedOnPostDeletion_initilized) {
            admin.initializeApp()
            is_deletePostToTheFollowersFeedOnPostDeletion_initilized = true
        }
        const firestore = admin.firestore()

        const post = snapshot.data()
        const querySnapshot = await firestore.collection("users").doc(post.postedBy).collection("followers").get()

        if (querySnapshot.empty) {
            console.log("QuerySnapShot Empty");
            return Promise.resolve()
        }

        console.log(`Followers Size -> ${querySnapshot.size}`);
        const lodash = require("lodash")
        const batches = lodash.chunk(querySnapshot.docs, 500).map(chunk => {
            const writeBatch = firestore.batch()
            chunk.forEach(followerSnapshot => {
                writeBatch.delete(
                    firestore.collection("feeds").doc(followerSnapshot.data().followedByUid).collection("feed").doc(post.postId)
                )
            })
            return writeBatch.commit()
        })
        
        return Promise.all(batches)
    } catch (error) {
        return error
    }
})

exports.addPostToTheFollowersFeedOnPostCreation = functions.region("asia-east2").firestore.document('posts/{postId}').onCreate(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_addPostToTheFollowersFeedOnPostCreation_initilized) {
            admin.initializeApp()
            is_addPostToTheFollowersFeedOnPostCreation_initilized = true
        }
        const firestore = admin.firestore()

        const post = snapshot.data()
        const querySnapshot = await firestore.collection("users").doc(post.postedBy).collection("followers").get()

        if (querySnapshot.empty) {
            console.log("QuerySnapShot Empty");
            return Promise.resolve()
        }

        console.log(`Followings Size -> ${querySnapshot.size}`);
        const feed = {
            "postId": post.postId,
            "postedBy": post.postedBy,
            "date": post.date
        }

        const lodash = require("lodash")

        const batches = lodash.chunk(querySnapshot.docs, 500).map(chunk => {
            const writeBatch = firestore.batch()
            chunk.forEach(followerSnapshot => {
                writeBatch.set(
                    firestore.collection("feeds").doc(followerSnapshot.data().followedByUid)
                        .collection("feed").doc(post.postId),
                    feed
                )
            })
            return writeBatch.commit()
        })
        return Promise.all(batches)
    } catch (error) {
        return error
    }
})

exports.updateUserFeedOnFollow = functions.region("asia-east2").firestore.document('users/{userUid}/following/{followingToUid}').onCreate(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_updateUserFeedOnFollow_initilized) {
            admin.initializeApp()
            is_updateUserFeedOnFollow_initilized = true
        }
        const firestore = admin.firestore()

        const followingDoc = snapshot.data()
        const followingToUid = followingDoc.followingToUid

        const lodash = require("lodash")

        const feedRef = firestore.collection("feeds").doc(context.params.userUid).collection("feed")
        const querySnapshot = await firestore.collection("posts").where("postedBy", "==", followingToUid).get()
        const batch = lodash.chunk(querySnapshot.docs, 500).map(chunk => {
            const writeBatch = firestore.batch()
            chunk.forEach(snapshot => {
                const post = snapshot.data()
                const feed = {
                    "postId": post.postId,
                    "postedBy": post.postedBy,
                    "date": post.date
                }
                writeBatch.set(feedRef.doc(post.postId), feed)
            })
            return writeBatch.commit()
        })
        return Promise.all(batch)
    } catch (error) {
        return error
    }
})

exports.updateUserFeedOnUnFollow = functions.region("asia-east2").firestore.document('users/{userUid}/following/{followingUid}').onDelete(async (snapshot, context) => {
    try {
        const admin = require("firebase-admin")
        if (!is_updateUserFeedOnUnFollow_initilized) {
            admin.initializeApp()
            is_updateUserFeedOnUnFollow_initilized = true
        }
        const firestore = admin.firestore()

        const followingDoc = snapshot.data()
        const followingToUid = followingDoc.followingToUid

        const feedRef = firestore.collection("feeds").doc(context.params.userUid).collection("feed")
        const querySnapshot = await feedRef.where("postedBy", "==", followingToUid).get()

        const lodash = require("lodash")
        const batch = lodash.chunk(querySnapshot.docs, 500).map(chunk => {
            const writeBatch = firestore.batch()
            chunk.forEach(documentSnapshot => {
                writeBatch.delete(feedRef.doc(documentSnapshot.data().postId))
            })
            return writeBatch.commit()
        })

        return Promise.all(batch)
    } catch (error) {
        return error
    }
})

exports.streamTokenGenerator = functions.region("asia-south1").https.onRequest((req, res) => {
    const StreamChat = require('stream-chat').StreamChat;

    const api_key = functions.config().stream.api_key
    const api_secret = functions.config().stream.api_secret
    const user_id = req.query.uid

    // Initialize a Server Client 
    const serverClient = StreamChat.getInstance(api_key, api_secret);
    // Create User Token 
    const token = serverClient.createToken(user_id);
    return res.send({ "token": token })
})