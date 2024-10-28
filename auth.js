// auth.js

import { auth, database } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';

// Función para registrar un nuevo usuario
export const registerUser = async (email, password, nick) => {
    try {
        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar información adicional en Realtime Database
        await set(ref(database, 'users/' + user.uid), {
            nick: nick,
            email: email,
            profilePic: '',
            createdAt: Date.now()
        });

        // Redirigir a home después de registro exitoso
        window.location.href = 'home.html';
        return true;
    } catch (error) {
        console.error('Error en el registro:', error.message);
        alert('Error en el registro: ' + error.message);
        return false;
    }
};

// Función para iniciar sesión
export const loginUser = async (email, password) => {
    try {
        // Iniciar sesión con Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Obtener datos del usuario
        const userRef = ref(database, 'users/' + userCredential.user.uid);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            // Redirigir a home después de login exitoso
            window.location.href = 'home.html';
            return true;
        } else {
            throw new Error('No se encontraron datos del usuario');
        }
    } catch (error) {
        console.error('Error en el inicio de sesión:', error.message);
        alert('Error en el inicio de sesión: ' + error.message);
        return false;
    }
};

// Función para cerrar sesión
export const logoutUser = async () => {
    try {
        await signOut(auth);
        // Redirigir al index después de cerrar sesión
        window.location.href = 'index.html';
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        alert('Error al cerrar sesión: ' + error.message);
        return false;
    }
};

// Función para verificar el estado de autenticación
export const checkAuth = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                reject(new Error('No hay usuario autenticado'));
            }
        });
    });
};
