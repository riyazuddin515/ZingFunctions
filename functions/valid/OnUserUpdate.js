const functions = require('firebase-functions');
const algoliasearch = require('algoliasearch').default;

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_key;

const ALGOLIA_INDEX_NAME = 'user_search';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME);

exports.onUserUpdate = functions.firestore.document('users/{uid}').onUpdate(async (change) => {
  try {
    const oldData = change.before.data()
    const newData = change.after.data()
    if (oldData.name != newData.name || oldData.username != newData.username || oldData.profilePicUrl != newData.profilePicUrl) {
      console.log("User Data updating....")
      newData.objectID = change.after.id
      return index.saveObject(newData).wait()
    }
    return "NO need To Update"
  } catch (err) {
    return err
  }
})