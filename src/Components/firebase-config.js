// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUGaZAWCnuaN6lGA1JRSPrL9S2Ju294cE",
  authDomain: "synced-5093f.firebaseapp.com",
  projectId: "synced-5093f",
  storageBucket: "synced-5093f.appspot.com",
  messagingSenderId: "708073373355",
  appId: "1:708073373355:web:6fed5fdd11cfee7b7181ee"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// Export necessary Firebase services
export { auth, app, provider, db, doc, storage }; // Include the 'doc' function in the export
