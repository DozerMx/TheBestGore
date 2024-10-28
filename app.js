// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const homeScreen = document.getElementById('home-screen');
const uploadModal = document.getElementById('upload-modal');
const contentFeed = document.getElementById('content-feed');
const userNick = document.getElementById('user-nick');
const profileMenu = document.getElementById('profile-menu');
const progressBar = document.querySelector('.progress-bar-fill');

// Funciones de navegación
function showWelcomeScreen() {
    welcomeScreen.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.add('hidden');
}

function showLoginForm() {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.add('hidden');
}

function showRegisterForm() {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    homeScreen.classList.add('hidden');
}

function showHomeScreen(user) {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    userNick.textContent = user.displayName || user.email;
}

// Funciones de autenticación
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const nick = document.getElementById('signup-nick').value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({
            displayName: nick
        });
        
        // Crear documento de usuario en Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            nick: nick,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showHomeScreen(userCredential.user);
    } catch (error) {
        console.error('Error en el registro:', error);
        alert(`Error en el registro: ${error.message}`);
    }
});

document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('
