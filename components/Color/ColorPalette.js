import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { TouchableOpacity, View, Text, Dimensions, StyleSheet } from 'react-native';

import Layout from 'lane/constants/Layout';

export default class ColorPalette extends Component {
    constructor(props) {
        super(props);
        this.renderColorOption = this.renderColorOption.bind(this);
    }

    renderColorOption(c) {
        const color = this.props.value;
        let scaledWidth = Layout.window.width * .025;
        let dimen = Layout.window.width * 0.07;
        let backgroundColor = color == c ? c : '#ffffff'
        return (
            <TouchableOpacity
                key={c}
                onPress={ () => this.props.onChange(c) }
                style={[
                    styles.colorOption,
                    {   backgroundColor: backgroundColor,
                        borderColor: c,
                        width: dimen,
                        height: dimen,
                        marginHorizontal: scaledWidth,
                        marginVertical: scaledWidth,
                        borderRadius: scaledWidth * 2,
                        borderWidth: scaledWidth / 2
                    }
                ]}>
                <View></View>
            </TouchableOpacity>
        );
    }

    render() {
        const { colors } = this.props;
        return (
            <View style={styles.container}>
                <View style={[styles.colorContainer]}>
                    {colors.map((c) => this.renderColorOption(c))}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    colorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorOption: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: .25,
    }
});

ColorPalette.defaultProps = {
    value: '#C0392B',
    onChange: () => {},
    colors: [
        '#C0392B', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9', '#3498DB', '#1ABC9C',
        '#16A085', '#27AE60', '#2ECC71', '#F1C40F', '#F39C12', '#E67E22', '#D35400',
        '#ffffff', '#BDC3C7', '#95A5A6', '#7F8C8D', '#34495E', '#2C3E50', '#000000',
    ],
};

ColorPalette.propTypes = {
    colors: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    value: PropTypes.string,
};