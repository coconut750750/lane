import React, { Component } from 'react';
import { View, FlatList, Image } from 'react-native';

var _ = require('lodash');

export default class MasonryRow extends Component {
    constructor(props) {
        super(props);
        this.len = props.data.length;
        this.calculateOffsets(props.data);
    }

    shouldComponentUpdate() {
        return false
    }

    calculateOffsets(data) {
        var offset = 0;
        for (var i = 0; i < data.length; i++) {
            data[i].offset = offset;
            offset += data[i].width
        }
    }

    renderItem({item, index}) {
        return (
            <View style={{ flex: 1, width: item.width, height: item.height, padding: item.padding }}>
                <Image
                    style={{ flex: 1 }}
                    resizeMode='cover'
                    source={{ uri: item.uri }}/>
            </View>
        );
    }

    getItemLayout(data, index) {
        return { length: data[index].width, offset: data[index].offset, index }
    }

    render() {
        return (
            <View style={{ height: this.props.height, width: this.props.width }}>
                <FlatList
                    data={this.props.data}
                    horizontal={true}
                    getItemLayout={this.getItemLayout}
                    renderItem={this.renderItem}
                    keyExtractor={(item,index) => item.uri}
                    initialNumToRender={this.len}
                    removeClippedSubviews={true}
                    windowSize={this.len}
                />
            </View>
        );
    }
}