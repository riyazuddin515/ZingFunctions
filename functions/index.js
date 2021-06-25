// const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const onUserLastSeenChage = require("./valid/OnUserLastSeenChange")
exports.onUserLastSeenChage = onUserLastSeenChage.onUserLastSeenChage

const sendFollowerNotification = require("./valid/FollowerNotification")
exports.sendFollowerNotification = sendFollowerNotification.sendFollowerNotification

const sendPostCommentNotification = require("./valid/PostCommentNotification")
exports.sendPostCommentNotification = sendPostCommentNotification.sendPostCommentNotification

const sendNewPostLikeNotification = require("./valid/SendPostLikeNotification")
exports.sendNewPostLikeNotification = sendNewPostLikeNotification.sendNewPostLikeNotification

const sendChatNotification = require("./valid/SendChatNotification")
exports.sendChatNotification = sendChatNotification.sendChatNotification

// //Fake one's
// const fakeAuth = require("./FakeAuth")
// const fakePosts = require("./CreateFakePosts")
// const sendFakeMessagesToUser25 = require("./SendFakeMessagesToUser25")

// exports.fakeAuth = fakeAuth.fakeAuth
// exports.fakePosts = fakePosts.fakePosts
// exports.sendFakeMessagesToUser25 = sendFakeMessagesToUser25.sendMessageToUser25