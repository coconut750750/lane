import React from 'react';
import {
  StyleSheet,
  View,
  CameraRoll,
  FlatList,
  Dimensions
} from 'react-native';
import { FileSystem } from 'expo';
import ImageTile from './ImageTile';
import { Button, Text } from 'react-native-paper'
const { width } = Dimensions.get('window')

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
      newSelected[index] = true
    }
    if (!newSelected) newSelected = {};
    this.setState({ selected: newSelected })
  }

  getPhotos = () => {
    let params = { first: 50, mimeTypes: ['image/jpeg'] };
    if (this.state.after) params.after = this.state.after
    if (!this.state.has_next_page) return
    CameraRoll
      .getPhotos(params)
      .then(this.processPhotos)
  }

  processPhotos = (r) => {
    if (this.state.after === r.page_info.end_cursor) return;
    let images = r.edges.map(i=> i.node);
    this.setState({
      photos: [...this.state.photos, ...images],
      after: r.page_info.end_cursor,
      has_next_page: r.page_info.has_next_page
    });
  }

  getItemLayout = (data,index) => {
    let length = width/4;
    return { length, offset: length * index, index }
  }

  prepareCallback() {
    let { selected, photos } = this.state;
    let selectedPhotos = photos.filter((item, index) => {
      return(selected[index])
    });
    let files = selectedPhotos
      .map(photo => FileSystem.getInfoAsync(photo.image.uri, { md5: true, size: true }))
    let callbackResult = Promise
      .all(files)
      .then(imageData=> {
        return imageData.map((data, i) => {
          return {...selectedPhotos[i], ...data}
        })
      })
    this.props.callback(callbackResult)
  }

  renderHeader = () => {
    let selectedCount = Object.keys(this.state.selected).length;
    let headerText = selectedCount + ' Selected';
    return (
      <View style={styles.header}>
        <Button mode="text"
          onPress={() => this.props.callback(Promise.resolve([]))}>
          Exit
        </Button>
        <Text>{headerText}</Text>
        <Button mode="text"
          onPress={() => this.prepareCallback()}>
          Choose
        </Button>
      </View>
    )
  }

  renderImageTile = ({item, index}) => {
    let selected = this.state.selected[index] ? true : false
    let disabled = this.props.disabled.includes(item)
    return(
      <ImageTile
        item={item}
        index={index}
        selected={selected}
        disabled={disabled}
        selectImage={this.selectImage}
      />
    )
  }

  renderImages() {
    return(
      <FlatList
        data={this.state.photos.map(i=> i.image.uri)}
        numColumns={4}
        renderItem={this.renderImageTile}
        keyExtractor={(_,index) => index}
        onEndReached={()=> {this.getPhotos()}}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<Text>Loading...</Text>}
        initialNumToRender={24}
        getItemLayout={this.getItemLayout}
      />
    )
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
    height: 50,
    width: width,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 20
  },
})