import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
var _ = require('lodash');

import MasonryRow from './Row';
import Layout from '../../constants/Layout';
import { calculateRowDimensions } from './DimensionUtils';

export default class MasonryList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [] // {data: {height, padding, width, uri}, height}
        };

        var rowProps = {
            width: props.width,
            padding: props.itemPadding
        }

        var rowCounts = props.rowCounts != undefined ? 
            props.rowCounts : 
            this.generateRowCounts(props.uris.length);

        this.generateRows(props.uris, rowCounts, rowProps);
    }

    generateRowCounts(totalCount) {
        var count = 0;
        var counts = [];
        while (count < totalCount) {
            var delta;
            if (count + 2 > totalCount) {
                delta = 1;
            } else {
                delta = 2;
            }
            counts.push(delta);
            count += delta;
        }

        return counts;
    }

    calculateRowOffsets(rowData) {
        var offset = 0;
        for (var i = 0; i < rowData.length; i++) {
            rowData[i].offset = offset;
            offset += rowData[i].height
        }
    }

    async generateRows(uris, rowCounts, rowProps) {
        var rows = [];
        var uriIndex = 0;
        _.forEach(rowCounts, c => {
            rows.push({
                uris: uris.slice(uriIndex, uriIndex + c),
                ...rowProps
            });
            uriIndex += c;
        });

        await Promise.all(rows.map(rows => 
            calculateRowDimensions(rows.uris, rows.width, rows.padding)
        )).then(rowData => {
            this.calculateRowOffsets(rowData);
            this.setState({
                data: rowData,
            });
        });
    }

    getItemLayout(data, index) {
        return { length: data[index].height, offset: data[index].offset, index };
    }

    renderItem({item, index}) {
        return (
            <View>
                <MasonryRow
                    data={item.data}
                    height={item.height}
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
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => String(index)}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={5}
                    maxToRenderPerBatch={10}
                    windowSize={11}
                />
            </View>
        );
    }
}