// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

// listen to Following events and then trigger a push notification
exports.observeFollowing = functions.firestore
    .document("following/{uid}/follows/{followingId}")
    .onCreate((snapshot, context) => {
        const uid = context.params.uid;
        const followingId = context.params.followingId;

        // logging out some message to signal following event!
        console.log("User: " + uid + "is following " + followingId);
        
        
    admin.firestore().collection("users").doc(followingId).get()
        .then(docFollowing => {
            if (!docFollowing.exists) {
                console.log('No such document!');
            } else {
                const userFollowing = docFollowing.data();

                admin.firestore().collection("users").doc(uid).get()
                    .then(doc => {
                        if (!doc.exists) {
                            console.log('No such document!');
                        } else {
                            const user = doc.data()
                            
                            const message = {
                                notification: {
                                    title: "You now have a new follower",
                                    body: "Person " + user.username + " is following you"
                                },
                                data: {
                                    followerId: uid
                                },
                                apns: {
                                    payload: {
                                        aps: {
                                            sound: "default"
                                        }
                                    }
                                },

                                token: userFollowing.fcmToken
                            };
                        
                            admin.messaging().send(message)
                            .then(response => {
                                console.log("Successfully sent message: ", response);
                            })
                            .catch( error => {
                                console.log("Error sending message: ", error);
                            });
                        }
                    })
            }
        })
        .catch(err => {
            console.log('Error getting document ', err);
        });

});

exports.observeSendingPost = functions.firestore
        .document("sending/{senderId}/sends/{receiverId}/sendPosts/{postId}")
        .onCreate((snapshot, context) => {
            const senderId = context.params.senderId
            const receiverId = context.params.receiverId
            const postId = context.params.postId

            // Logging message to signal sending post
            console.log(senderId + " sent to " + receiverId + " a post " + postId)

            admin.firestore().collection("users").doc(senderId).get()
            .then(senderDoc => {
                if (!senderDoc.exists) {
                    console.log("Cound't find sender...")
                } else {
                    const senderUsername = senderDoc.data().username

                    admin.firestore().collection("users").doc(receiverId).get()
                    .then(receiverDoc => {
                        if (!receiverDoc.exists) {
                            console.log("Couldn't find receiver...")
                        } else {
                            const receiverFCM = receiverDoc.data().fcmToken

                            const message = {
                                notification: {
                                    title: "Received a post!",
                                    body: senderUsername + " sent you a post with id: " + postId
                                },

                                data: {
                                    postId: postId
                                },

                                apns: {
                                    payload: {
                                        aps: {
                                            sound: "default"
                                        }
                                    }
                                },

                                token: receiverFCM
                            }

                            admin.messaging().send(message)
                            .then(response => {
                                console.log("Successfully sent message: ", response)
                            })
                            .catch(error => {
                                console.log("Error sending message: ", error)
                            })
                        }
                    })
                }
            })
            .catch(err => {
                console.log('Error getting document ', err);
            });
        })

exports.sendPushNotifications = functions.https.onRequest((req, res) => {
    res.send("Attempting to send push notifications...");
    console.log("LOGGER----Trying to send push message using hardcorede data...");

    var fcmToken = "d4TLypNqk_w:APA91bFhmYMjuW_Cayg0XCXy64gzxJLcaf1gDwDcPLZCqUr3Dnt2Mx1WvoLAlKRC0qKOyTunFinRI7HrTaX3Cmu4sfPVPucWVilcxYtgEsk94u3hgTJlvvrY30AemtHzW2UiBZtB6dXh"

    var message = {
        notification: {
            title: "Notification Title",
            body: "Notification Body"
        },

        data: {
            score: "850",
            time: "2:45"
        },
        token: fcmToken
    };

    admin.messaging().send(message)
    .then(function(response) {
        console.log("Successfully sent message: ", response);
    })
    .catch(function(error) {
        console.log("Error sending message: ", error);
    });
});
