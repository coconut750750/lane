import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import LaneModifyView from 'lane/components/LaneModifyView';

var _ = require('lodash');

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
        console.log(this.originalLane);
    }

    // converts the firebase schema of a photo into a schema that modifyview accepts
    // restructurePhotoDict(photos) {
    //     var newPhotos = [];
    //     _.forEach(photos, (value, key) => {

    //     });
    // }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    handleDone = async (title, photos, color) => {
        console.log(this.originalLane);
        console.log(title);
        console.log(photos);
        console.log(color);
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
                    handleDone={this.handleDone}
                    goBack={ () => this.props.navigation.goBack() }/>
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

