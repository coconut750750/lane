import React, { Component } from 'react';
import { 
    View,
    Button,
    TextInput,
    StyleSheet,
    TouchableNativeFeedback,
    TouchableHighlight,
    Modal
} from 'react-native'
import { 
    IconButton,
    Text,
    Surface
} from 'react-native-paper'
import { NavigationEvents } from 'react-navigation';
import ImageBrowser from '../image_picker/ImageBrowser';
import { Permissions } from 'expo';
import firebase from 'firebase'
import MasonryList from "react-native-masonry-list";
import ColorPalette from 'react-native-color-palette'

import md5 from 'md5';

import Colors from '../constants/Colors'

export default class CreateScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            photos: [],
            imageBrowserOpen: false,
            colorModalOpen: false
        };
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

    async uploadImageAsync(laneid, photo) {
      // Why are we using XMLHttpRequest? See:
      // https://github.com/expo/expo/issues/2402#issuecomment-443726662
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function() {
                resolve(xhr.response);
            };
            xhr.onerror = function(e) {
                console.log(e);
                reject(new TypeError('Network request failed'));
            };
            xhr.responseType = 'blob';
            xhr.open('GET', photo.uri, true);
            xhr.send(null);
        });

        const ref = firebase
            .storage()
            .ref()
            .child(laneid)
            .child(photo.md5);
        const snapshot = await ref.put(blob);
        blob.close();

        const downloadUrl = await snapshot.ref.getDownloadURL();
        firebase.database()
            .ref('lanes')
            .child(laneid)
            .child('photos')
            .push(downloadUrl);
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
        
        var userid = firebase.auth().currentUser.uid;
        var laneid = md5(userid + this.state.title);
        const { start, end } = this.getStartEnd()

        this.state.photos.forEach(photo => {
            this.uploadImageAsync(laneid, photo)
        });

        firebase.database()
            .ref('lanes')
            .child(laneid)
            .set({
                owner: userid,
                title: this.state.title,
                startDate: start,
                endDate: end,
                color: this.color
        });

        firebase.database()
            .ref('users')
            .child(userid)
            .child('lanes')
            .push(laneid);

        this.props.navigation.goBack()
    }

    handleSelectColor(color) {
        this.color = color;
        this.setState({
            colorModalOpen: false
        });
    }

    render() {
        if (this.state.imageBrowserOpen) {
            return (<ImageBrowser
                        disabled={ this.state.photos.map(p => p.uri) }
                        callback={ this.imageBrowserCallback }/>
            );
        }
        return (
            <View style={ styles.container }>
                <NavigationEvents onDidFocus={ () => this.setState({ title: '' }) } />

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={ this.state.colorModalOpen }>

                    <View style={ styles.colorModalWrapper }>
                        <Surface style={ styles.colorModal }>
                            <ColorPalette
                                onChange={ color => {
                                    this.color = color;
                                    this.setState({ colorModalOpen: false });
                                }}
                                value={ this.color }
                                colors={[Colors.primary, Colors.secondary, '#C0392B', '#E74C3C', '#9B59B6', '#8E44AD', '#2980B9']}
                                icon={ <Text>x</Text> }
                                title={''}/>
                        </Surface>
                    </View>
                </Modal>

                <View style={{ flexDirection: 'row' }}>
                    <IconButton
                        icon="arrow-back"
                        size={24}
                        style={{ flex: 0.1 }}
                        onPress={() => this.props.navigation.goBack()}
                    />
                    <View style={{ flex: 0.8 }}>
                    </View>
                    <IconButton
                        icon="done"
                        size={24}
                        style={{ flex: 0.1 }}
                        color={ Colors.primary }
                        onPress={() => this.handleDone()}/>
                </View>

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

                 <MasonryList
                    sorted
                    images={this.state.photos.map(photo => 
                            { return { uri: photo.uri, 
                                       width: photo.width,
                                       height: photo.height}}
                        )
                    }
                    onPressImage={ (item, index) => this.onClickPhoto(item, index) }
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
        flex: 1
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
        margin: 16,
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
        margin: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        height: 150
    }
})