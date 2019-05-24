import schedulePeriods, { periodsIntersect } from '../PeriodScheduling'

describe('PeriodScheduling', () => {
    it('simple right intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 2, end: 6, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(true);
    });

    it('simple left intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: -1, end: 2, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(true);
    });

    it('simple right no intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 6, end: 8, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(false);
    });

    it('simple left no intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: -3, end: -1, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(false);
    });

    it('edge case left intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: -5, end: 0, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(true);
    });

    it('edge case right intersection', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 5, end: 8, color: '#ffffff', id: 'b', height: -1 };
        expect(periodsIntersect(periodA, periodB)).toBe(true);
    });

    it('simple scheduling height all 0', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 5, end: 6, color: '#ffffff', id: 'b', height: -1 };
        var periodC = { start: 9, end: 12, color: '#ffffff', id: 'c', height: -1 };
        var periods = [periodA, periodB, periodC];
        var schedule = schedulePeriods(periods);
        expect(schedule.length).toBe(periods.length);
        expect(schedule.map( p => p.height )).toEqual([0, 0, 0]);
        expect(schedule.map( p => p.id )).toEqual(['a', 'b', 'c']);
    });

    it('scheduling all intersect', () => {
        var periodA = { start: 0, end: 5, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 2, end: 4, color: '#ffffff', id: 'b', height: -1 };
        var periodC = { start: 1, end: 3, color: '#ffffff', id: 'c', height: -1 };
        var periods = [periodA, periodB, periodC];
        var schedule = schedulePeriods(periods);
        expect(schedule.length).toBe(periods.length);
        expect(schedule.map( p => p.height )).toEqual([0, 1, 2]);
    });

    it('scheduling one intersects two adjacents', () => {
        var periodA = { start: 3, end: 7, color: '#ffffff', id: 'a', height: -1 };
        var periodB = { start: 0, end: 5, color: '#ffffff', id: 'b', height: -1 };
        var periodC = { start: 6, end: 12, color: '#ffffff', id: 'c', height: -1 };
        var periods = [periodA, periodB, periodC];
        var schedule = schedulePeriods(periods);
        expect(schedule.length).toBe(periods.length);
        expect(schedule.map( p => p.height )).toEqual([0, 0, 1]);
        expect(schedule.map( p => p.id )).toEqual(['b', 'c', 'a']);
    });
});