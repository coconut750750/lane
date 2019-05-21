import React, { Component } from 'react';
import { View, Button, TextInput, StyleSheet, TouchableNativeFeedback } from 'react-native'
import { IconButton, Text } from 'react-native-paper'
import { NavigationEvents } from 'react-navigation';
import ImageBrowser from '../image_picker/ImageBrowser';
import { Permissions } from 'expo';
import firebase from 'firebase'
import MasonryList from "react-native-masonry-list";
import md5 from 'md5';

import Colors from '../constants/Colors'

export default class CreateScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            imageBrowserOpen: false,
            photos: [],
        };
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

    async uploadImageAsync(albumid, photo) {
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
            .child(albumid)
            .child(photo.md5);
        const snapshot = await ref.put(blob);

        blob.close();
        return await snapshot.ref.getDownloadURL();
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
        var albumid = md5(userid + this.state.title);
        const { start, end } = this.getStartEnd()

        this.state.photos.forEach((photo) => {
            this.uploadImageAsync(albumid, photo);
        });

        firebase.database()
            .ref('lanes')
            .child(albumid)
            .set({
                owner: userid,
                title: this.state.title,
                photos: this.state.photos.map(p => p.md5),
                startDate: start,
                endDate: end
        });

        firebase.database()
            .ref('users')
            .child(userid)
            .child('lanes')
            .push(albumid);

        this.props.navigation.goBack()
    }

    render() {
        if (this.state.imageBrowserOpen) {
            return (<ImageBrowser
                        disabled={ this.state.photos.map(p => p.uri) }
                        callback={ this.imageBrowserCallback }/>
            );
        }
        return (
            <View style={styles.container}>
                <NavigationEvents onDidFocus={ () => this.setState({ title: '' }) } />

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
                        onPress={() => this.handleDone()}
                    />
                </View>

                <TextInput
                    placeholder='Title'
                    value={this.state.title}
                    onChangeText={text => this.setState({ title: text })}
                    style={{ ...styles.textInput }}
                />

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
    textInput: {
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
    }
})