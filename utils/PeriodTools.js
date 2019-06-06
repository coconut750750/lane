var _ = require('lodash');
import { convertTimestampToDateString } from 'lane/utils/utils';

let secondsPerDay = 86400000;

function getTomorrow(dayInSeconds) {
    return new Date(dayInSeconds + secondsPerDay)
}

function dateToString(date) {
    return date.toISOString().split('T')[0];
}

export function constructPeriodFromLane(laneObj) {
    return {
        startDate: laneObj.startDate,
        endDate: laneObj.endDate,
        start: new Date(laneObj.startDate).getTime(),
        end: new Date(laneObj.endDate).getTime(),
        color: laneObj.color,
        id: laneObj.id,
        height: -1
    };
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
    var selectedLanes = [];
    _.forEach(lanes, (lane, laneIndex) => {
        var start = new Date(lane.startDate).getTime();
        var end = new Date(lane.endDate).getTime();
        var selected = new Date(date).getTime();
        if (selected >= start && selected <= end) {
            selectedLanes.push(laneIndex);
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