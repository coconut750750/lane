import React, { Component } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native'
import firebase from 'firebase'
import { Agenda } from 'react-native-calendars';
import { FAB, Portal } from 'react-native-paper';

import Colors from '../constants/Colors'
import Layout from '../constants/Layout'

export default class CalendarScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "Home",
            items: {},
            open: false,
        };
    }

    componentWillReceiveProps(newProps) {
        var newView = newProps.navigation.getParam('view');

        if (newView && newView != this.state.view) {
            this.setState({
                view: newView
            });
        }
    }

    render() {
        // <Button
        //    title="Sign Out"
        //    onPress={ () => firebase.auth().signOut() }
        // />
        return (
            <View style={styles.container}>
                <Agenda
                    items={this.state.items}
                    loadItemsForMonth={this.loadItems.bind(this)}
                    selected={'2017-05-16'}
                    renderItem={ (item) => { return (<View style={[styles.item, {height: item.height}]}><Text>{item.name}</Text></View>); } }
                    renderEmptyDate={ () => { return (<View style={styles.emptyDate}><Text>This is empty date!</Text></View>); } }
                    rowHasChanged={ (r1, r2) => { return r1.name !== r2.name; } }
                    // markingType={'period'}
                    // markedDates={{
                    //    '2017-05-08': {textColor: '#666'},
                    //    '2017-05-09': {textColor: '#666'},
                    //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
                    //    '2017-05-21': {startingDay: true, color: 'blue'},
                    //    '2017-05-22': {endingDay: true, color: 'gray'},
                    //    '2017-05-24': {startingDay: true, color: 'gray'},
                    //    '2017-05-25': {color: 'gray'},
                    //    '2017-05-26': {endingDay: true, color: 'gray'}}}
                     // monthFormat={'yyyy'}
                    //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
                    theme={{
                        backgroundColor: Colors.background,
                        calendarBackground: Colors.background,
                        textSectionTitleColor: '#b6c1cd',
                        selectedDayBackgroundColor: Colors.primaryAlt,
                        selectedDayTextColor: 'white',
                        todayTextColor: Colors.primary,
                        dayTextColor: Colors.darkGray,
                        textDisabledColor: Colors.lightGray,
                        dotColor: Colors.primaryAlt,
                        selectedDotColor: '#ffffff',
                        arrowColor: Colors.primaryAlt,
                        monthTextColor: Colors.primary,
                        indicatorColor: Colors.secondary,
                        textDayFontFamily: 'Roboto',
                        textMonthFontFamily: 'Roboto',
                        textDayHeaderFontFamily: 'Roboto',
                        textDayFontWeight: '300',
                        textMonthFontWeight: '300',
                        textDayHeaderFontWeight: '300',
                        textDayFontSize: 16,
                        textMonthFontSize: 20,
                        textDayHeaderFontSize: 16,
                        agendaDayNumColor: Colors.primary,
                        agendaDayTextColor: Colors.primaryAlt,
                        agendaTodayColor: Colors.primary,
                        agendaKnobColor: Colors.primary,
                        'stylesheet.calendar.header': {
                            week: {
                                marginTop: -5,
                                paddingTop: 3,
                                marginBottom: 0,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }
                        },
                        'stylesheet.agenda.main': {
                            knobContainer: {
                                flex: 1,
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                height: 24,
                                bottom: 0,
                                alignItems: 'center',
                            }
                        }
                    }}
                    
                />
                <FAB
                    style={styles.fab}
                    icon="create"
                    onPress={() => console.log('Pressed')}
                />
            </View>
        );
    }

    loadItems(day) {
        setTimeout(() => {
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = this.timeToString(time);
                if (!this.state.items[strTime]) {
                    this.state.items[strTime] = [];
                    const numItems = Math.floor(Math.random() * 5);
                    for (let j = 0; j < numItems; j++) {
                        this.state.items[strTime].push({
                            name: 'Item for ' + strTime,
                            height: Math.max(50, Math.floor(Math.random() * 150))
                        });
                    }
                }
            }

            const newItems = {};
            Object.keys(this.state.items).forEach(key => {newItems[key] = this.state.items[key];});
            this.setState({
                items: newItems
            });
        }, 1000);
    }

     timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
     }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    item: {
        flex: 1,
        borderRadius: 5,
        padding: 5,
        marginRight: 10,
        marginTop: 25,
        marginBottom: 5
    },
    emptyDate: {
        flex: 1,
        height: 15,
        paddingTop: 30
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
})