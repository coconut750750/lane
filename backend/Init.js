import firebase from 'firebase';

import { firebaseConfig } from 'lane/config'

export default function init() {
    firebase.initializeApp(firebaseConfig)
}
