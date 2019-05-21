import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MasonryList from "react-native-masonry-list";

import Colors from '../constants/Colors'

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
            <View style={styles.container}>
                <MasonryList
                    sorted
                    images={[
                        { uri: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Red_fox_kits_%2840215161564%29.jpg'},
                        { uri: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fox_study_6.jpg'},
                        { uri: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Vulpes_vulpes_laying_in_snow.jpg'},
                    ]}
                    onPressImage={ (item, index) => this.onClickPhoto(item, index) }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'blue'
    },
})