import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Modal,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { FAB, Text, IconButton, Snackbar } from 'react-native-paper';
var _ = require('lodash');

import { getUserID, signOut, getIdFromEmail } from 'lane/backend/Auth';
import { onLaneUpdate, shareLane, deleteLane, unsubscribeLane } from 'lane/backend/Database';

import CalendarHeader from 'lane/components/CalendarHeader';
import LaneCalendar from 'lane/components/LaneCalendar';
import LaneContent from 'lane/components/LaneContent';

import Colors from 'lane/constants/Colors'
import Layout from 'lane/constants/Layout'

import schedulePeriods from 'lane/utils/PeriodScheduling';
import { constructPeriodFromLane, propagatePeriod, setupScheduledMarkings, getValidLanes } from 'lane/utils/PeriodTools';
import { months } from 'lane/utils/TimeTools';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);

        this.lanes = {};
        this.periods = [];
        this.selectedLanes = [];
        this.state = {
            markings: {},
            currentLane: 0,
            loading: true,

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
            markings: markings,
            loading: false,
        });
        this.unselect();
    }

    markSelectedLane() {
        const laneId = this.selectedLanes[this.state.currentLane];
        var laneObj = this.lanes[laneId];
        if (laneObj === undefined) {
            return {};
        }
        var period = constructPeriodFromLane(laneObj);
        period.height = 0;
        return setupScheduledMarkings([period]);
    }

    select(lanes) {
        this.selectedLanes = lanes;
        this.setState({
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
        });
    }

    unselect() {
        this.selectedLanes = []
        this.setState({ 
            selectedDay: '',
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
        });
    }

    onPressDay(date) {
        if (this.state.selectedDay != date) {
            this.setState({ selectedDay: date }, async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
                this.getLanes(date)
            });
        } else {
            this.unselect();
        }
    }

    getLanes(date) {
        const selectedLanes = getValidLanes(this.periods, date);
        if (!_.isEqual(selectedLanes, this.selectedLanes)) {
            this.select(selectedLanes);
        }
    }

    onUpdateMonth(month) {
        monthStr = `${months[month.month - 1]} ${month.year}`
        if (this.state.month != monthStr) {
            this.setState({
                month: monthStr,
            });
        }
    }

    onBackLane() {
        this.setState({
            currentLane: (this.state.currentLane - 1) % this.selectedLanes.length
        });
    }

    onNextLane() {
        this.setState({
            currentLane: (this.state.currentLane + 1) % this.selectedLanes.length
        });
    }

    onEditLane(laneObj) {
        this.props.navigation.navigate('Edit', { laneObj: laneObj });
    }

    onShareLane(laneObj, email) {
        this.setState({
            loading: true,
        });
        getIdFromEmail(email, id => {
            if (id === undefined) {
                this.alert('Email doesn\'t exist!');
            } else {
                shareLane(laneObj.id, id);
            }
            this.setState({ loading: false });
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

    onUnsubscribeLane(laneObj) {
        this.unselect();
        unsubscribeLane(getUserID(), laneObj.id);
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

    renderLaneContent(transform) {
        if (this.selectedLanes.length > 0) {
            const laneId = this.selectedLanes[this.state.currentLane];
            return (
                <LaneContent
                    lane={ this.lanes[laneId] }
                    onBackLane={ () => this.onBackLane() }
                    onNextLane={ () => this.onNextLane() }
                    onEditLane={ lane => this.onEditLane(lane) }
                    onShareLane={ (lane, email) => this.onShareLane(lane, email) }
                    onDeleteLane={ lane => this.onDeleteLane(lane) }
                    onUnsubscribeLane={ lane => this.onUnsubscribeLane(lane) }
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

        if (this.selectedLanes.length > 0) {
            markings = this.markSelectedLane();
            height = Layout.calendarHeight;
        }

        return (
            <Animated.View style={{ ...styles.calendar, transform: transform }}>
                <LaneCalendar
                    markings={ markings }
                    onDayPress={ date => this.onPressDay(date) }
                    onMonthChange={ month => this.onUpdateMonth(month[0]) }
                    selectedDay={ this.state.selectedDay }
                    height={ height }
                />
                <CalendarHeader
                    month={this.state.month}
                    openDrawer={ () => this.props.navigation.openDrawer() }
                    signOut={ () => signOut() }/>
            </Animated.View>
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

        // content rendered first because it needs to be rendered below (z-dimension) the calendar
        return (
            <View style={styles.container}>
                {this.renderLaneContent(transform)}

                {this.renderLaneCalendar(transform)}

                

                <FAB
                    style={styles.fab}
                    icon="add"
                    onPress={ () => this.props.navigation.navigate('Create') }
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
    },
})