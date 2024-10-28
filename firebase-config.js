// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD9Do3nEXf2QQWr4dKzrk2oyr_UB3ByTlE",
    authDomain: "thebestgore-4bd6d.firebaseapp.com",
    databaseURL: "https://thebestgore-4bd6d-default-rtdb.firebaseio.com",
    projectId: "thebestgore-4bd6d",
    storageBucket: "thebestgore-4bd6d.appspot.com",
    messagingSenderId: "615685617268",
    appId: "1:615685617268:web:648fb7fcb3e133151b0321",
    measurementId: "G-EP2LYTJ3CE"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencias a los servicios
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Exportar las referencias globalmente
window.auth = auth;
window.db = db;
window.storage = storage;
window.analytics = analytics;

// Verificar estado de autenticación
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            showHomeScreen(user);
        } else {
            showWelcomeScreen();
        }
    });
}

// Exportar función de verificación
window.checkAuth = checkAuth;

// Iniciar verificación al cargar
document.addEventListener('DOMContentLoaded', checkAuth);
