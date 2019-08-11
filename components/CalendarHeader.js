import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { Text, IconButton } from 'react-native-paper';

import Colors from 'lane/constants/Colors'

export default class CalendarHeader extends Component {
    render() {
        return (
            <View style={{ position: 'absolute', flex: 1, flexDirection: 'row' }}>
                { this.props.openDrawer
                    ? 
                    <IconButton
                        style={{ flex: 0.12 }}
                        size={24}
                        icon="menu"
                        color='#000000'
                        onPress={ () => this.props.openDrawer() }/> 
                    :
                    <View style={{ flex: 0.12 }}></View>
                }
                <Text
                    style={{ flex: 0.76, ...styles.monthText }}>
                    { this.props.month }
                </Text>
                { this.props.signOut
                    ?
                    <IconButton
                        style={{ flex: 0.12 }}
                        icon="exit-to-app"
                        onPress={ () => this.props.signOut() }/>
                    :
                    <View style={{ flex: 0.12 }}></View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    monthText: {
        fontSize: 20,
        fontFamily: 'roboto-medium',
        fontWeight: '300',
        color: Colors.primary,
        margin: 10,
        textAlign: 'center',
    }
})

CalendarHeader.propTypes = {
};

CalendarHeader.defaultProps = {
};

