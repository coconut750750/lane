import firebase from 'firebase';

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

export async function removeAllUsersFromLane(laneObj) {
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

export async function addPhoto(blob, photoId, laneId) {
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
        .set(photoUrl);
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

export async function retrieveLanes(processLanes, processPeriods) {
    var userid = firebase.auth().currentUser.uid;
    firebase.database().ref(USERS).child(userid).child(LANES).on('value', datasnapshot => {
        var laneObjs = {};
        var periods = [];
        var lanes = datasnapshot.val();
        if (!lanes) {
            processLanes(laneObjs);
            processPeriods(periods);
        } else {
            var markings = Object.keys(lanes).map( laneId =>
                firebase.database().ref(LANES).child(laneId).once('value', lanesnapshot => {
                    var lane = lanesnapshot.val();
                    laneObjs[laneId] = {...lane, id: laneId};
                    periods.push({
                        start: new Date(lane.startDate).getTime(),
                        end: new Date(lane.endDate).getTime(),
                        color: lane.color,
                        id: laneId,
                        height: -1
                    });
                })
            );
            Promise.all(markings).then(lanes => {
                processLanes(laneObjs);
                processPeriods(periods);
            });
        }
    });
}

export async function uploadImageAsync(laneId, photo) {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
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

    let photoId = photo.md5;
    await addPhoto(blob, photoId, laneId);
}

export async function shareLane(laneid, otherUserId) {
    await Promise.all([
        addLaneToUser(otherUserId, laneId),
        addUserToLane(otherUserId, laneId)
    ]);
}

export async function deleteLane(laneObj) {
    await Promise.all([
        removeAllUsersFromLane(laneObj),
        removeLaneFromUser(laneObj.owner, laneObj.id),
        removeAllLanePhotos(laneObj),
        removeLane(laneObj.id)
    ]);
}