// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD9Do3nEXf2QQWr4dKzrk2oyr_UB3ByTlE",
    authDomain: "thebestgore-4bd6d.firebaseapp.com",
    projectId: "thebestgore-4bd6d",
    storageBucket: "thebestgore-4bd6d.appspot.com",
    messagingSenderId: "615685617268",
    appId: "1:615685617268:web:63c280e698eeaaf11b0321",
    measurementId: "G-SXYJ04BTPM",
    databaseURL: "https://thebestgore-4bd6d-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export services
export { auth, database, storage };
