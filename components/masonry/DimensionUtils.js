import { Image } from 'react-native';
var _ = require('lodash');

export function calculateRowDimensions(photoSizeData, rowWidth) {
    let maxHeight = _.maxBy(photoSizeData, function(d) { return d.height; }).height;
    var totalWidth = 0;
    _.forEach(photoSizeData, (d, key) => {
        var scale = maxHeight / d.height;
        var newWidth = d.width * scale;
        photoSizeData[key].width = newWidth;
        totalWidth += newWidth;
    });

    let widthScale = rowWidth / totalWidth;
    let newHeight = maxHeight * widthScale;
    var data = [];
    _.forEach(photoSizeData, d => {
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