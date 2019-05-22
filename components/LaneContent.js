import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import MasonryList from "react-native-masonry-list";
import { Headline } from 'react-native-paper';
var _ = require('lodash');

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lanes: this.readyLanesForMasonry(props.lanes)
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            lanes: this.readyLanesForMasonry(newProps.lanes)
        });
    }

    onClickPhoto(item, index) {
    }

    readyLanesForMasonry(lanes) {
        lanes = _.cloneDeep(lanes);
        lanes.forEach( lane => {
            lane.photos = Object.values(lane.photos).map( p => { return {'uri': p}; });
            return lane;
        });
        return lanes;
    }

    renderItem(item) {
        return (
            <View style={ styles.page }>
                <View style={ styles.title }>
                    <Headline
                        style={{ color: item.color }}>
                        { item.title }
                    </Headline>
                </View>
                <MasonryList
                    sorted
                    images={ item.photos }
                    onPressImage={ (item, index) => this.onClickPhoto(item, index) }
                />
            </View>
        );
    }

    render() {
        return (
            <View style={ styles.container }>
                <FlatList
                    style={ styles.container }
                    horizontal={true}
                    pagingEnabled={true}
                    scrollEnabled={true}
                    pageSize={1}
                    data={this.state.lanes}
                    renderItem={ ({item}) => this.renderItem(item) }
                    keyExtractor={(item, index) => String(index)}
                    showsHorizontalScrollIndicator={false}
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