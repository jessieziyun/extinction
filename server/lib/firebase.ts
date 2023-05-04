// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const { firebaseApiKey } = useRuntimeConfig();

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "jessie-expeditio-1682426938641.firebaseapp.com",
  projectId: "jessie-expeditio-1682426938641",
  storageBucket: "jessie-expeditio-1682426938641.appspot.com",
  messagingSenderId: "765858816538",
  appId: "1:765858816538:web:0b0037b80f96b19dc7e7a3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export const firestoreDb = getFirestore(firebaseApp);
