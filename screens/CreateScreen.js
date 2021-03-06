import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native'
import { Snackbar } from 'react-native-paper';

import { pushLane, uploadImageAsync, addLaneToUser } from 'lane/backend/Database';
import { getUserID } from 'lane/backend/Auth';

import LaneModifyView from 'lane/components/LaneModifyView';
import LaneProgressBar from 'lane/components/LaneProgressBar';

import Colors from 'lane/constants/Colors';
import Strings from 'lane/constants/Strings';

import { getStartEnd } from 'lane/utils/PeriodTools';

export default class CreateScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uploading: false,
            progress: 0,

            // snackbar
            snackVisible: false,
            snackMessage: '',
        };
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
    }

    handleDone = async (title, photos, color) => {
        this.setState({
            uploading: true,
            progress: 0,
            message: Strings.uploading.start,
        });
        
        var userId = getUserID();
        const { start, end } = getStartEnd(photos);

        const laneId = await pushLane(userId, {
            title: title,
            startDate: start,
            endDate: end,
            color: color
        });

        this.eachProgress = 1.0 / photos.length;

        this.setState({ message: Strings.uploading.uploadPhotos });
        await Promise.all(photos.map(async photo => {
            await uploadImageAsync(photo, laneId);
            this.setState( (state, props) => {
                return { progress: state.progress + this.eachProgress };
            });
        }));
        
        this.setState({ message: Strings.uploading.finish })
        await addLaneToUser(userId, laneId);

        this.setState({ 
            uploading: false,
            progress: 0,
        });
        this.props.navigation.goBack();
    }

    renderLoading() {
        return (
            <LaneProgressBar message={this.state.message} progress={this.state.progress} />
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
    titleInput: {
        margin: 16,
        fontSize: 36,
    },
    addPhotoSurface: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        margin: 24,
        justifyContent: 'center'
    },
    addPhotoView: {
        flex: 1,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    colorModalWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.backdrop,
    },
    colorModal: {
        padding: 8,
        margin: 24,
        marginBottom: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        height: 100
    }
});