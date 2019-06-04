import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';

import { signInWithGoogleAsync } from 'lane/backend/Auth';

import Colors from 'lane/constants/Colors';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            didAttemptLogin: false
        };
    }

    attemptSignIn() {
        signInWithGoogleAsync();
        this.setState({
            didAttemptLogin: true
        });
    }
    
    renderLogin() {
        return (
            <View style={styles.container}>
                <Button
                    title="Sign in with Google"
                    onPress={ () => this.attemptSignIn() }
                />
            </View>
        );
    }

    renderLoading() {
        return (
            <View style={styles.container}>
                <ActivityIndicator 
                    size="large"
                    color={Colors.primary}
                />
            </View>
        );
    }

    render() {
        if (!this.state.didAttemptLogin) {
            return this.renderLogin();
        } else {
            return this.renderLoading();
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