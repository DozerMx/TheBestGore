// home.js

import { auth, database, storage } from './firebaseConfig.js';
import { ref as dbRef, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { logoutUser } from './auth.js';

// Verificar autenticación al cargar la página
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        window.location.href = 'index.html';
        return;
    }

    try {
        // Obtener datos del usuario
        const userSnapshot = await get(dbRef(database, `users/${user.uid}`));
        if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            
            // Actualizar UI con datos del usuario
            document.getElementById('welcome-message').textContent = `Bienvenido, ${userData.nick}!`;
            if (userData.profilePic) {
                document.getElementById('profile-pic').src = userData.profilePic;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
});

// Manejar cierre de sesión
document.getElementById('logout-button')?.addEventListener('click', async () => {
    await logoutUser();
});

// Función para subir foto de perfil
export const uploadProfilePic = async (file) => {
    const user = auth.currentUser;
    if (!user || !file) return;

    try {
        // Crear referencia para la imagen
        const imageRef = storageRef(storage, `profile-pics/${user.uid}`);
        
        // Subir archivo
        await uploadBytes(imageRef, file);
        
        // Obtener URL de descarga
        const downloadURL = await getDownloadURL(imageRef);
        
        // Actualizar perfil del usuario
        await update(dbRef(database, `users/${user.uid}`), {
            profilePic: downloadURL
        });

        // Actualizar imagen en la UI
        document.getElementById('profile-pic').src = downloadURL;
        
        alert('Foto de perfil actualizada exitosamente');
    } catch (error) {
        console.error('Error al subir la foto de perfil:', error);
        alert('Error al subir la foto de perfil');
    }
};

// Función para editar nick
export const editNick = async (newNick) => {
    const user = auth.currentUser;
    if (!user || !newNick) return;

    try {
        await update(dbRef(database, `users/${user.uid}`), {
            nick: newNick
        });
        
        document.getElementById('welcome-message').textContent = `Bienvenido, ${newNick}!`;
        alert('Nick actualizado exitosamente');
    } catch (error) {
        console.error('Error al actualizar el nick:', error);
        alert('Error al actualizar el nick');
    }
};

// Funciones de UI
window.toggleProfileMenu = () => {
    const menu = document.getElementById('profile-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window.toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar-content');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
};

// Exportar funciones que necesitan ser accesibles desde el HTML
window.uploadProfilePic = uploadProfilePic;
window.editNick = editNick;
