import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableHighlight,
} from 'react-native';
const { width } = Dimensions.get('window')

export default class ImageTile extends React.PureComponent {
    render() {
        let { item, index, selected, disabled, selectImage } = this.props;
        if (!item) return null;
        return (
            <TouchableHighlight
                style={{opacity: selected || disabled ? 0.3 : 1}}
                underlayColor='transparent'
                onPress={() => selectImage(index)}
                disabled={disabled}>
                <Image
                  style={{width: width/4, height: width/4}}
                  source={{uri: item}}/>
            </TouchableHighlight>
        )
    }
}