import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Snackbar } from 'react-native-paper';
import PropTypes from 'prop-types';
var _ = require('lodash');

import { updateLane } from 'lane/backend/Database';

import LaneModifyView from 'lane/components/LaneModifyView';

import Colors from 'lane/constants/Colors';

import { getStartEnd } from 'lane/utils/PeriodTools';

export default class EditScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploading: false,

            // snackbar
            snackVisible: false,
            snackMessage: '',
        };

        this.originalLane = props.navigation.getParam('laneObj');
        this.originalLane.photos = Object.values(this.originalLane.photos);
    }

    componentDidMount() {
        this.setState({
            uploading: false,
        });
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    handleDone = async (title, photos, color) => {
        console.log(this.originalLane);
        console.log(photos);

        if (title === '') {
            this.alert('Please add a title');
            return;
        }
        if (photos.length === 0) {
            this.alert('Please add a photo');
            return;
        }
        this.setState({uploading: true});

        // // remove photos that were existing
        // // add new photos

        const { start, end } = getStartEnd(photos)

        await updateLane(this.originalLane.id, {
            title: title,
            startDate: start,
            endDate: end,
            color: color});

        // await Promise.all(photos.map(photo => uploadImageAsync(laneId, photo)));
        
        // await addLaneToUser(userId, laneId);

        this.setState({ uploading: false });
        this.props.navigation.goBack();
    }

    renderLoading() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator 
                    size="large"
                    color={Colors.primary} />
            </View>
        );
    }

    render() {
        if (this.state.uploading) {
            return this.renderLoading();
        }

        return (
            <View style={ styles.container }>
                <LaneModifyView
                    laneObj={this.originalLane}
                    handleDone={this.handleDone}
                    goBack={ () => this.props.navigation.goBack() }/>

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
});

EditScreen.propTypes = {
};

EditScreen.defaultProps = {
};

