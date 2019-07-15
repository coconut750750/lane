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
                lane={ lane }
                onBackLane={ () => this.props.onBackLane() }
                onNextLane={ () => this.props.onNextLane() }
                onEdit={ () => this.props.onEditLane(lane) }
                onShare={ email => this.props.onShareLane(lane, email) }
                onDelete={ () => this.props.onDeleteLane(lane) }
                onUnsubscribe={ () => this.props.onUnsubscribeLane(lane) }
                style={{
                    transform: this.props.headerTransform,
                    top: this.props.calendarHeight
                }}
            />
        );
    }

    renderLane(lane) {
        const photos = _.orderBy(lane.photos, ['timestamp'], ['asc']);

        return (
            <View style={{ ...styles.page }}>
                { this.renderLaneHeader(lane) }
                <MasonryList
                    id={ lane.id }
                    photos={ photos }
                    width={ Layout.window.width }
                    itemPadding={2}
                    onScroll={ this.props.onScroll }
                    style={{ flex: 1 }}
                    containerStyle={{ paddingTop: this.props.calendarHeight }}
                />
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