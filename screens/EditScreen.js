import React, { Component } from 'react';
import { View, Text } from 'react-native';

export default class EditScreen extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            laneObj: this.props.navigation.getParam('laneObj')
        }
        console.log(this.state.laneObj);
    }

    render() {
        return(
            <View>
                <Text>{this.state.laneObj.title}</Text>
            </View>
        );
    }
}