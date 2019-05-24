var _ = require('lodash');

export function periodsIntersect(periodA, periodB) {
    return !(periodA.end < periodB.start || periodA.start > periodB.end);
}

export default function schedulePeriods(periods) {
    periods = _.sortBy(periods, ['end']);

    var height = 0;
    var last = -1;
    var complete = 0;
    while (complete < periods.length) {
        for (var i = 0; i < periods.length; i++) {
            if (periods[i].height != -1) {
                continue;
            }
            if (last == -1 || !periodsIntersect(periods[last], periods[i])) {
                periods[i].height = height;
                last = i;
                complete += 1;
            }
        }
        height += 1;
        last = -1;
    }
    
    periods = _.sortBy(periods, ['height', 'start']);
    return periods;
}