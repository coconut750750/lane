import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';

import ColorPalette from './ColorPalette'
import Colors from '../../constants/Colors';

export default class ColorPickerView extends Component {
    render() {
        return (
            <View style={ styles.wrapper }>
                <Surface style={ styles.surface }>
                    <ColorPalette
                        onChange={ color => this.props.onChange(color) }
                        style={{ flex: 1 }}
                        value={ this.props.color }
                        colors={ Colors.laneColors }
                        title={''}/>
                </Surface>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backdrop,
    },
    surface: {
        padding: 8,
        margin: 24,
        marginBottom: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        height: 100
    }
})