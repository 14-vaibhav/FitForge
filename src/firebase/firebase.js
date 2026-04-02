import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBCNOksu4UOTY_PNAfDjtiyA5UDVsNSqjo",
  authDomain: "fitforge-a2be9.firebaseapp.com",
  projectId: "fitforge-a2be9",
  storageBucket: "fitforge-a2be9.firebasestorage.app",
  messagingSenderId: "831590799637",
  appId: "1:831590799637:web:ce88fa277314f13ec0311c",
  measurementId: "G-1XR3M7TLM2"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
