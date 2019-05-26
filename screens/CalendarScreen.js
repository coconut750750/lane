import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Animated,
} from 'react-native';
import { FAB } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors'
import Layout from '../constants/Layout'
import LaneCalendar from '../components/LaneCalendar';
import LaneContent from '../components/LaneContent';
import schedulePeriods from '../utils/PeriodScheduling';
import { constructPeriodFromLane, setupScheduledMarkings, getValidLanes } from '../utils/PeriodTools';
import { signOut, getIdFromEmail } from '../backend/Auth';
import { retrieveLanes } from '../backend/Database';
import SharingView from '../components/SharingView';
import { shareLane, deleteLane } from '../backend/Database';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);

        const scrollAnim = new Animated.Value(0);

        this.state = {
            lanes: {},
            markings: {},
            selectedLanes: [],
            loading: true,
            shareModalOpen: false,

            // animations
            scrollAnim: scrollAnim,
        };
    }

    componentDidMount() {
        this.initLaneListener();
    }

    processPeriods(periods) {
        var scheduled = schedulePeriods(periods);
        return setupScheduledMarkings(scheduled);
    }

    processLanes(lanes) {
        var periods = [];
        _.forEach(lanes, (laneObj, id) => {
            periods.push(constructPeriodFromLane(laneObj));
        });

        this.setState({
            lanes: lanes,
            markings: this.processPeriods(periods),
            selectedLanes: [],
            loading: false,
        });
    }

    async initLaneListener() {
        retrieveLanes(this.processLanes.bind(this));
    }

    getLanes(date) {
        var selectedLanes = getValidLanes(this.state.lanes, date);
        if (!_.isEqual(_.sortBy(selectedLanes), _.sortBy(this.state.selectedLanes))) {
            this.setState({
                selectedLanes: selectedLanes
            });
        }
    }

    onEditLane(laneObj) {

    }

    onShareLane(laneObj) {
        this.setState({
            shareModalOpen: true,
            sharingId: laneObj.id
        });
    }

    onSendShare(email) {
        this.setState({
            loading: true,
            shareModalOpen: false
        });
        getIdFromEmail(email, id => {
            if (id === undefined) {
                alert('Email doesn\'t exist!');
            } else {
                shareLane(this.state.sharingId, id);
            }
            this.setState({
                loading: false,
                sharingId: undefined
            });
        });
    }

    onDeleteLane(laneObj) {
        this.setState({
            selectedLanes: [],
            loading: true,
        });
        deleteLane(laneObj.id, () => {
            this.setState({
                loading: false
            });
        });
    }

    renderShareModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={ () => {} }
                visible={ this.state.shareModalOpen }>
                <SharingView
                    onCancel={ () => this.setState({shareModalOpen: false}) }
                    onSend={ email => this.onSendShare(email) }
                />
            </Modal>
        );
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator 
                        size="large"
                        color={Colors.primary} />
                </View>
            );
        }

        const calendarTranslate = this.state.scrollAnim.interpolate({
            inputRange: [0, Layout.calendarHeight],
            outputRange: [0, -Layout.calendarHeight],
            extrapolate: 'clamp',
        });
        const transform = [{ translateY: calendarTranslate }];

        return (
            <View style={styles.container}>

                {this.renderShareModal()}

                {this.state.selectedLanes.length > 0 &&
                    <LaneContent
                        lanes={ this.state.selectedLanes.map(i => this.state.lanes[i]) }
                        onEditLane={ lane => this.onEditLane(lane) }
                        onShareLane={ lane => this.onShareLane(lane) }
                        onDeleteLane={ lane => this.onDeleteLane(lane) }
                        calendarHeight={ Layout.calendarHeight }
                        headerTransform={ transform }
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
                            { useNativeDriver: true },
                        )}
                    />
                }
                <LaneCalendar
                    markings={{ ...this.state.markings }}
                    onDayPress={ date => this.getLanes(date) }
                    style={{ ...styles.calendar, transform: transform }}/>
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
    calendar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Layout.calendarHeight
    }
})