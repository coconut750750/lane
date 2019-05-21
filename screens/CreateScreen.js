import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native'

export default class CreateScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Create</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
})