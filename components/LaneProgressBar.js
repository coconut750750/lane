import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import PropTypes from 'prop-types';

import Colors from 'lane/constants/Colors';
import Layout from 'lane/constants/Layout';

export default class LaneProgressBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>
                    {this.props.message}
                </Text>
                <ProgressBar
                    style={{ width: Layout.window.width }}
                    indeterminate={true}
                    progress={this.props.progress}
                    color={Colors.primary}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

LaneProgressBar.propTypes = {
};

LaneProgressBar.defaultProps = {
};

