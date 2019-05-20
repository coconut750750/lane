import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native'

import firebase from 'firebase'

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            didAttemptLogin: false
        };
    }

    isUserEqual = (googleUser, firebaseUser) => {
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

    onSignIn = googleUser => {
        // We need to register an Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!this.isUserEqual(googleUser, firebaseUser)) {
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
                            firebase
                                .database()
                                .ref('/users/' + result.user.uid)
                                .set({
                                    email: result.user.email,
                                    profile: result.additionalUserInfo.profile.picture,
                                    firstname: result.additionalUserInfo.profile.given_name,
                                    lastname: result.additionalUserInfo.profile.family_name
                                })
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

    signInWithGoogleAsync = async () => {
        try {
            const result = await Expo.Google.logInAsync({
                behavior: 'web',
                androidClientId: '366497354766-08g0gubpalqipmd6esbi2eo5i3r84rqm.apps.googleusercontent.com',
                iosClientId: '366497354766-k148d6k8qhbq7dke5mhj81ntmhf1bd4h.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });

            if (result.type === 'success') {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                return {canceled: true};
            }
        } catch (e) {
            return {error: true};
        }
    }

    render() {
        if (this.state.didAttemptLogin) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <Button
                        title="Sign in with Google"
                        onPress={ () => {
                            this.signInWithGoogleAsync();
                            this.setState({
                                didAttemptLogin: true
                            });
                        } }
                    />
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
})