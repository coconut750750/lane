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
        onLaneUpdate(this.processLane.bind(this));
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    processPeriods(periods) {
        var scheduled = schedulePeriods(periods);
        return setupScheduledMarkings(scheduled);
    }

    processLane(lane) {
        if (lane === undefined) {
            this.setState({ loading: false });
            return;
        }

        this.lanes[lane.id] = lane;
        this.processAll();
    }

    processAll() {
        this.periods = [];
        _.forEach(this.lanes, (laneObj, id) => {
            const period = constructPeriodFromLane(laneObj)
            this.periods = this.periods.concat(propagatePeriod(period));
        });
        const markings = this.processPeriods(this.periods);

        this.setState({
            lanes: this.lanes,
            markings: markings,
            loading: false,
        });
        this.unselect();
    }

    select(lanes) {
        this.setState({
            selectedLanes: lanes,
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
        });
    }

    unselect() {
        this.setState({
            selectedLanes: [],
            currentLane: 0,
            scrollAnim: new Animated.Value(0),
        });
        this.setState({ selectedDay: '' });
    }

    getLanes(date) {
        var selectedLanes = getValidLanes(this.periods, date);
        if (!_.isEqual(_.sortBy(selectedLanes), _.sortBy(this.state.selectedLanes))) {
            this.select(selectedLanes);
        }
    }

    onBackLane() {
        if (this.state.currentLane > 0) {
            this.setState({
                currentLane: this.state.currentLane - 1
            });
        }
    }

    onNextLane() {
        if (this.state.currentLane < this.state.selectedLanes.length - 1) {
            this.setState({
                currentLane: this.state.currentLane + 1
            });
        }
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
            delete this.lanes[laneObj.id];
            this.processAll();
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

    render() {
        if (this.state.loading) {
            return this.renderLoading();
        }

        const laneIndex = this.state.selectedLanes[this.state.currentLane];

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
                        lane={ this.state.lanes[laneIndex] }
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
                }
                <LaneCalendar
                    markings={{ ...this.state.markings }}
                    onDayPress={ date => 
                        this.setState({
                            selectedDay: date
                        }, () => this.getLanes(date))}
                    style={{ ...styles.calendar, transform: transform }}
                    selectedDay={ this.state.selectedDay }
                />
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
        height: Layout.calendarHeight
    }
})