import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
import {getFirestore} from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyBxTX1Hk3YkNmNLuVFnPSnwAu4OwWVeHz4",
  authDomain: "messenger-b6a2a.firebaseapp.com",
  projectId: "messenger-b6a2a",
  storageBucket: "messenger-b6a2a.appspot.com",
  messagingSenderId: "466879240688",
  appId: "1:466879240688:web:2d4884eed6e6e50daee535"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)