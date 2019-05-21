import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native'
import firebase from 'firebase'
import { FAB, Portal } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors'
import LaneCalendar from '../components/LaneCalendar';
import LaneContent from '../components/LaneContent';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);
        var markings = {
                '2019-05-16': {
                    periods: [
                        { startingDay: true, endingDay: false, color: '#5f9ea0' },
                        { startingDay: true, endingDay: false, color: '#ffa500' },
                    ]
                },
                '2019-05-17': {
                    periods: [
                        { startingDay: false, endingDay: true, color: '#5f9ea0' },
                        { startingDay: false, endingDay: true, color: '#ffa500' },
                        { startingDay: true, endingDay: false, color: '#f0e68c' },
                    ]
                },
                '2019-05-18': {
                    periods: [
                        { startingDay: true, endingDay: true, color: '#ffa500' },
                        { color: 'transparent' },
                        { startingDay: false, endingDay: false, color: '#f0e68c' },
                    ]
                }
            }
        this.state = {
            markings: markings,
            open: false,
        };
    }

    render() {
        // <Button
        //    title="Sign Out"
        //    onPress={ () => firebase.auth().signOut() }
        // />
        return (
            <View style={styles.container}>
                <LaneCalendar
                    markings={this.state.markings}
                />
                <LaneContent
                />
                <FAB.Group
                      open={this.state.open}
                      icon={this.state.open ? 'add' : 'expand-less'}
                      actions={[
                            { icon: 'create', label: 'Edit', onPress: () => console.log('Pressed Edit') },
                      ]}
                      onStateChange={({ open }) => this.setState({ open })}
                      onPress={() => {
                            if (this.state.open) {
                                this.props.navigation.navigate('Create');
                            }
                      }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})