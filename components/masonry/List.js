import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
var _ = require('lodash');

import MasonryRow from './Row';
import Layout from '../../constants/Layout';
import { getDimensions, calculateRowDimensions } from './DimensionUtils';

export default class MasonryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [] // {data: {height, width, uri}, height}
        };

        this.generateRows(props.uris);
    }

    generateRowCounts(dimensions) {
        let aspectRange = 0.25;

        var total = dimensions.length;
        var curr = 0;
        var counts = [];

        while (curr < total) {
            let { height, width } = dimensions[curr];
            var aspect =  width / height;
            var delta;
            var max = aspect >= 0.75 && aspect < 1.34 ? 3 : 2

            for (delta = 1; delta < max && curr + delta < total; delta++) {
                let { height, width } = dimensions[curr + delta];
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

    async generateRows(uris) {
        let dimensions = await getDimensions(uris);

        var rowCounts = this.generateRowCounts(dimensions);

        var rows = [];
        var uriIndex = 0;
        _.forEach(rowCounts, c => {
            rows.push(dimensions.slice(uriIndex, uriIndex + c));
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

    renderItem({item, index}) {
        return (
            <View>
                <MasonryRow
                    data={item.data}
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
            <View style={this.props.style}>
                <FlatList
                    horizontal={false}
                    scrollEnabled={true}
                    pageSize={1}
                    data={this.state.data}
                    getItemLayout={this.getItemLayout}
                    renderItem={ (item) => this.renderItem(item) }
                    keyExtractor={ (item, index) => String(index) }
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={21}
                />
            </View>
        );
    }
}