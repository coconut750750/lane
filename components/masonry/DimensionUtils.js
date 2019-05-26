import { Image } from 'react-native';
var _ = require('lodash');

export function calculateRowDimensions(dimensions, rowWidth) {
    let maxHeight = _.maxBy(dimensions, function(d) { return d.height; }).height;
    var totalWidth = 0;
    _.forEach(dimensions, (d, key) => {
        var scale = maxHeight / d.height;
        var newWidth = d.width * scale;
        dimensions[key].width = newWidth;
        totalWidth += newWidth;
    });

    let widthScale = rowWidth / totalWidth;
    let newHeight = maxHeight * widthScale;
    var data = [];
    _.forEach(dimensions, d => {
        data.push({
            uri: d.uri,
            width: d.width * widthScale,
            height: newHeight,
        });
    });

    return {
        height: newHeight,
        data: data
    };
}