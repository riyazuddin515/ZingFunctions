const functions = require('firebase-functions')
const admin = require('firebase-admin')
const uuid = require("uuid")

const firestore = admin.firestore()
const FieldValue = admin.firestore.FieldValue

exports.fakeAuth = functions.https.onRequest(async (req, res) => {
    try {
        var s = ""
        var uids = []
        for (var i = 1; i <= 50; i++) {
            var uid = uuid.v4()
            const user = {
                "localId": `${uid}`,
                "createdAt": "1624348666599",
                "lastLoginAt": "1624348666598",
                "displayName": "",
                "photoUrl": "",
                "passwordHash": "fakeHash:salt=fakeSaltkkZhNpGrTZK2XgiyaBoM:password=12345678",
                "salt": "fakeSaltkkZhNpGrTZK2XgiyaBoM",
                "passwordUpdatedAt": 1624349001716,
                "providerUserInfo": [
                    {
                        "providerId": "password",
                        "email": `test${i}@gmail.com`,
                        "federatedId": `test${i}@gmail.com`,
                        "rawId": `test${i}@gmail.com`,
                        "displayName": "",
                        "photoUrl": ""
                    }
                ],
                "validSince": "1624349001",
                "email": `test${i}@gmail.com`,
                "emailVerified": true,
                "disabled": false
            }
            const u = {
                "name": `test${i}`,
                "bio": "I am on Zing now",
                "followerCount": 0,
                "followingCount": 0,
                "postCount": 0,
                "profilePicUrl": "https://firebasestorage.googleapis.com/v0/b/zing515.appspot.com/o/img_avatar.png?alt=media&token=b40984fc-155d-4acc-b031-a38076a98628",
                "uid": uid,
                "username": `test${i}`,
                "date": FieldValue.serverTimestamp()
            }
            await firestore.collection("users").doc(uid).set(u)
            uids.push(uid)
            s = s + JSON.stringify(user) + ","
        }
        return res.send(s + uids)
    } catch (err) {
        res.send(err)
    }
})