import React, { Component } from 'react';
import { 
    View,
    Button,
    TextInput,
    StyleSheet,
    TouchableNativeFeedback,
    TouchableWithoutFeedback,
    Modal,
} from 'react-native'
import { 
    IconButton,
    Text,
    List,
    Snackbar
} from 'react-native-paper'
import { Permissions } from 'expo';

import ColorPickerView from 'lane/components/Color/ColorPickerView'
import ImageBrowser from 'lane/components/image_picker/ImageBrowser';
import MasonryList from 'lane/components/masonry/List';

import Colors from 'lane/constants/Colors';
import Layout from 'lane/constants/Layout';

export default class LaneModifyView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: '',
            photos: [],
            imageBrowserOpen: false,
            colorModalOpen: false,

            // snackbar
            snackVisible: false,
            snackMessage: '',
        };
        this.color = Colors.primary;
    }

    alert(message) {
        this.setState({
            snackVisible: true,
            snackMessage: message
        });
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
            this.alert('Sorry! We need permissions to access your photos.');
        }
    }

    imageBrowserCallback = (selectedPhotoPromise) => {
        selectedPhotoPromise.then((photos) => {
            const allPhotos = this.state.photos.concat(photos);
            this.setState({
                imageBrowserOpen: false,
                photos: allPhotos,
            });
        }).catch((e) => console.log(e));
    }

    removePhoto(uri) {
        const photos = this.state.photos;
        const filteredPhotos = photos.filter((item, index) => {
            return item.image.uri != uri;
        });
        this.setState({
            photos: filteredPhotos,
        });
    }

    renderTopNav() {
        return (
            <View style={{ flexDirection: 'row' }}>
                <IconButton
                    icon="arrow-back"
                    size={24}
                    style={{ flex: 0.1 }}
                    onPress={() => this.props.goBack()}/>
                <View style={{ flex: 0.8 }}>
                </View>
                <IconButton
                    icon="done"
                    size={24}
                    style={{ flex: 0.1 }}
                    color={ this.color }
                    onPress={() => this.props.handleDone(this.state.title, this.state.photos, this.color)}/>
            </View>
        );
    }

    renderColorModal() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                onRequestClose={ () => {} }
                visible={ this.state.colorModalOpen }>
                <TouchableWithoutFeedback
                    onPress={ () => this.setState({ colorModalOpen: false }) }>
                    <View style={{ 
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: Colors.backdrop,}}>
                        <ColorPickerView
                            onChange={ color => {
                                this.color = color;
                                this.setState({ colorModalOpen: false });
                            }}
                            color={ this.color }/>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }

    renderImageBrowser() {
        return (
            <ImageBrowser
                callback={ this.imageBrowserCallback }/>
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
            return this.renderImageBrowser();
        }

        return (
            <View style={ styles.container }>
                {this.renderColorModal()}

                {this.renderTopNav()}

                {this.renderTitle()}

                <MasonryList
                    photos={this.state.photos.map(photo => 
                            { return photo.image; }
                        )
                    }
                    width={ Layout.window.width }
                    itemPadding={8}
                    imageStyle={{
                        borderRadius: 8,
                        overflow: 'hidden'
                    }}
                    style={{ flex: 0.85 }}
                    onImagePress={ uri => this.alert('Long press to delete image') }
                    onImageLongPress={ uri => this.removePhoto(uri) }
                />
                
                <View style={{ ...styles.addPhotoSurface, flex: 0.15 }}>
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
})
LaneModifyView.propTypes = {
};
