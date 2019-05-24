import firebase from 'firebase';

export async function retrieveLanes(processLanes, processPeriods) {
    var userid = firebase.auth().currentUser.uid;
    var laneObjs = {};
    var periods = [];
    await firebase.database().ref('users').child(userid).child('lanes').once('value').then(datasnapshot => {
        var lanes = datasnapshot.val();
        if (!lanes) {
            processLanes(laneObjs);
            processPeriods(periods);
        } else {
            var markings = Object.keys(lanes).map( key =>
                firebase.database().ref('lanes').child(lanes[key]).once('value', lanesnapshot => {
                    var laneid = lanesnapshot.key;
                    var lane = lanesnapshot.val();
                    laneObjs[laneid] = {...lane, id: laneid};
                    periods.push({
                        start: new Date(lane.startDate).getTime(),
                        end: new Date(lane.endDate).getTime(),
                        color: lane.color,
                        id: lanes[key],
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

export async function pushLane(ownerId, laneId, laneObj) {
    firebase.database()
        .ref('lanes')
        .child(laneId)
        .set({
            owner: ownerId,
            ...laneObj
    });

    firebase.database()
        .ref('users')
        .child(ownerId)
        .child('lanes')
        .push(laneId);
}

export async function pushPhotoURL(laneId, snapshot) {
    const downloadUrl = await snapshot.ref.getDownloadURL();
    firebase.database()
        .ref('lanes')
        .child(laneId)
        .child('photos')
        .push(downloadUrl);
}

export async function uploadImageAsync(laneid, photo) {
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

    const ref = firebase
        .storage()
        .ref()
        .child(laneid)
        .child(photo.md5);
    const snapshot = await ref.put(blob);
    blob.close();

    const downloadUrl = await snapshot.ref.getDownloadURL();
    firebase.database()
        .ref('lanes')
        .child(laneid)
        .child('photos')
        .push(downloadUrl);
}