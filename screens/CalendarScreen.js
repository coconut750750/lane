import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FAB, Portal } from 'react-native-paper';
import firebase from 'firebase';
var _ = require('lodash');

import Colors from '../constants/Colors'
import LaneCalendar from '../components/LaneCalendar';
import LaneContent from '../components/LaneContent';
import schedulePeriods from '../utils/PeriodScheduling';

function mergeCustomizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);
        this.retrieveLanes();

        this.state = {
            lanes: {},
            markings: {},
            open: false,
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

    async retrieveLanes() {
        var userid = firebase.auth().currentUser.uid;
        var laneObjs = {};
        var periods = [];
        await firebase.database().ref('users').child(userid).child('lanes').once('value').then(datasnapshot => {
            var lanes = datasnapshot.val()
            var markings = Object.keys(lanes).map( key =>
                firebase.database().ref('lanes').child(lanes[key]).once('value', lanesnapshot => {
                    var laneid = lanesnapshot.key;
                    var lane = lanesnapshot.val();
                    laneObjs[laneid] = lane;
                    periods.push({
                        start: new Date(lane.startDate).getTime(),
                        end: new Date(lane.endDate).getTime(),
                        color: lane.color,
                        id: lanes[key],
                        height: -1
                    });
                })
            );
            Promise.all(markings).then(lanes => {
                var scheduled = schedulePeriods(periods);
                var firebaseMarkings = this.setupScheduledMarkings(scheduled);
                this.setState({
                    lanes: laneObjs,
                    markings: firebaseMarkings,
                    retrieveDone: true
                });
            });
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
        // <Button
        //    title="Sign Out"
        //    onPress={ () => firebase.auth().signOut() }
        // />
        if (!this.state.retrieveDone) {
            return (
                <ActivityIndicator 
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    size="large"
                    color={Colors.primary} />
            );
        }
        return (
            <View style={styles.container}>
                <NavigationEvents onDidFocus={ () => this.retrieveLanes() } />

                <LaneCalendar
                    markings={{ ...this.state.markings }}
                    onDayPress={ date => this.getLanes(date) }/>
                {this.state.selectedLanes.length > 0 &&
                    <LaneContent
                        lanes={ this.state.selectedLanes.map(i => this.state.lanes[i]) }/>
                }
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
                      }}/>
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