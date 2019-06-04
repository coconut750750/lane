import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, TextInput, Button } from 'react-native-paper';

import Colors from 'lane/constants/Colors';

export default class SharingView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: ''
        }
    }

    render() {
        return (
            <View style={ styles.container }>
                <Surface style={ styles.surface }>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            label='Add email'
                            value={ this.state.email }
                            style={ styles.textInput }
                            onChangeText={ email => this.setState({ email: email }) }
                        />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{flex: 0.6}}>
                        </View>
                        <Button
                            mode="text"
                            style={{flex: 0.2}}
                            onPress={() => this.props.onCancel()}>
                            Cancel
                        </Button>
                        <Button
                            mode="text"
                            style={{flex: 0.2}}
                            onPress={() => this.props.onSend(this.state.email)}>
                            Send
                        </Button>
                    </View>
                </Surface>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backdrop,
    },
    surface: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        margin: 12,
    },
    textInput: {
        flex: 1
    }
})