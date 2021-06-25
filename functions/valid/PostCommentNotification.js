const functions = require("firebase-functions")
const admin = require("firebase-admin")
const firestore = admin.firestore()

exports.sendPostCommentNotification = functions.region("asia-east2").firestore.document("comments/{postId}/comments/{commentId}")
    .onCreate(async (snapshot, context) => {
        try {
            const commentObj = snapshot.data()

            const postDocumentSnapshot = await firestore.collection("posts").doc(commentObj["postId"]).get()
            if (!postDocumentSnapshot.exists) {
                console.log("Post does't exists")
                return null
            }

            const post = postDocumentSnapshot.data()
            if(post.postedBy == commentObj.commentedBy){
                return null
            }
            
            const userStatDocumentSnapshot = await firestore.collection("usersStat").doc(post["postedBy"]).get()
            if (!userStatDocumentSnapshot.exists) {
                console.log("User stat doesn't exists")
                return null
            }

            const userStat = userStatDocumentSnapshot.data()
            const token = userStat["token"]
            if (token == "") {
                console.log("Token empty")
                return null
            }
            
            const commentedUserDocumentSnapshot = await firestore.collection("users").doc(commentObj["commentedBy"]).get()
            if(!commentedUserDocumentSnapshot.exists){
                console.log("Commented users doesn't exisit")
                return null
            }
            const commentedUser = commentedUserDocumentSnapshot.data()

            var noti = {
                "title": "New Comment",
                "tag": commentObj.commentId,
                "image": commentedUser.profilePicUrl,
                "body": `${commentedUser.name} commented on your post`,
                "sound": "notification.mp3",
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
            console.log("Sending...")
            return await admin.messaging().send(payload)
        } catch (err) {
            return err
        }
    })