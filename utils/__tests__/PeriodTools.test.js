import { propagateDatePairs } from '../PeriodTools';

describe('PeriodToolsTest', () => {
    it('propagates simple dates correctly', () => {
        const startDate = '2000-01-02';
        const endDate = '2000-01-02';
        const currYear = 2010;

        const dates = propagateDatePairs(startDate, endDate, currYear);
        expect(dates).toEqual([
            ['2006-01-02', '2006-01-02'],
            ['2007-01-02', '2007-01-02'],
            ['2008-01-02', '2008-01-02'],
            ['2009-01-02', '2009-01-02'],
            ['2010-01-02', '2010-01-02'],
        ]);
    });

    it('propagates year-crossing dates correctly', () => {
        const startDate = '2000-12-30';
        const endDate = '2001-01-02';
        const currYear = 2010;

        const dates = propagateDatePairs(startDate, endDate, currYear);
        expect(dates).toEqual([
            ['2005-12-30', '2006-01-02'],
            ['2006-12-30', '2007-01-02'],
            ['2007-12-30', '2008-01-02'],
            ['2008-12-30', '2009-01-02'],
            ['2009-12-30', '2010-01-02'],
        ]);
    })
});