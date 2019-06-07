import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Snackbar } from 'react-native-paper';
import PropTypes from 'prop-types';
var _ = require('lodash');

import { updateLane, removePhoto, uploadImageAsync } from 'lane/backend/Database';

import LaneModifyView from 'lane/components/LaneModifyView';

import Colors from 'lane/constants/Colors';

import { getStartEnd } from 'lane/utils/PeriodTools';

export default class EditScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploading: false,
            originalLane: undefined,

            // snackbar
            snackVisible: false,
            snackMessage: '',
        };
    }

    componentDidMount() {
        this.extractOriginalLane(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState({ originalLane: undefined }, () => this.extractOriginalLane(props));
    }

    extractOriginalLane(props) {
        const originalLane = props.navigation.getParam('laneObj');
        this.originalPhotoIds = originalLane.photos.map(p => p.md5);

        this.setState({ originalLane: originalLane });
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    handleDone = async (title, photos, color) => {
        if (title === '') {
            this.alert('Please add a title');
            return;
        }
        if (photos.length === 0) {
            this.alert('Please add a photo');
            return;
        }
        this.setState({uploading: true});

        const { start, end } = getStartEnd(photos)

        await updateLane(this.state.originalLane.id, {
            title: title,
            startDate: start,
            endDate: end,
            color: color});

        const toAdd = [];
        const toRemove = [...this.originalPhotoIds];
        _.forEach(photos, photo => {
            var index = toRemove.indexOf(photo.md5);
            if (index >= 0) {
                toRemove.splice(index, 1);
            } else {
                toAdd.push(photo);
            }
        });

        await Promise.all(toRemove.map( photoId => removePhoto(photoId, this.state.originalLane.id) ));
        await Promise.all(toAdd.map( photo => uploadImageAsync(photo, this.state.originalLane.id) ));
        
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
                { this.state.originalLane != undefined && 
                    <LaneModifyView
                        laneObj={this.state.originalLane}
                        handleDone={this.handleDone}
                        goBack={ () => this.props.navigation.goBack() }/>
                }

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

