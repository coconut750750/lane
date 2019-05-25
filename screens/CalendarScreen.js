import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Image } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FAB, Portal } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors'
import LaneCalendar from '../components/LaneCalendar';
import LaneContent from '../components/LaneContent';
import schedulePeriods from '../utils/PeriodScheduling';
import { signOut } from '../backend/Auth';
import { retrieveLanes } from '../backend/Database';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);
        this.initLaneListener();

        this.state = {
            lanes: {},
            markings: {},
            selectedLanes: [],
            retrieveDone: false
        };
    }

    setupScheduledMarkings(scheduled) {
        var markings = {}

        scheduled.forEach( period => {
            var start = new Date(period.start).toISOString().split('T')[0];
            var curr = start;
            var end = new Date(period.end).toISOString().split('T')[0];
            var endNext = new Date(period.end + 86400000).toISOString().split('T')[0];

            while (curr != endNext) {
                if (!(curr in markings)) {
                    markings[curr] = {periods:[]}
                }
                while (markings[curr].periods.length < period.height) {
                    markings[curr].periods.push({color: 'transparent'})
                }
                markings[curr].periods.push({startingDay: curr === start, endingDay: curr === end, color: period.color});
                curr = new Date(new Date(curr).getTime() + 86400000).toISOString().split('T')[0];
            }
        });

        return markings;
    }

    processPeriods(periods) {
        var scheduled = schedulePeriods(periods);
        var markings = this.setupScheduledMarkings(scheduled);
        this.setState({
            markings: markings,
        });
    }

    processLanes(lanes) {
        this.setState({
            lanes: lanes,
        });
    }

    async initLaneListener() {
        await retrieveLanes(this.processLanes.bind(this), this.processPeriods.bind(this));
        this.setState({
            retrieveDone: true,
        });
    }

    getLanes(date) {
        var selectedLanes = [];
        _.forEach(this.state.lanes, (lane, laneid) => {
            var start = new Date(lane.startDate).getTime();
            var end = new Date(lane.endDate).getTime();
            var selected = new Date(date).getTime();
            if (selected >= start && selected <= end) {
                selectedLanes.push(laneid);
            }
        });

        if (!_.isEqual(_.sortBy(selectedLanes), _.sortBy(this.state.selectedLanes))) {
            this.setState({
                selectedLanes: selectedLanes
            });
        }
    }

    render() {
        if (!this.state.retrieveDone) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator 
                        size="large"
                        color={Colors.primary} />
                </View>
            );
        }

        return (
            <View style={styles.container}>

                <LaneCalendar
                    markings={{ ...this.state.markings }}
                    onDayPress={ date => this.getLanes(date) }/>
                {this.state.selectedLanes.length > 0 &&
                    <LaneContent
                        lanes={ this.state.selectedLanes.map(i => this.state.lanes[i]) }/>
                }
                <FAB
                    style={styles.fab}
                    icon="add"
                    onPress={ () => this.props.navigation.navigate('Create') }
                />
                <FAB
                    style={{ position: 'absolute', margin: 16, left: 0, bottom: 0, }}
                    icon="keyboard-return"
                    onPress={ () => signOut() }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})