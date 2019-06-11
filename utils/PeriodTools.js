var _ = require('lodash');
import { convertTimestampToDateString, getYear } from 'lane/utils/TimeTools';

export default class Period {
    constructor(startDate, endDate, start, end, color, id, height) {
        this.startDate = startDate; // string
        this.endDate = endDate; // string
        this.start = start; // int
        this.end = end; // int
        this.color = color; // string
        this.id = id; // string
        this.height = height; // int
    }
}

let secondsPerDay = 86400000;

function getTomorrow(dayInSeconds) {
    return new Date(dayInSeconds + secondsPerDay)
}

function dateToString(date) {
    return date.toISOString().split('T')[0];
}

function stringDateToSeconds(date) {
    return new Date(date).getTime()
}

function calculateFixedYearTime(date, fixedYear) {
    const d = new Date(date);
    d.setYear(fixedYear);
    return d.getTime();
}

export function constructPeriodFromLane(laneObj) {
    return new Period(
        laneObj.startDate,
        laneObj.endDate,
        stringDateToSeconds(laneObj.startDate),
        stringDateToSeconds(laneObj.endDate),
        laneObj.color,
        laneObj.id,
        -1
    );
}

export function propagateDatePairs(start, end, currYear) {
    var startDate = new Date(start);
    var startYear = startDate.getFullYear();

    var endDate = new Date(end);
    var endYear = endDate.getFullYear();

    var yearDiff = endYear - startYear;

    var datePairs = [];

    for (var minYear = Math.max(endYear, currYear - 4); minYear <= currYear; minYear++) {
        startDate.setFullYear(minYear - yearDiff);
        endDate.setFullYear(minYear);
        datePairs.push([dateToString(startDate), dateToString(endDate)]);
    }

    return datePairs;
}

export function propagatePeriod(period) {
    const datePairs = propagateDatePairs(period.startDate, period.endDate, getYear());

    const propagated = datePairs.map( (pair, i) => {
        return new Period(
            pair[0],
            pair[1],
            stringDateToSeconds(pair[0]),
            stringDateToSeconds(pair[1]),
            period.color,
            period.id,
            -1
        );
    });
    
    return propagated;
}

export function setupScheduledMarkings(scheduled) {
    var markings = {};

    scheduled.forEach( period => {
        var startDate = period.startDate;
        var curr = startDate;
        var endDate = period.endDate;
        var endNext = dateToString(getTomorrow(period.end));

        while (curr != endNext) {
            if (!(curr in markings)) {
                markings[curr] = {periods:[]}
            }
            while (markings[curr].periods.length < period.height) {
                markings[curr].periods.push({color: 'transparent'})
            }
            markings[curr].periods.push({startingDay: curr === startDate, endingDay: curr === endDate, color: period.color});
            curr = dateToString(getTomorrow(new Date(curr).getTime()));
        }
    });

    return markings;
}

export function getValidLanes(lanes, date) {
    const fixedYear = 2000;
    var selectedLanes = [];
    _.forEach(lanes, (lane, laneIndex) => {
        const start = calculateFixedYearTime(lane.startDate, fixedYear);
        const end = calculateFixedYearTime(lane.endDate, fixedYear);
        const selected = calculateFixedYearTime(date, fixedYear);

        if (start <= end) {
            if (selected >= start && selected <= end) {
                selectedLanes.push(laneIndex);
            }
        } else {
            if (selected <= end || selected >= start) {
                selectedLanes.push(laneIndex);
            }
        }
    });
    return selectedLanes;
}

export function getStartEnd(photos) {
    var startTS = Math.min(...photos.map(p => p.timestamp));
    var endTS = Math.max(...photos.map(p => p.timestamp));

    var start = convertTimestampToDateString(startTS);
    var end = convertTimestampToDateString(endTS);

    return {start: start, end: end};
}