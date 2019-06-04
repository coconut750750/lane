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
import { FAB, IconButton } from 'react-native-paper';
var _ = require('lodash');

import { signOut, getIdFromEmail } from 'lane/backend/Auth';
import { onLaneUpdate, shareLane, deleteLane } from 'lane/backend/Database';

import SharingView from 'lane/components/SharingView';
import LaneCalendar from 'lane/components/LaneCalendar';
import LaneContent from 'lane/components/LaneContent';

import Colors from 'lane/constants/Colors'
import Layout from 'lane/constants/Layout'

import schedulePeriods from 'lane/utils/PeriodScheduling';
import { constructPeriodFromLane, setupScheduledMarkings, getValidLanes } from 'lane/utils/PeriodTools';

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            lanes: {},
            markings: {},
            selectedLanes: [],
            currentLane: 0,
            loading: true,
            shareModalOpen: false,

            // animations
            scrollAnim: new Animated.Value(0),
        };
    }

    componentDidMount() {
        onLaneUpdate(this.processLanes.bind(this));
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
            loading: false,
        });
        this.unselect()
    }

    select(lanes) {
        this.setState({
            selectedLanes: lanes,
            scrollAnim: new Animated.Value(0),
        });
    }

    unselect() {
        this.setState({
            selectedLanes: [],
            scrollAnim: new Animated.Value(0),
        });
    }

    getLanes(date) {
        var selectedLanes = getValidLanes(this.state.lanes, date);
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
        this.unselect();
        this.setState({
            loading: true,
        });
        deleteLane(laneObj.id, () => {
            this.setState({
                loading: false
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
                    onDayPress={ date => this.getLanes(date) }
                    style={{ ...styles.calendar, transform: transform }}
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