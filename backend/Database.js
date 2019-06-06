import firebase from 'firebase';
import { convertTimestampToDateString } from 'lane/utils/utils';

let USERS = 'users';
let LANES = 'lanes';
let SHARED = 'shared';

export async function addLaneToUser(userId, laneId) {
    await firebase.database()
        .ref(USERS).child(userId)
        .child(LANES).child(laneId)
        .set(0);
}

export async function removeLaneFromUser(userId, laneId) {
    await firebase.database()
        .ref(USERS).child(userId)
        .child(LANES).child(laneId)
        .remove();
}

export async function removeUser(userId) {
    await firebase.database()
        .ref(USERS).child(userId)
        .remove();
}

export async function addUserToLane(userId, laneId) {
    await firebase.database()
        .ref(LANES).child(laneId)
        .child(SHARED).child(userId)
        .set(0);
}

export async function removeUserFromLane(userId, laneId) {
    await firebase.database()
        .ref(LANES).child(laneId)
        .child(SHARED).child(userId)
        .remove();
}

export async function removeAllSharedUsers(laneObj) {
    if (laneObj.shared != null) {
        await Promise.all(
            Object.keys(laneObj.shared).map( id => 
                removeLaneFromUser(id, laneObj.id)
            )
        );
    }
}

export async function removeLane(laneId) {
    await firebase.database()
        .ref(LANES).child(laneId)
        .remove();
}

export async function addPhoto(blob, photo, laneId) {
    let photoId = photo.md5;

    const snapshot = await firebase.storage()
        .ref()
        .child(laneId)
        .child(photoId)
        .put(blob);
    blob.close();

    const photoUrl = await snapshot.ref.getDownloadURL();

    await firebase.database()
        .ref(LANES).child(laneId)
        .child('photos').child(photoId)
        .set({
            uri: photoUrl,
            width: photo.image.width,
            height: photo.image.height,
            timestamp: convertTimestampToDateString(photo.timestamp),
        });
}

export async function removePhoto(photoId, laneId) {
    await firebase.storage()
        .ref()
        .child(laneId)
        .child(photoId)
        .delete();

    await firebase.database()
        .ref(LANES).child(laneId)
        .child('photos').child(photoId)
        .remove();
}

export async function removeAllLanePhotos(laneObj) {
    await Promise.all(
        Object.keys(laneObj.photos).map( photoId => 
            firebase.storage().ref().child(laneObj.id).child(photoId).delete()
        )
    );
}

export async function pushLane(ownerId, laneObj) {
    laneObj.owner = ownerId;
    return await firebase.database().ref(LANES).push(laneObj).key;
}

export async function onLaneUpdate(processLanes) {
    var userid = firebase.auth().currentUser.uid;
    firebase.database().ref(USERS).child(userid).child(LANES).on('value', datasnapshot => {
        var lanes = datasnapshot.val();
        var laneObjs = {};

        if (!lanes) {
            processLanes(laneObjs);
        } else {
            var markings = Object.keys(lanes).map( laneId =>
                firebase.database().ref(LANES).child(laneId).once('value', lanesnapshot => {
                    var lane = lanesnapshot.val();
                    laneObjs[laneId] = {...lane, id: laneId};
                })
            );
            
            Promise.all(markings).then(lanes => {
                processLanes(laneObjs);
            });
        }
    });
}

export async function uploadImageAsync(laneId, photo) {
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
            resolve(xhr.response);
        };
        xhr.onerror = function(e) {
            console.log(e);
            reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', photo.image.uri, true);
        xhr.send(null);
    });

    await addPhoto(blob, photo, laneId);
}

export async function shareLane(laneId, otherUserId) {
    await Promise.all([
        addLaneToUser(otherUserId, laneId),
        addUserToLane(otherUserId, laneId)
    ]);
}

export function deleteLane(laneId, onComplete) {
    firebase.database().ref(LANES).child(laneId).once('value', lanesnapshot => {
        var laneObj = lanesnapshot.val();
        laneObj.id = laneId;
        Promise.all([
            removeAllSharedUsers(laneObj),
            removeLaneFromUser(laneObj.owner, laneId),
            removeAllLanePhotos(laneObj),
            removeLane(laneId)
        ]).then(_ => {
            onComplete();
        });
    });
}