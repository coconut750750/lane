import firebase from 'firebase';

import { clientId } from 'lane/config';

export function getUserID() {
    return firebase.auth().currentUser.uid;
}

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser.getBasicProfile().getId()) {
                return true;
            }
        }
    }
    return false;
}

function onSignIn(googleUser) {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(
                googleUser.idToken,
                googleUser.accessToken
             );
            // Sign in with credential from the Google user.
            firebase
                .auth()
                .signInWithCredential(credential)
                .then(function(result) {
                    if (result.additionalUserInfo.isNewUser) {
                        firebase.database()
                            .ref('users')
                            .child(result.user.uid)
                            .set({
                                email: result.user.email,
                                profile: result.additionalUserInfo.profile.picture,
                                firstname: result.additionalUserInfo.profile.given_name,
                                lastname: result.additionalUserInfo.profile.family_name
                            });
                        firebase.database()
                            .ref('emails')
                            .child(result.user.uid)
                            .set(result.user.email);
                    }
                })
                .catch(function(error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // The email of the user's account used.
                    var email = error.email;
                    // The firebase.auth.AuthCredential type that was used.
                    var credential = error.credential;
                });
        } else {
            console.log('User already signed-in Firebase.');
        }
    });
}

export async function signInWithGoogleAsync() {
    try {
        const result = await Expo.Google.logInAsync({
            behavior: 'web',
            androidClientId: clientId.android,
            iosClientId: clientId.ios,
            scopes: ['profile', 'email']
        });

        if (result.type === 'success') {
            onSignIn(result);
            return result.accessToken;
        } else {
            return {canceled: true};
        }
    } catch (e) {
        return {error: true};
    }
}

export function signOut() {
    firebase.auth().signOut();
}

export function checkIfLoggedIn(checkComplete) {
    firebase.auth().onAuthStateChanged(user => {
        checkComplete(user != undefined);
    });
}

export async function getIdFromEmail(email, onComplete) {
    firebase.database().ref('emails').once('value', snapshot => {
        var emails = snapshot.val();
        for (var id in emails) {
            if (emails[id] === email) {
                onComplete(id);
                return;
            }
        }
        onComplete(undefined);
    });
}