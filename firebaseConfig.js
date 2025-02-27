import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  

const firebaseConfig = {
  apiKey: "AIzaSyBTD2_UNfWSBld5R57tGDncqhuiik5oqJE",
  authDomain: "movietracker-9de53.firebaseapp.com",
  projectId: "movietracker-9de53",
  storageBucket: "movietracker-9de53.appspot.com",
  messagingSenderId: "912852941875",
  appId: "1:912852941875:android:12886ee8b20c355d6bb746"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Initialize Firebase Auth

export { auth };  // Export `auth` for authentication usage
export default app;  // Export the Firebase app instance
