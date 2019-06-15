import React, { Component } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Headline, Menu, IconButton } from 'react-native-paper';

import { getUserID } from 'lane/backend/Auth';

import Colors from 'lane/constants/Colors';

export default class LaneHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            menuVisible: false
        };
    }

    openMenu() {
        this.setState({ menuVisible: true });
    }

    closeMenu() {
        this.setState({ menuVisible: false });
    }

    render() {
        return (
            <Animated.View style={{ ...styles.header, ...this.props.style }}>
                <View style={{ flex: 0.79 }}>
                    <Headline
                        style={{ ...styles.title, color: this.props.color, flex: 1, marginLeft: 16 }}>
                        { this.props.title }
                    </Headline>
                </View>
                <IconButton
                    style={{ flex: 0.1 }}
                    size={24}
                    icon="navigate-before"
                    color={ Colors.darkGray }
                    onPress={ () => this.props.onBackLane() }/>
                <IconButton
                    style={{ flex: 0.1 }}
                    size={24}
                    icon="navigate-next"
                    color={ Colors.darkGray }
                    onPress={ () => this.props.onNextLane() }/>
                <Menu
                    visible={this.state.menuVisible}
                    onDismiss={ () => this.closeMenu() }
                    anchor={ <IconButton
                                style={{ flex: 0.01 }}
                                size={24}
                                icon="more-vert"
                                color={ Colors.darkGray }
                                onPress={ () => this.openMenu() }/> }>
                    <Menu.Item 
                        onPress={ () => { this.props.onEdit(); this.closeMenu(); } }
                        title="Edit" />
                    <Menu.Item
                        onPress={ () => { this.props.onShare(); this.closeMenu(); } }
                        title="Share" />
                    <Menu.Item
                        disabled={this.props.owner != getUserID()}
                        onPress={ () => { this.props.onDelete(); this.closeMenu(); } }
                        title="Delete" />
                </Menu>

            </Animated.View>
        );
    }
}


const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    }, 
    title: {
        fontFamily: 'roboto-medium',
        marginLeft: 8
    },
})