import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Headline } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import MasonryList from './masonry/List';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lanes: this.readyLanesForMasonry(props.lanes)
        };

        this.testUris = Object.values(props.lanes[0].photos);
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            lanes: this.readyLanesForMasonry(newProps.lanes)
        });
        this.scrollToBeginning();
    }

    readyLanesForMasonry(lanes) {
        lanes = _.cloneDeep(lanes);
        lanes.forEach( lane => {
            lane.photos = Object.values(lane.photos);
            return lane;
        });
        return lanes;
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
                <View style={ styles.title }>
                    <Headline
                        style={{ color: item.color, fontFamily: 'roboto-medium' }}>
                        { item.title }
                    </Headline>
                </View>
                <MasonryList
                    uris={ item.photos }
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
                    data={this.state.lanes}
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
    title: {
        alignItems: 'center',
        justifyContent: 'center',
    }
})