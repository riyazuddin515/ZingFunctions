const functions = require('firebase-functions')
const admin = require('firebase-admin')
const uuid = require('uuid');
const firestore = admin.firestore()
const FieldValue = admin.firestore.FieldValue

exports.fakePosts = functions.https.onRequest((req, res) => {

    const uids = [
        "3016adbd-922b-4d23-a5d6-493a274a1719",
        "4c0f6889-7ac5-43f1-a681-d47f56f07e1e",
        "9de62bc0-b11a-4ed5-9263-3df5d6a0293d",
        "e92f3eb3-bfec-40d8-aae8-bcc247958d57",
        "89bd43f7-0322-4a89-b4ab-224116746633",
        "94931604-ea8e-4aeb-896a-63967e4c181d",
        "d25878c7-0d8d-46ff-9b5f-38d46fe9f79e",
        "72e6c458-2ee3-4da2-9b94-c9ad9b9471e2",
        "14f53bfc-958a-4dcc-a296-420b401ad322",
        "681ff5e4-47a5-4321-946d-250266ade05f",
        "d56fdfa7-7a63-43af-bdfe-ab9858cd365b",
        "129ee036-993b-43b2-a521-f81bff7151dd",
        "ca87f873-9de2-4676-ae22-51c279e24103",
        "83d3e3eb-6472-4e21-8bcf-1f9ba2572e62",
        "ac5d53b4-4f0d-4d8b-b709-d677f971bf6d",
        "a069ede5-d538-469e-a30a-8dae0f9c098a",
        "f80fc914-7e9d-4aac-993b-d7d74218d40e",
        "29f5317d-b2e7-42f8-a15a-1fd503e7c39b",
        "504ed619-a817-48c0-bb22-ff075c9f8ea7",
        "65d71d6f-b2af-45f9-a8e2-7ecfcc34215c",
        "c537bc5f-76d4-453c-a381-d7d218ce6c40",
        "48c4ccfb-2fa2-4c32-87d5-fb440565fc8f",
        "a3885407-1fe5-4a7c-9f7c-5c98daa38c08",
        "d921ac36-1914-45ae-88a8-e9835296bce2",
        "2f55fab0-6c62-45f0-a63f-f9d6dbd76ad0",
        "f6f9ada5-9b11-41cc-9553-a1d7e89c30d4",
        "3dc0d0c0-70e6-4b77-a6d9-d3a2bed328c5",
        "e2e65769-d724-48c6-a9ad-e9ee45a41adb",
        "d0e643ff-3fd0-4f83-9b29-2980751ba1bf",
        "cd72301d-6e62-49f9-a78b-745b913da6d9",
        "dbab2818-98c2-406e-b173-eec68f289791",
        "2d47af00-41bf-42f6-9cff-da9ffbbb4624",
        "d703a89d-8480-4766-bad3-f2ab12bf4666",
        "83fac867-46bc-459f-b988-712006ad6086",
        "56e8573e-f20a-4092-a9a2-e391d491152a",
        "d93ac3e8-0c6d-47b8-91d3-2b532487573b",
        "8418a692-c328-415b-9551-ae8131f8938d",
        "a84467bb-fb49-42ad-a884-97350756c91e",
        "e047766e-c125-4281-9f7d-a76437e50e3c",
        "e8beafc0-a9a3-4f39-bc80-2dcffaef83f8",
        "71ee4a11-388c-4e47-abf0-fe4231c49083",
        "98c18a31-06a3-4563-8e25-e358b365c708",
        "f60393ee-c8fc-4079-8a58-acf647c9b168",
        "fb79119b-6811-4d8b-ad54-abc8eccbe7ce",
        "1a284743-5523-48f7-9f86-3c4d5b844504",
        "77aa0df9-81a6-417e-9b45-b8e6a66cc6f4",
        "5d5ea68a-d836-40df-9d47-c787cacd3b0f",
        "1126b594-c8bb-433d-9566-ee23f797a1d1",
        "b8becc57-bdf9-42d3-a51b-1f1878d45916",
        "91d25ce3-87c8-4d94-94d9-b783de70aaad"
    ]

    try {
        uids.forEach(async uid => {
            for (var i = 1; i <= 5; i++) {
                const postId = uuid.v4()
                const post = {
                    "caption": `${i}`,
                    "date": FieldValue.serverTimestamp(),
                    "imageUrl": "https://firebasestorage.googleapis.com/v0/b/zing515.appspot.com/o/Test.jpeg?alt=media&token=1bd7e585-cf11-4f63-ac14-c5bdb264edb5",
                    "likeCount": 0,
                    "postId": postId,
                    "postedBy": uid
                }
                await firestore.collection("posts").doc(postId).set(post)
            }
        })
        res.send("Done")
    } catch (err) {
        res.send(err)
    }

})