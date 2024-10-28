// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD9Do3nEXf2QQWr4dKzrk2oyr_UB3ByTlE",
    authDomain: "thebestgore-4bd6d.firebaseapp.com",
    databaseURL: "https://thebestgore-4bd6d-default-rtdb.firebaseio.com",
    projectId: "thebestgore-4bd6d",
    storageBucket: "thebestgore-4bd6d.appspot.com",
    messagingSenderId: "615685617268",
    appId: "1:615685617268:web:63c280e698eeaaf11b0321",
    measurementId: "G-SXYJ04BTPM"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencias a los servicios que usaremos
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Función para verificar el estado de autenticación
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuario está autenticado
            showHomeScreen(user);
        } else {
            // Usuario no está autenticado
            showWelcomeScreen();
        }
    });
}

// Exportar las referencias para usar en otros archivos
window.db = db;
window.auth = auth;
window.storage = storage;
window.checkAuth = checkAuth;

// Iniciar la verificación de autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', checkAuth);