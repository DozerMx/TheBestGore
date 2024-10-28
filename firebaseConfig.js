// firebaseConfig.js

// Importar las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Para Realtime Database
import { getAuth } from "firebase/auth"; // Para autenticación

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD9Do3nEXf2QQWr4dKzrk2oyr_UB3ByTlE",
  authDomain: "thebestgore-4bd6d.firebaseapp.com",
  projectId: "thebestgore-4bd6d",
  storageBucket: "thebestgore-4bd6d.appspot.com",
  messagingSenderId: "615685617268",
  appId: "1:615685617268:web:63c280e698eeaaf11b0321",
  measurementId: "G-SXYJ04BTPM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar la base de datos y la autenticación
export const database = getDatabase(app);
export const auth = getAuth(app);