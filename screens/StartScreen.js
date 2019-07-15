import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native'

import { checkIfLoggedIn } from 'lane/backend/Auth';

export default class StartScreen extends Component {
    componentDidMount() {
        checkIfLoggedIn(this.checkLogin.bind(this));
    }

    checkLogin(loggedIn) {
        if (loggedIn) {
            this.props.navigation.navigate('Home');
        } else {
            this.props.navigation.navigate('Login');
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Image 
                    source={require('lane/assets/images/logo.png')}
                    style={{resizeMode: 'center'}}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});