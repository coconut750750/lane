import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { FAB, IconButton, Snackbar } from 'react-native-paper';
var _ = require('lodash');

import { signOut, getIdFromEmail } from 'lane/backend/Auth';
import { onLaneUpdate, shareLane, deleteLane } from 'lane/backend/Database';

import SharingView from 'lane/components/SharingView';
import LaneCalendar from 'lane/components/LaneCalendar';
import LaneContent from 'lane/components/LaneContent';

import Colors from 'lane/constants/Colors'
import Layout from 'lane/constants/Layout'

import schedulePeriods from 'lane/utils/PeriodScheduling';
import { constructPeriodFromLane, propagatePeriod, setupScheduledMarkings, getValidLanes } from 'lane/utils/PeriodTools';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);

        this.lanes = {}; // used to add retreived lanes that resolve asynchronously
        this.periods = [];
        this.state = {
            lanes: {},
            markings: {},
            selectedLanes: [],
            currentLane: 0,
            loading: true,
            shareModalOpen: false,

            // animations
            scrollAnim: new Animated.Value(0),

            // snackbar
            snackVisible: false,
            snackMessage: '',
        };
    }

    componentDidMount() {
        onLaneUpdate(this.processLane.bind(this), this.unprocessLane.bind(this));
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    processLane(lane) {
        if (lane === undefined) {
            this.setState({ loading: false });
            return;
        }

        this.lanes[lane.id] = lane;
        this.processAll();
    }

    unprocessLane(laneId) {
        delete this.lanes[laneId];
        this.processAll();
    }

    processPeriods(periods) {
        var scheduled = schedulePeriods(periods);
        return setupScheduledMarkings(scheduled);
    }

    processAll() {
        this.periods = [];
        var propagatedPeriods = [];
        _.forEach(this.lanes, (laneObj, id) => {
            const period = constructPeriodFromLane(laneObj)
            this.periods.push(period);
            propagatedPeriods = propagatedPeriods.concat(propagatePeriod(period));
        });
        this.periods = schedulePeriods(this.periods);
        const markings = this.processPeriods(propagatedPeriods);

        this.setState({
            lanes: this.lanes,
            markings: markings,
            loading: false,
        });
        this.unselect();
    }

    markSelectedLane() {
        const laneId = this.state.selectedLanes[this.state.currentLane];
        var laneObj = this.state.lanes[laneId];
        var period = constructPeriodFromLane(laneObj);
        period.height = 0;
        return setupScheduledMarkings([period]);
    }

    select(lanes) {
        this.setState({
            selectedLanes: lanes,
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
        });
    }

    unselect() {
        this.setState({ selectedDay: '' }, () => this.setState({
            selectedLanes: [],
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
            selectedDay: '',
        }));
    }

    onPressDay(date) {
        if (this.state.selectedDay != date) {
            this.setState({ selectedDay: date }, () => this.getLanes(date));
        } else {
            this.unselect();
        }
    }

    getLanes(date) {
        const selectedLanes = getValidLanes(this.periods, date);
        if (!_.isEqual(selectedLanes, this.state.selectedLanes)) {
            this.select(selectedLanes);
        }
    }

    onBackLane() {
        this.setState({
            currentLane: (this.state.currentLane - 1) % this.state.selectedLanes.length
        });
    }

    onNextLane() {
        this.setState({
            currentLane: (this.state.currentLane + 1) % this.state.selectedLanes.length
        });
    }

    onEditLane(laneObj) {
        this.props.navigation.navigate('Edit', { laneObj: laneObj });
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
                this.alert('Email doesn\'t exist!');
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
        this.unselect();
        this.setState({
            loading: true,
        });
        deleteLane(laneObj.id, () => {
            this.setState({
                loading: false,
            });
        });
    }

    renderLoading() {
        return (
            <View style={styles.container}>
                <ActivityIndicator 
                    size="large"
                    color={Colors.primary} />
            </View>
        );
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

    renderLaneContent(transform) {
        if (this.state.selectedLanes.length > 0) {
            const laneId = this.state.selectedLanes[this.state.currentLane];
            return (
                <LaneContent
                    lane={ this.state.lanes[laneId] }
                    onBackLane={ () => this.onBackLane() }
                    onNextLane={ () => this.onNextLane() }
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
            );
        }

        return null;
    }

    renderLaneCalendar(transform) {
        var markings = { ...this.state.markings };
        var height = Layout.window.height;

        if (this.state.selectedLanes.length > 0) {
            markings = this.markSelectedLane();
            height = Layout.calendarHeight;
        }

        return (
            <LaneCalendar
                markings={ markings }
                onDayPress={ date => this.onPressDay(date) }
                style={{ ...styles.calendar, transform: transform }}
                selectedDay={ this.state.selectedDay }
                height={ height }
            />
        );
    }

    render() {
        if (this.state.loading) {
            return this.renderLoading();
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

                {this.renderLaneContent(transform)}

                {this.renderLaneCalendar(transform)}

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
                <IconButton
                    style={{ position: 'absolute', margin: 16, left: 0, top: 0, }}
                    size={24}
                    icon="menu"
                    color='#000000'
                    onPress={ () => this.props.navigation.openDrawer() }
                />
                <Snackbar
                    visible={this.state.snackVisible}
                    duration={3000}
                    onDismiss={() => this.setState({ snackVisible: false, snackMessage: '' })}>
                    { this.state.snackMessage }
                </Snackbar>
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
    }
})