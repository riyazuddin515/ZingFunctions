const functions = require("firebase-functions")
const admin = require("firebase-admin")
const uuid = require("uuid")

const firestore = admin.firestore()

exports.sendMessageToUser25 = functions.https.onRequest((req, res) => {
    const user25Uid = "8EdyfZ1jNmGkDRrkkq7Mb8qbOaI5"
    const arr = [
        "fF1FTZ34HoAE952KJCRTGrhL0thX",
        "6RL1hZFb7u1e8wAPfx5x8jfViVge",
        "UD4m3tKiKnXarqnY7B46BWA2sRIH",
        "XDIXCKryjrsiEEIsofcO9QHCcyu9",
        "QPTCltUK5pIzqdZP8OYEyzNfm71N",
        "Gw1Ch0DiKr3KZL3EezPgYlY6N9RW",
        "53kcxSnKKGgZmjiyrNSvwti4LhWX",
        "Uo5DZAVQZRzn8g5B9puhY31pV9b8",
        "XNnrEExr6eZr1aCFoXNCfcNSIz6x",
        "hdXjK5bnbUOwkyJuG4Q42QcrlwaX",
        "ZJ3JA4NQlOZ8P3QZueg1L7v3yxVC",
        "EP8aqLMFAc51xlrKAgEWe0Nhdci2",
        "DAKdCnfJE8rccbPDw0FYEsWt53Qu",
        "8GNTQTaqOE47nB2B592qnIwJxAfm",
        "9GdMt56TNQPgF1yYdQSeAzYgT1tx",
        "AnrllBTPFxrJ55Key7E3fSeb1sff",
        "HMUrY5xZJuXZgJQIrLlqyZ8OJax9",
        "GX8ksR7oFk0bWUZmTgq0tVhH2OnB",
        "0OeYjcSAukYETrQhDePG8XfcOMb2",
        "Cph7nvfN7k6B13vkSONSRforp0EV",
        "erZ0PYQpSR9QCOFuw6uI4Zcnaxlq",
        "p73F16NbqkoZdxKG7CBuu5QHQIwC",
        "LLTpsAkAUiDn1q0g9kOQjcBdJoel",
        "1GTVaY85CQNDrHVBl3lWbaGpombw"
    ]
    try{
        var i = 0
        arr.forEach(async uid => {
            i = i + 1;
            var chatThred = getChatThread(user25Uid, uid)
            var messageId = uuid.v4();
            var message = {
                "data": Date.now(),
                "message": `${i}`,
                "messageId": messageId,
                "senderAndReceiverUid": [`${uid}`, `${user25Uid}`],
                "status": "SENT",
                "type": "TEXT",
                "url": ""
            }
            var lastMessage = {
                "chatThred": chatThred,
                "message": message,
                "receiverUid": user25Uid
            }
            await firestore.collection("chats").doc(chatThred)
            .set(lastMessage).catch(err => {
                console.error(err)
            })

            await firestore.collection("chats").doc(chatThred)
            .collection("messages").doc(messageId).set(message).catch(err => {
                console.error(err)
            })
        })
        res.send("Done")
    }catch(err){
        res.send(err)
    }
})
function getChatThread(currentUid, otherEndUserUid){
if (currentUid < otherEndUserUid)
            currentUid + otherEndUserUid
        else
            otherEndUserUid + currentUid
}
        