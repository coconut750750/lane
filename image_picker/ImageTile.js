import React from 'react';
import {
    View,
    Image, ImageBackground,
    TouchableHighlight,
} from 'react-native';

import Layout from '../constants/Layout';

export default class ImageTile extends React.PureComponent {
    constructor(props) {
        super(props);
        this.dimen = Layout.window.width / props.perRow;
    }

    render() {
        let { uri, index, selected, disabled, selectImage } = this.props;
        if (!uri) {
            return null;
        }
        return (
            <TouchableHighlight
                style={{ opacity: selected || disabled ? 0.3 : 1, width: this.dimen, height: this.dimen }}
                underlayColor='transparent'
                onPress={ () => selectImage(index) }
                disabled={disabled}>
                <Image
                    style={{ flex: 1 }}
                    resizeMode='cover'
                    source={{ uri: uri }}/>
            </TouchableHighlight>


        );
    }
}