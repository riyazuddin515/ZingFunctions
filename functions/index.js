const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch').default;

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;

const ALGOLIA_INDEX_NAME = 'user_search';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.onUserCreated = functions.firestore.document('users/{uid}').onCreate((snap, context) => {
    // Get the note document
    const user = snap.data();
  
    // Add an 'objectID' field which Algolia requires
    user.objectID = snap.id;
  
    // Write to the algolia index
    return index.saveObject(user);
});

exports.onUserUpdate = functions.firestore.document('users/{uid}').onUpdate((change) => {
    const newData = change.after.data();
    newData.objectID = change.after.id;
    return index.saveObject(newData);
});