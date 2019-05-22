import React, { Component } from 'react';
import { CalendarList } from 'react-native-calendars';
var _ = require('lodash');

import Colors from '../constants/Colors'

export default class LaneCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
            periodMarkings: props.markings,
        };
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            periodMarkings: newProps.markings,
        });
    }

    onDayPress(day) {
        this.props.onDayPress(day.dateString);

        this.setState({
            selected: day.dateString,
        });
    }

    render() {
        return (
            <CalendarList
                monthFormat={'MMMM yyyy'}
                onDayPress={ (day) => { this.onDayPress(day); } }
                markingType={'multi-period'}
                markedDates={ 
                    _.merge(_.cloneDeep(this.state.periodMarkings), {[this.state.selected]: {selected: true, disableTouchEvent: true}})
                }
                horizontal={true}
                pagingEnabled={true}
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
                    textDayFontFamily: 'roboto',
                    textMonthFontFamily: 'roboto-medium',
                    textDayHeaderFontFamily: 'roboto',
                    textDayFontWeight: '300',
                    textMonthFontWeight: '300',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 16,
                }}
                style={{
                    height: 0
                }}
            />
        );
    }
}