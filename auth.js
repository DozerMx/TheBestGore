// auth.js

import { auth } from './firebaseConfig'; // Importar la configuración de Firebase
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';

// Función para registrar un nuevo usuario
export const registerUser = async (email, password, nick) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar información del usuario en la base de datos
        const db = getDatabase();
        await set(ref(db, 'users/' + user.uid), {
            nick: nick,
            email: email,
            profilePic: '' // Puedes añadir más campos según sea necesario
        });

        console.log('Usuario registrado:', user);
    } catch (error) {
        console.error('Error en el registro:', error.message);
    }
};

// Función para iniciar sesión
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuario logueado:', userCredential.user);
    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
    }
};

// Función para cerrar sesión
export const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log('Usuario desconectado');
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
    }
};