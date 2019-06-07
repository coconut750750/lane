var _ = require('lodash');

export default class Photo {
    constructor(uri, height, width, md5, timestamp) {
        this.uri = uri;
        this.height = height;
        this.width = width;
        this.md5 = md5;
        this.timestamp = timestamp;
    }
}

export function parseFirebasePhotos(firePhotos) {
    var photos = [];
    _.forEach(firePhotos, (photo, id) => {
        photos.push(new Photo(photo.uri, photo.height, photo.width, id, photo.timestamp));
    });
    return photos;
}