import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { View, Animated, ViewPropTypes } from 'react-native';
import { CalendarList } from 'react-native-calendars';
var _ = require('lodash');

import Colors from 'lane/constants/Colors'

export default class LaneCalendar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Animated.View style={{ ...this.props.style, height: this.props.height }}>
                <CalendarList
                    monthFormat={'MMMM yyyy'}
                    onVisibleMonthsChange={ month => this.props.onMonthChange(month) }
                    onDayPress={ day => this.props.onDayPress(day.dateString) }
                    pastScrollRange={60}
                    futureScrollRange={1}
                    markingType={'multi-period'}
                    markedDates={ 
                        _.merge(_.cloneDeep(this.props.markings), {[this.props.selectedDay]: {selected: true, disableTouchEvent: true}})
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
                        monthTextColor: '#00000000',
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
                        height: this.props.height,
                    }}
                    calendarStyle={{
                        height: this.props.height,
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
                    PropTypes.shape({
                        color: PropTypes.oneOf(['transparent']).isRequired
                    })
                ])
            ).isRequired,
        })
    ).isRequired,
    onDayPress: PropTypes.func,
    style: ViewPropTypes.style,
};