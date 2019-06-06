import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, FlatList, Image, TouchableOpacity, ViewPropTypes } from 'react-native';

var _ = require('lodash');

export default class MasonryRow extends Component {
    constructor(props) {
        super(props);
        this.len = props.data.length;
    }

    shouldComponentUpdate() {
        return false;
    }

    renderItem({item, index}) {
        const uri = item.uri;
        return (
            <View style={{ flex: 1, width: item.width, height: item.height, padding: this.props.padding }}>
                <TouchableOpacity
                    disabled={ !this.props.touchEnabled }
                    style={{ flex: 1 }}
                    onPress={ () => this.props.onImagePress(uri) }
                    onLongPress={ () => this.props.onImageLongPress(uri) }>
                    <Image
                        style={{ flex: 1, ...this.props.imageStyle }}
                        resizeMode='cover'
                        resizeMethod='resize'
                        source={{ uri: uri }}/>
                </TouchableOpacity>
            </View>
        );
    }

    getItemLayout(data, index) {
        var offset = data[index].offset;
        if (offset === undefined) {
            offset = 0;
            for (var i = 0; i < data.length; i++) {
                data[i].offset = offset;
                offset += data[i].width;
            }
        }
        return { length: data[index].width, offset: data[index].offset, index }
    }

    render() {
        return (
            <View style={{ height: this.props.height, width: this.props.width }}>
                <FlatList
                    data={this.props.data}
                    horizontal={true}
                    getItemLayout={this.getItemLayout}
                    renderItem={ (item) => this.renderItem(item) }
                    keyExtractor={ (item,index) => item.uri }
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={this.len}
                    removeClippedSubviews={true}
                    windowSize={this.len}
                />
            </View>
        );
    }
}

MasonryRow.defaultProps = {
    onImagePress: () => {},
    onImageLongPress: () => {},
    touchEnabled: false,
};


MasonryRow.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            uri: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        })).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number,
    imageStyle: ViewPropTypes.style,
    onImagePress: PropTypes.func,
    onImageLongPress: PropTypes.func,
};