const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


exports.pushNotification2 = functions.database.ref(`/NotifityChat/{pushId}`).onCreate((snapshot) => {
    let data = snapshot.data._newData;
    const reciverID = data.reciverId;

    const payload = {
        notification: {
            title: 'New Message Recived!',
            body: data.msg.substring(0, 40) + '....',
            icon: 'images/OLX-Logo.png',
            click_action: 'https://paki-olx.firebaseapp.com/messages.html'
        }
    };

    return admin.database().ref(`Tokens/${reciverID}`).once('value').then((snap) => {

        if (snap.val() != null) {
            let token = snap.val();

            return admin.messaging().sendToDevice(token, payload);


        }


    })

})
