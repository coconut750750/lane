import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, FlatList, Image } from 'react-native';

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
        return (
            <View style={{ flex: 1, width: item.width, height: item.height, padding: this.props.padding }}>
                <Image
                    style={{ flex: 1 }}
                    resizeMode='cover'
                    resizeMethod='resize'
                    source={{ uri: item.uri }}/>
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

MasonryRow.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            uri: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        })).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number
};