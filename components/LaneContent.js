import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
var _ = require('lodash');

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import MasonryList from './masonry/List';
import LaneHeader from './LaneHeader';
import { shareLane, deleteLane } from '../backend/Database';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(newProps) {
        this.scrollToBeginning();
    }

    scrollToBeginning() {
        this.flatList.scrollToIndex({animated: true, index: 0});
    }

    getItemLayout(data, index) {
        let length = Layout.window.width;
        return { length: length, offset: length * index, index };
    }

    renderItem(item) {
        return (
            <View style={ styles.page }>
                <LaneHeader 
                    title={ item.title }
                    color={ item.color }
                    onEdit={ () => { console.log('edit'); } }
                    onShare={ () => { console.log('share'); } }
                    onDelete={ () => { deleteLane(item); } }
                />
                <MasonryList
                    uris={ Object.values(item.photos) }
                    width={ Layout.window.width }
                    itemPadding={2}
                    style={{ flex: 1 }}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={ styles.container }>
                <FlatList
                    ref={(ref) => { this.flatList = ref; }}
                    style={{ flex: 1 }}
                    horizontal={true}
                    pagingEnabled={true}
                    scrollEnabled={true}
                    pageSize={1}
                    data={ this.props.lanes }
                    getItemLayout={this.getItemLayout}
                    renderItem={ ({item}) => this.renderItem(item) }
                    keyExtractor={ (item, index) => String(item.id) }
                    showsHorizontalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    page: {
        flex: 1,
        width: Layout.window.width
    },
})