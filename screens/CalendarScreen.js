import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Button,
    Image,
    Modal
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { FAB, Portal } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors'
import LaneCalendar from '../components/LaneCalendar';
import LaneContent from '../components/LaneContent';
import schedulePeriods from '../utils/PeriodScheduling';
import { setupScheduledMarkings, getValidLanes } from '../utils/PeriodTools';
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
            retrieveDone: false,
            shareModalOpen: false
        };
    }

    processPeriods(periods) {
        var scheduled = schedulePeriods(periods);
        var markings = setupScheduledMarkings(scheduled);
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
        var selectedLanes = getValidLanes(this.state.lanes, date);
        if (!_.isEqual(_.sortBy(selectedLanes), _.sortBy(this.state.selectedLanes))) {
            this.setState({
                selectedLanes: selectedLanes
            });
        }
    }

    // renderShareModal() {
    //     return (
    //         <Modal
    //             animationType="slide"
    //             transparent={true}
    //             onRequestClose={ () => {} }
    //             visible={ this.state.shareModalOpen }>
    //             <ColorPickerView
    //                 onChange={ color => {
    //                     this.color = color;
    //                     this.setState({ shareModalOpen: false });
    //                 }}
    //                 color={ this.color }/>
    //         </Modal>
    //     );
    // }

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