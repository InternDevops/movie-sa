import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTD2_UNfWSBld5R57tGDncqhuiik5oqJE",
  authDomain: "movietracker-9de53.firebaseapp.com",
  projectId: "movietracker-9de53",
  storageBucket: "movietracker-9de53.appspot.com",
  messagingSenderId: "912852941875",
  appId: "1:912852941875:android:12886ee8b20c355d6bb746",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set authentication persistence to session-based (works best for React Native)
setPersistence(auth, browserSessionPersistence)
  .then(() => console.log("Auth persistence set"))
  .catch((error) => console.error("Error setting auth persistence:", error));

export { auth, db, storage };
export default app;
