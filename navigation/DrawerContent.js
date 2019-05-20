import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, SafeAreaView, Text, View, Button } from 'react-native';
import PropTypes from 'prop-types';

const styles = {
    container: {
        paddingTop: 35,
        flex: 1,
    }, title: {
        fontSize: 48,
        fontWeight: 'bold',
        paddingTop: 35,
        paddingLeft: 20,
    }, links: {
        fontSize: 24,
        paddingTop: 15,
        paddingLeft: 20,
    }
};

class DrawerContent extends Component {
    update = (view) => () => {
        this.props.navigation.closeDrawer();
        this.props.navigation.dispatch(NavigationActions.setParams({
            params: {
                view: view
            },
            key: 'Home',
        }));
    }

    render () {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <Text style={styles.title}>Lane</Text>
                    <Text 
                        style={styles.links}
                        onPress={ this.update('day') }>
                        Day
                    </Text>
                    <Text 
                        style={styles.links}
                        onPress={ this.update('week') }>
                        Week
                    </Text>
                    <Text 
                        style={styles.links}
                        onPress={ this.update('month') }>
                        Month
                    </Text>
                     <Text 
                        style={styles.links}
                        onPress={ this.update('year') }>
                        Year
                    </Text>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

DrawerContent.propTypes = {
    navigation: PropTypes.object
};

export default DrawerContent;
