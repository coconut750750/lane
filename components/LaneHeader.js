import React, { Component } from 'react';
import { View, StyleSheet, Animated, Modal, TouchableWithoutFeedback } from 'react-native';
import { Headline, Menu, IconButton, Surface } from 'react-native-paper';

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

    renderMenu() {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                onRequestClose={ () => {} }
                visible={ this.state.menuVisible }>
                <TouchableWithoutFeedback
                    onPress={ () => this.closeMenu() }>
                    <View style={{ 
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: Colors.backdrop
                    }}>
                        <Surface style={ styles.surface }>
                            <Menu.Item 
                                onPress={ () => { this.props.onEdit(); this.closeMenu(); } }
                                title="Edit" />
                            <Menu.Item
                                onPress={ () => { this.props.onShare(); this.closeMenu(); } }
                                title="Share" />
                            {
                                this.props.owner == getUserID()
                                ?
                                <Menu.Item
                                    onPress={ () => { this.props.onDelete(); this.closeMenu(); } }
                                    title="Delete" />
                                :
                                <Menu.Item
                                    onPress={ () => { this.props.onUnsubscribe(); this.closeMenu(); } }
                                    title="Unsubscribe" />
                            }
                        </Surface>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }

    render() {
        return (
            <Animated.View style={{ ...styles.header, ...this.props.style }}>
                {this.renderMenu()}

                <View style={{ flex: 0.7 }}>
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
                <IconButton
                    style={{ flex: 0.1 }}
                    size={24}
                    icon="more-vert"
                    color={ Colors.darkGray }
                    onPress={ () => this.openMenu() }/>
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
    surface: {
        padding: 8,
        margin: 24,
        marginBottom: 50,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
})