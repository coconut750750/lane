import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
var _ = require('lodash');

import Colors from 'lane/constants/Colors';
import Layout from 'lane/constants/Layout';

import MasonryList from 'lane/components/masonry/List';

import LaneHeader from './LaneHeader';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0,
        };
    }

    getItemLayout(data, index) {
        let length = Layout.window.width;
        return { length: length, offset: length * index, index };
    }

    renderLaneHeader(lane) {
        return (
            <LaneHeader 
                title={ lane.title }
                color={ lane.color }
                owner={ lane.owner }
                onBackLane={ () => this.props.onBackLane() }
                onNextLane={ () => this.props.onNextLane() }
                onEdit={ () => this.props.onEditLane(lane) }
                onShare={ () => this.props.onShareLane(lane) }
                onDelete={ () => this.props.onDeleteLane(lane) }
                style={{
                    transform: this.props.headerTransform,
                    position: 'absolute',
                    top: this.props.calendarHeight
                }}
            />
        );
    }

    renderLane(lane) {
        const photos = Object.values(lane.photos);
        const sorted = _.orderBy(photos, ['timestamp'], ['asc']);

        return (
            <View style={{ ...styles.page }}>
                <MasonryList
                    photos={ sorted }
                    width={ Layout.window.width }
                    itemPadding={2}
                    onScroll={ this.props.onScroll }
                    style={{ flex: 1, marginTop: 40 }}
                    containerStyle={{ paddingTop: this.props.calendarHeight }}
                />
                {this.renderLaneHeader(lane)}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderLane(this.props.lane)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background
    },
    page: {
        flex: 1,
        width: Layout.window.width
    },
})