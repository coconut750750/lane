import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Animated, FlatList, ViewPropTypes } from 'react-native';
var _ = require('lodash');

import Layout from 'lane/constants/Layout';

import { calculateRowDimensions } from './DimensionUtils';
import MasonryRow from './Row';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class MasonryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [] // {data: {height, width, uri}, height}
        };

        this.cache = {}; // {laneid: data}
    }

    componentDidMount() {
        this.generateRows(this.props.photos);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.id != prevProps.id ) {
            this.generateRows(this.props.photos);
        }
    }

    generateRowCounts(photos) {
        if (photos.length === 2) {
            return [1, 1];
        }
        let minHeight = Layout.window.height * 0.166
        let maxCount = 3;

        var total = photos.length;
        var curr = 0;
        var counts = [];

        while (curr < total) {
            const { currHeight, currWidth } = photos[curr];
            var count;
            var totalScaledWidth = minHeight / currHeight * currWidth;

            for (count = 1; count < maxCount && curr + count < total; count++) {
                const { height, width } = photos[curr + count];
                totalScaledWidth += minHeight / height * width;

                if (totalScaledWidth > Layout.window.width) {
                    break;
                }
            }

            counts.push(count);
            curr += count;
        }

        return counts;
    }

    generateRows(photos) {
        if (!(this.props.id in this.cache)) {
            var rowCounts = this.generateRowCounts(photos);

            var rows = [];
            var uriIndex = 0;
            _.forEach(rowCounts, c => {
                rows.push(photos.slice(uriIndex, uriIndex + c));
                uriIndex += c;
            });

            this.cache[this.props.id] = rows.map(row => calculateRowDimensions(_.cloneDeep(row), this.props.width));
        }

        this.setState({
            data: this.cache[this.props.id],
        });
    }

    getItemLayout(data, index) {
        var offset = data[index].offset;
        if (offset === undefined) {
            offset = 0;
            for (var i = 0; i < data.length; i++) {
                data[i].offset = offset;
                offset += data[i].height;
            }
        }
        return { length: data[index].height, offset: data[index].offset, index };
    }

    keyExtractor(item, index) {
        return item.data.map(p => p.uri).join('') + '' + index;
    }

    renderItem(item, index) {
        return (
            <View>
                <MasonryRow
                    data={item.data}
                    width={this.props.width}
                    height={item.height}
                    padding={this.props.itemPadding}
                    imageStyle={this.props.imageStyle}
                    touchEnabled={this.props.touchEnabled}
                    onImagePress={this.props.onImagePress}
                    onImageLongPress={this.props.onImageLongPress}
                />
            </View>
        );
    }

    render() {
        if (this.state.data === []) {
            return null;
        }
        return (
            <Animated.View style={this.props.style}>
                <AnimatedFlatList
                    contentContainerStyle={this.props.containerStyle}
                    horizontal={false}
                    scrollEnabled={true}
                    pageSize={1}
                    data={this.state.data}
                    getItemLayout={this.getItemLayout}
                    renderItem={ ({item, index}) => this.renderItem(item, index) }
                    keyExtractor={ (item, index) => this.keyExtractor(item, index) }
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                    scrollEventThrottle={1}
                    onScroll={this.props.onScroll}
                />
            </Animated.View>
        );
    }
}

MasonryList.propTypes = {
    photos: PropTypes.arrayOf(
        PropTypes.shape({
            uri: PropTypes.string.isRequired,
            width: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
        })).isRequired,
    width: PropTypes.number.isRequired,
    itemPadding: PropTypes.number,
    onScroll: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
    style: ViewPropTypes.style,
    containerStyle: ViewPropTypes.style,
    imageStyle: ViewPropTypes.style,
    touchEnabled: PropTypes.bool,
    onImagePress: PropTypes.func,
    onImageLongPress: PropTypes.func,
};