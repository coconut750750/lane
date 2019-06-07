import firebase from 'firebase';

import Lane from 'lane/models/Lane';
import { parseFirebasePhotos } from 'lane/models/Photo';

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
            width: photo.width,
            height: photo.height,
            timestamp: photo.timestamp,
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

export async function updateLane(laneId, laneMetadata) {
    await firebase.database()
        .ref(LANES).child(laneId)
        .update(laneMetadata);
}

export async function pushLane(ownerId, laneMetadata) {
    laneMetadata.owner = ownerId;
    return await firebase.database().ref(LANES).push(laneMetadata).key;
}

export async function onLaneUpdate(processLane) {
    const onUserLaneChange = datasnapshot => {
        var lanes = datasnapshot.val();
        if (!lanes) {
            processLane(undefined);
        } else {
            Object.keys(lanes).map( laneId =>
                firebase.database().ref(LANES).child(laneId).on('value', lanesnapshot => {
                    var lane = lanesnapshot.val();
                    if (lane === null) {
                        return;
                    }
                    const laneObj = new Lane(
                        laneId,
                        lane.title,
                        lane.owner,
                        lane.startDate,
                        lane.endDate,
                        lane.color, 
                        parseFirebasePhotos(lane.photos));
                    processLane(laneObj);
                })
            );
        }
    }

    const userid = firebase.auth().currentUser.uid;
    firebase.database().ref(USERS).child(userid).child(LANES).on('value', datasnapshot => onUserLaneChange(datasnapshot));
}

export async function uploadImageAsync(photo, laneId) {
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
        xhr.open('GET', photo.uri, true);
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
            firebase.database().ref(LANES).child(laneId).off('value');
            onComplete();
        });
    });
}