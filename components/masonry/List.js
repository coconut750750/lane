import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Animated, FlatList, ViewPropTypes } from 'react-native';
var _ = require('lodash');

import MasonryRow from './Row';
import Layout from '../../constants/Layout';
import { calculateRowDimensions } from './DimensionUtils';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default class MasonryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [] // {data: {height, width, uri}, height}
        };
    }

    componentDidMount() {
        this.generateRows(this.props.photos);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.photos != prevProps.photos) {
            this.generateRows(this.props.photos);
        }
    }

    generateRowCounts(photoSizeData) {
        if (photoSizeData.length === 2) {
            return [1, 1];
        }
        let aspectRange = 0.25;

        var total = photoSizeData.length;
        var curr = 0;
        var counts = [];

        while (curr < total) {
            let { height, width } = photoSizeData[curr];
            var aspect =  width / height;
            var delta;
            var max = aspect >= 0.75 && aspect < 1.34 ? 3 : 2

            for (delta = 1; delta < max && curr + delta < total; delta++) {
                let { height, width } = photoSizeData[curr + delta];
                var nextAspect = width / height;

                var difference = Math.abs(aspect - nextAspect);
                if (difference > aspectRange) {
                    break;
                }
            }

            counts.push(delta);
            curr += delta;
        }

        return counts;
    }

    generateRows(photos) {
        var rowCounts = this.generateRowCounts(photos);

        var rows = [];
        var uriIndex = 0;
        _.forEach(rowCounts, c => {
            rows.push(photos.slice(uriIndex, uriIndex + c));
            uriIndex += c;
        });

        rowData = rows.map(row => calculateRowDimensions(row, this.props.width));
        this.setState({
            data: rowData,
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
        return item.data.map(p => p.uri).join('');
    }

    renderItem(item, index) {
        return (
            <View>
                <MasonryRow
                    data={item.data}
                    width={this.props.width}
                    height={item.height}
                    padding={this.props.itemPadding}
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
};