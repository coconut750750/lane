import { getDimensions, calculateRowDimensions } from '../DimensionUtils';

describe('DimensionUtils', () => {
    it('simple get dimensions', () => {
        return getDimensions([uri])
            .then(data => {
                console.log(data);
                expect(data[0].uri).toBe(uri);
                expect(data[0].width).toBe(232);
                expect(data[0].height).toBe(64);
            });
    });
});