var _ = require('lodash');

export default class Photo {
    constructor(uri, height, width, md5, timestamp) {
        this.uri = uri; // string
        this.height = height; // int
        this.width = width; // int 
        this.md5 = md5; // string
        this.timestamp = timestamp; // int in seconds
    }
}

export function parseFirebasePhotos(firePhotos) {
    var photos = [];
    _.forEach(firePhotos, (photo, id) => {
        photos.push(new Photo(photo.uri, photo.height, photo.width, id, photo.timestamp));
    });
    console.log(photos[0].timestamp)
    return photos;
}