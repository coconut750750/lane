import React from 'react';
import {
    StyleSheet,
    View,
    CameraRoll,
    FlatList,
    Dimensions
} from 'react-native';
import { FileSystem } from 'expo';
import { IconButton, Text } from 'react-native-paper';

import Colors from 'lane/constants/Colors';
import Layout from 'lane/constants/Layout';

import ImageTile from './ImageTile';

let numColumns = 2;

export default class ImageBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            selected: {},
            after: null,
            has_next_page: true
        }
    }

    componentDidMount() {
        this.getPhotos()
    }

    selectImage = (index) => {
        let newSelected = {...this.state.selected};
        if (newSelected[index]) {
            delete newSelected[index];
        } else {
            newSelected[index] = true;
        }
        if (!newSelected) {
            newSelected = {};
        }
        this.setState({ selected: newSelected });
    }

    getPhotos = () => {
        let params = { first: 100, mimeTypes: ['image/jpeg'] };
        if (this.state.after) {
            params.after = this.state.after;
        }
        if (!this.state.has_next_page) {
            return;
        }
        CameraRoll
            .getPhotos(params)
            .then(this.processPhotos)
    }

    processPhotos = (r) => {
        if (this.state.after === r.page_info.end_cursor) {
            return;
        }
        let images = r.edges.map(i=> i.node);
        this.setState({
            photos: [...this.state.photos, ...images],
            after: r.page_info.end_cursor,
            has_next_page: r.page_info.has_next_page
        });
    }

    getItemLayout = (data,index) => {
        let length = Layout.window.width / numColumns;
        return { length, offset: length * index, index }
    }

    prepareCallback() {
        let { selected, photos } = this.state;
        let selectedPhotos = photos.filter((item, index) => {
            return selected[index];
        });
        let files = selectedPhotos
            .map(photo => FileSystem.getInfoAsync(photo.image.uri, { md5: true, size: true }));
        
        let photoPromise = Promise
            .all(files)
            .then(imageData=> {
                return imageData.map((data, i) => {
                    return {...selectedPhotos[i], ...data};
                })
            });
        this.props.callback(photoPromise);
    }

    renderHeader() {
        const count = Object.keys(this.state.selected).length;
        let headerText = count+ ' Selected';
        return (
            <View style={styles.header}>
                <IconButton
                    icon="arrow-back"
                    size={24}
                    style={{ flex: 0.1 }}
                    onPress={() => this.props.callback(Promise.resolve([]))}/>
                <Text style={{ flex: 0.8, textAlign: 'center' }}>{headerText}</Text>
                <IconButton
                    icon="done"
                    size={24}
                    style={{ flex: 0.1 }}
                    color={ Colors.primary }
                    onPress={() => this.prepareCallback()}/>
            </View>
        );
    }

    renderImageTile = ({item, index}) => {
        let uri = item.image.uri;
        let selected = this.state.selected[index] ? true : false;
        
        return(
            <ImageTile
                uri={uri}
                index={index}
                selected={selected}
                selectImage={this.selectImage}
                perRow={numColumns}
            />
        );
    }

    renderImages() {
        return(
            <FlatList
                data={this.state.photos}
                numColumns={numColumns}
                renderItem={this.renderImageTile}
                keyExtractor={(item,index) => item.image.uri}
                onEndReached={()=> {this.getPhotos()}}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={<Text>Loading...</Text>}
                initialNumToRender={100}
                getItemLayout={this.getItemLayout}
                removeClippedSubviews={true}
                maxToRenderPerBatch={100}
                windowSize={41}
            />
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderHeader()}
                {this.renderImages()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        width: Layout.window.width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
})