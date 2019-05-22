import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MasonryList from "react-native-masonry-list";
import { Headline } from 'react-native-paper';

import Colors from '../constants/Colors';

export default class LaneContent extends Component {
    constructor(props) {
        super(props);
    }

    onClickPhoto(item, index) {
        console.log(index);
        console.log(item);
    }

    render() {
        return (
            <View style={ styles.container }>
                <View style={ styles.title }>
                    <Headline
                        style={{ color: this.props.color }}>
                        { this.props.title }
                    </Headline>
                </View>
                <MasonryList
                    sorted
                    images={ this.props.images.map( p => { return {'uri': p}; }) }
                    onPressImage={ (item, index) => this.onClickPhoto(item, index) }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        alignItems: 'center',
        justifyContent: 'center',
    }
})