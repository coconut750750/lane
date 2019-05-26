import React, { Component } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
var _ = require('lodash');

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import MasonryList from './masonry/List';
import LaneHeader from './LaneHeader';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0,
        };
    }

    // componentWillReceiveProps(newProps) {
    //     this.scrollToBeginning();
    // }

    onBackLane() {
        if (this.state.currentIndex > 0) {
            this.setState({
                currentIndex: this.state.currentIndex - 1
            });
        }
    }

    onNextLane() {
        if (this.state.currentIndex < this.props.lanes.length - 1) {
            this.setState({
                currentIndex: this.state.currentIndex + 1
            });
        }
    }

    getRotatedLanes(lanes) {
        var rotated = _.cloneDeep(lanes);
        for (var i = 0; i < this.state.currentIndex; i++) {
            rotated.push(rotated.shift());
        }
        return rotated;
    }

    onContentScroll(event) {
        console.log(event);
    }

    getItemLayout(data, index) {
        let length = Layout.window.width;
        return { length: length, offset: length * index, index };
    }

    renderItemHeader(item) {
        return (
            <LaneHeader 
                title={ item.title }
                color={ item.color }
                owner={ item.owner }
                onBackLane={ () => this.onBackLane() }
                onNextLane={ () => this.onNextLane() }
                onEdit={ () => this.props.onEditLane(item) }
                onShare={ () => this.props.onShareLane(item) }
                onDelete={ () => this.props.onDeleteLane(item) }
                style={{
                    transform: this.props.headerTransform,
                    position: 'absolute',
                    top: this.props.calendarHeight
                }}
            />
        );
    }

    renderItem(item, index) {
        return (
            <View style={{ ...styles.page }}>
                <MasonryList
                    uris={ Object.values(item.photos) }
                    width={ Layout.window.width }
                    itemPadding={2}
                    onScroll={ this.props.onScroll }
                    style={{ flex: 1, marginTop: 40 }}
                    containerStyle={{ paddingTop: this.props.calendarHeight }}
                />
                {this.renderItemHeader(item)}
            </View>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    ref={(ref) => { this.flatList = ref; }}
                    style={{ flex: 1 }}
                    horizontal={true}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    pageSize={1}
                    data={ this.getRotatedLanes(this.props.lanes) }
                    getItemLayout={this.getItemLayout}
                    renderItem={ ({item, index}) => this.renderItem(item, index) }
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
        backgroundColor: Colors.background
    },
    page: {
        flex: 1,
        width: Layout.window.width
    },
})