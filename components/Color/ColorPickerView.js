import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';

import Colors from 'lane/constants/Colors';

import ColorPalette from './ColorPalette'

export default class ColorPickerView extends Component {
    render() {
        return (
            <Surface style={ styles.surface }>
                <ColorPalette
                    onChange={ color => this.props.onChange(color) }
                    style={{ flex: 1 }}
                    value={ this.props.color }
                    colors={ Colors.laneColors }
                    title={''}/>
            </Surface>        );
    }
}

const styles = StyleSheet.create({
    surface: {
        padding: 8,
        margin: 24,
        marginBottom: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    }
})