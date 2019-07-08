import React, { Component } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { signInWithGoogleAsync } from 'lane/backend/Auth';

import Colors from 'lane/constants/Colors';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        };
    }

    attemptSignIn() {
        signInWithGoogleAsync().then(res => {
            if (res === undefined) {
                this.setState({
                    loading: false,
                });
            }
        });
        this.setState({
            loading: true
        });
    }
    
    renderLogin() {
        return (
            <View style={styles.container}>
                <Image 
                    source={require('lane/assets/images/logo.png')}
                    style={{resizeMode: 'center'}}/>
                <Button
                    mode='text'
                    onPress={ () => this.attemptSignIn() }>
                    Sign in with Google
                </Button>
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
        if (!this.state.loading) {
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