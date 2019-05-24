import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native'

import { signInWithGoogleAsync } from '../backend/Auth';
import Colors from '../constants/Colors'

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            didAttemptLogin: false
        };
    }

    render() {
        if (this.state.didAttemptLogin) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator 
                        size="large"
                        color={Colors.primary}
                    />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <Button
                        title="Sign in with Google"
                        onPress={ () => {
                            signInWithGoogleAsync();
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