import firebase from 'firebase';

import { firebaseConfig } from '../config'

export default function init() {
    firebase.initializeApp(firebaseConfig)
}
