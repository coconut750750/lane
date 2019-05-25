import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Headline, Menu, IconButton } from 'react-native-paper';

import Colors from '../constants/Colors';

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
            <View style={ styles.header }>
                <Headline
                    style={{ ...styles.title, color: this.props.color, flex: 0.95 }}>
                    { this.props.title }
                </Headline>
                <Menu
                    visible={this.state.menuVisible}
                    onDismiss={ () => this.closeMenu() }
                    anchor={ <IconButton
                                style={{ flex: 0.05 }}
                                icon="more-vert"
                                color={ Colors.lightGray }
                                onPress={ () => this.openMenu() }/> }>
                    <Menu.Item onPress={ () => { this.props.onEdit(); this.closeMenu(); } } title="Edit" />
                    <Menu.Item onPress={ () => { this.props.onShare(); this.closeMenu(); } } title="Share" />
                    <Menu.Item onPress={ () => { this.props.onDelete(); this.closeMenu(); } } title="Delete" />
              </Menu>
            </View>
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