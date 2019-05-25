var _ = require('lodash');

let secondsPerDay = 86400000;

function getTomorrow(dayInSeconds) {
    return new Date(dayInSeconds + secondsPerDay)
}

function dateToString(date) {
    return date.toISOString().split('T')[0];
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
    _.forEach(lanes, (lane, laneid) => {
        var start = new Date(lane.startDate).getTime();
        var end = new Date(lane.endDate).getTime();
        var selected = new Date(date).getTime();
        if (selected >= start && selected <= end) {
            selectedLanes.push(laneid);
        }
    });
    return selectedLanes;

    if (!_.isEqual(_.sortBy(selectedLanes), _.sortBy(this.state.selectedLanes))) {
        this.setState({
            selectedLanes: selectedLanes
        });
    }
}