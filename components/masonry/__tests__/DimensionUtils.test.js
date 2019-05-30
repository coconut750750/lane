import { calculateRowDimensions } from '../DimensionUtils';

describe('DimensionUtils', () => {
    describe('calculateRowDimensions', () => {
        let rowWidth = 100;

        function execute(dimensions, rowWidth, expectedWidths, expectedHeight) {
            var photoData = [];
            var expectedData = [];
            for (var i in dimensions) {
                var d = dimensions[i];
                var w = expectedWidths[i];
                photoData.push({ uri: 'uri', width: d[0], height: d[1] });
                expectedData.push({ uri: 'uri', width: w, height: expectedHeight });
            }
            expect(calculateRowDimensions(photoData, rowWidth))
                .toEqual({height: expectedHeight, data: expectedData});
        }

        it('single square item calculate row dimensions', () => {
            execute([[50, 50]], rowWidth, [100], 100);
            execute([[100, 100]], rowWidth, [100], 100);
            execute([[500, 500]], rowWidth, [100], 100);
        });

        it('single rectangle item calculate row dimensions', () => {
            execute([[50, 100]], rowWidth, [100], 200);
            execute([[100, 50]], rowWidth, [100], 50);
        });

        it('double square item calculate row dimensions', () => {
            execute([[50, 50], [50, 50]], rowWidth, [50, 50], 50);
            execute([[50, 50], [150, 150]], rowWidth, [50, 50], 50);
            execute([[150, 150], [50, 50]], rowWidth, [50, 50], 50);
        });

        it('double rectangle item calculate row dimensions', () => {
            execute([[50, 100], [50, 100]], rowWidth, [50, 50], 100);
            execute([[50, 100], [50, 300]], rowWidth, [75, 25], 150);

            execute([[200, 100], [200, 100]], rowWidth, [50, 50], 25);
            execute([[200, 100], [800, 100]], rowWidth, [20, 80], 10);
        });
    });
});