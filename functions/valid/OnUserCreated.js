const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch').default;

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;

const ALGOLIA_INDEX_NAME = 'user_search';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.onUserCreated = functions.firestore.document('users/{uid}').onCreate(async(snap, context) => {
    const user = snap.data();
    user.objectID = snap.id;
    return index.saveObject(user)
})
