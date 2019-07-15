export const msecondsPerDay = 86400000;

export const months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
];

export function getCurrentMonth() {
    var d = new Date();
    var month = months[d.getMonth()];
    var year = d.getFullYear();
    return `${month} ${year}`;
}

export function timestampToDateString(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0]
}

export function getYear() {
    return new Date().getFullYear();
}

export function getTomorrow(dayInSeconds) {
    return new Date(dayInSeconds + msecondsPerDay)
}

export function dateToString(date) {
    return date.toISOString().split('T')[0];
}

export function stringDateToSeconds(date) {
    return new Date(date).getTime()
}

export function getDaysApart(datestr1, datestr2) {
    var date1 = new Date(datestr1);
    var date2 = new Date(datestr2);

    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / msecondsPerDay));
}