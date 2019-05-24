import React, { Component } from 'react';
import { 
    View,
    Button,
    TextInput,
    StyleSheet,
    TouchableNativeFeedback,
    ActivityIndicator,
    Modal
} from 'react-native'
import { 
    IconButton,
    Text,
    Surface,
    List
} from 'react-native-paper'
import { NavigationEvents } from 'react-navigation';
import { Permissions } from 'expo';
import MasonryList from "react-native-masonry-list";

import md5 from 'md5';

import ImageBrowser from '../components/image_picker/ImageBrowser';
import ColorPalette from '../components/ColorPalette'
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { pushLane, uploadImageAsync } from '../backend/Database';
import { getUserID } from '../backend/Auth';

export default class CreateScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            photos: [],
            imageBrowserOpen: false,
            colorModalOpen: false,
            uploading: false
        };
        this.color = Colors.primary;
    }

    resetState() {
        this.setState({
            title: '',
            photos: [],
            imageBrowserOpen: false,
            colorModalOpen: false,
            uploading: false
        });
        this.color = Colors.primary;
    }

    async handleAddPhotos() {
        let status;
        try {
            status = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        } catch (e) {
            status = {status: 'error', error: e}
        }

        if (status.status === 'granted') {
            this.setState({ imageBrowserOpen: true })
        } else {
            alert('Sorry! We need permissions to access your photos.');
        }
    }

    imageBrowserCallback = (callback) => {
        callback.then((photos) => {
            var allPhotos = this.state.photos.concat(photos);
            this.setState({
                imageBrowserOpen: false,
                photos: allPhotos,
            });
        }).catch((e) => console.log(e))
    }

    getStartEnd() {
        var startTS = Math.min(...this.state.photos.map(p => p.timestamp));
        var endTS = Math.max(...this.state.photos.map(p => p.timestamp));

        var start = new Date(startTS * 1000);
        var end = new Date(endTS * 1000);

        return {start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0]};
    }

    async handleDone() {
        if (this.state.title === '') {
            alert('Please add a title');
            return;
        }
        
        var userId = getUserID();
        var laneId = md5(userId + this.state.title);
        const { start, end } = this.getStartEnd()

        pushLane(userId, laneId, {
                title: this.state.title,
                startDate: start,
                endDate: end,
                color: this.color});

        this.setState({
            uploading: true
        });

        await Promise.all(this.state.photos.map(photo => uploadImageAsync(laneId, photo)));
        this.props.navigation.goBack()
    }

    handleSelectColor(color) {
        this.color = color;
        this.setState({
            colorModalOpen: false
        });
    }

    renderTopNav() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <IconButton
                    icon="arrow-back"
                    size={24}
                    style={{ flex: 0.1 }}
                    onPress={() => this.props.navigation.goBack()}/>
                <View style={{ flex: 0.8 }}>
                </View>
                <IconButton
                    icon="done"
                    size={24}
                    style={{ flex: 0.1 }}
                    color={ this.color }
                    onPress={() => this.handleDone()}/>
            </View>
        );
    }

    renderColorModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={() => {return;}}
                visible={ this.state.colorModalOpen }>

                <View style={ styles.colorModalWrapper }>
                    <Surface style={ styles.colorModal }>
                        <ColorPalette
                            onChange={ color => {
                                this.color = color;
                                this.setState({ colorModalOpen: false });
                            }}
                            style={{ flex: 1 }}
                            value={ this.color }
                            colors={ Colors.laneColors }
                            title={''}/>
                    </Surface>
                </View>
            </Modal>
        );
    }

    renderTitle() {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <TextInput
                    placeholder='Title'
                    value={this.state.title}
                    onChangeText={text => this.setState({ title: text })}
                    style={{ ...styles.titleInput, flex: 0.9, color: this.color }}/>
                <IconButton
                    icon="radio-button-checked"
                    color={ this.color }
                    size={24}
                    style={{ flex: 0.1 }}
                    onPress={() => this.setState({ colorModalOpen: true })}/>
            </View>
        );
    }

    render() {
        if (this.state.imageBrowserOpen) {
            return (<ImageBrowser
                        disabled={ this.state.photos.map(p => p.uri) }
                        callback={ this.imageBrowserCallback }/>
            );
        }
        if (this.state.uploading) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator 
                        size="large"
                        color={Colors.primary} />
                </View>
            );
        }
        return (
            <View style={ styles.container }>
                <NavigationEvents onDidFocus={ () => this.resetState() } />

                {this.renderColorModal()}

                {this.renderTopNav()}

                {this.renderTitle()}

                <MasonryList
                    sorted
                    images={this.state.photos.map(photo => 
                            { return { uri: photo.uri, 
                                       width: photo.width,
                                       height: photo.height};}
                        )
                    }
                    //onPressImage={ (item, index) => this.onClickPhoto(item, index) }
                    style={{ flex: 0.85 }}
                />
                
                <View style={{ ...styles.surface, flex: 0.15 }}>
                    <TouchableNativeFeedback
                        style={{ flex: 1 }}
                        onPress={ () => this.handleAddPhotos() }>
                        <View style={ styles.addPhotoView }>
                            <IconButton
                                icon="add-a-photo"
                                size={24}
                                style={{ flex: 1 }}/>
                            <Text>Add a Photo</Text>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: Layout.window.height,
        width: Layout.window.width,
    },
    titleInput: {
        margin: 16,
        fontSize: 36,
    },
    surface: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        height: 80,
        margin: 48,
        justifyContent: 'center'
    },
    addPhotoView: {
        flex: 1,
        padding: 8,
        height: 160,
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
})