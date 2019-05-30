import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Animated, ViewPropTypes } from 'react-native';
import { CalendarList } from 'react-native-calendars';
var _ = require('lodash');

import Colors from '../constants/Colors'

export default class LaneCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: '',
        };
    }

    onDayPress(day) {
        this.props.onDayPress(day.dateString);

        this.setState({
            selected: day.dateString,
        });
    }

    unselect() {
        this.setState({
            selected: '',
        });
    }

    render() {
        return (
            <Animated.View style={this.props.style}>
                <CalendarList
                    monthFormat={'MMMM yyyy'}
                    onDayPress={ (day) => { this.onDayPress(day); } }
                    markingType={'multi-period'}
                    markedDates={ 
                        _.merge(_.cloneDeep(this.props.markings), {[this.state.selected]: {selected: true, disableTouchEvent: true}})
                    }
                    horizontal={true}
                    pagingEnabled={true}
                    onScrollEndDrag={this.props.onScrollEndDrag}
                    onScrollBeginDrag={this.props.onScrollBeginDrag}
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
            </Animated.View>
        );
    }
}

LaneCalendar.propTypes = {
    markings: PropTypes.objectOf(
        PropTypes.shape({
            periods: PropTypes.arrayOf(
                PropTypes.oneOfType([
                    PropTypes.shape({
                        startingDay: PropTypes.bool.isRequired,
                        endingDay: PropTypes.bool.isRequired,
                        color: PropTypes.string.isRequired
                    }),
                    PropTypes.oneOf([{ color: 'transparent' }])
                ])
            ).isRequired,
        })
    ).isRequired,
    onDayPress: PropTypes.func,
    style: ViewPropTypes.style,
};