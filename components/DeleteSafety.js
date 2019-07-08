import React, { Component } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Surface, Text, Button, Headline } from 'react-native-paper';
import PropTypes from 'prop-types';

import Colors from 'lane/constants/Colors';

export default class DeleteSafety extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <TouchableWithoutFeedback 
                onPress={ () => this.props.onClose() }>
                <View style={styles.container}>
                    <Surface style={ styles.surface }>
                        <Headline style={ styles.text }>Are you sure?</Headline>
                        <Text style={ styles.text }>All shared users will also be removed from this Lane.</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Button
                                mode="text"
                                style={{flex: 0.5}}
                                onPress={() => this.props.onClose()}>
                                Cancel
                            </Button>
                            <Button
                                mode="text"
                                style={{flex: 0.5}}
                                onPress={ () => this.props.onDelete() }>
                                Delete
                            </Button>
                        </View>
                    </Surface>
                </View>
            </TouchableWithoutFeedback>
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
        borderRadius: 8,
    },
    text: {
        textAlign: 'center',
    },
});

DeleteSafety.propTypes = {
};

DeleteSafety.defaultProps = {
};

