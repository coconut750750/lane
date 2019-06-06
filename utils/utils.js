export function convertTimestampToDateString(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toISOString().split('T')[0]
}