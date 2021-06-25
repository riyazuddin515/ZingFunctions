const functions = require("firebase-functions")
const admin = require("firebase-admin")
const firestore = admin.firestore()
const FieldValue = admin.firestore.FieldValue;

exports.onUserLastSeenChage =functions.database.ref('/status/{uid}').onUpdate((change, context) => {
    const after = change.after.val()
    if (after.state == "Offline") {
    const isOfflineForFirestore = {
      state: 'Offline',
      lastSeen: FieldValue.serverTimestamp(),
    }
    console.log("updating")
    return firestore.doc(`usersStat/${context.params.uid}`).set(isOfflineForFirestore, { merge: true })
    }
    return null
})