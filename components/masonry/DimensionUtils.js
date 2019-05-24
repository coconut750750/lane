import { Image } from 'react-native';
var _ = require('lodash');

async function getDimensions(uris) {
    let dimensionPromises = uris.map(uri => {
        return new Promise((resolve, reject) => {
            Image.getSize(uri, (width, height) => {
              resolve({ uri, width, height });
            });
          }
        );
    });

    let dimensions = Promise
        .all(dimensionPromises)
        .then(dimensionData => {
            return dimensionData;
        });
    return dimensions;
}

export async function calculateRowDimensions(uris, width, padding) {
    let dimensions = await getDimensions(uris);
    let maxHeight = _.maxBy(dimensions, function(d) { return d.height; }).height;
    var totalWidth = 0;
    _.forEach(dimensions, (d, key) => {
        var scale = maxHeight / d.height;
        var newWidth = d.width * scale;
        dimensions[key].width = newWidth;
        totalWidth += newWidth;
    });

    let widthScale = width / totalWidth;
    let newHeight = maxHeight * widthScale;
    var data = [];
    _.forEach(dimensions, d => {
        data.push({
            uri: d.uri,
            width: d.width * widthScale,
            height: newHeight,
            padding: padding,
        });
    });

    return {
        height: newHeight,
        data: data
    };
}