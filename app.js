// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const homeScreen = document.getElementById('home-screen');
const uploadModal = document.getElementById('upload-modal');
const contentFeed = document.getElementById('content-feed');
const userNick = document.getElementById('user-nick');
const profileMenu = document.getElementById('profile-menu');

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
        alert(`Error en el registro: ${error.message}`);
    }
});

document.getElementById('signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showHomeScreen(userCredential.user);
    } catch (error) {
        alert(`Error en el inicio de sesión: ${error.message}`);
    }
});

// Funciones del perfil
function toggleProfileMenu() {
    profileMenu.classList.toggle('hidden');
}

async function logout() {
    try {
        await auth.signOut();
        showWelcomeScreen();
    } catch (error) {
        alert(`Error al cerrar sesión: ${error.message}`);
    }
}

// Funciones de subida de contenido
function showUploadForm() {
    uploadModal.classList.remove('hidden');
}

function hideUploadForm() {
    uploadModal.classList.add('hidden');
    document.getElementById('upload-form').reset();
    document.getElementById('upload-progress').classList.add('hidden');
}

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('content-file').files[0];
    const title = document.getElementById('content-title').value;

    if (!file) {
        alert('Por favor selecciona un archivo');
        return;
    }

    const progressBar = document.getElementById('upload-progress');
    const progressText = document.getElementById('progress-text');
    progressBar.classList.remove('hidden');

    try {
        // Subir archivo a Storage
        const fileRef = storage.ref(`content/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = fileRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressText.textContent = `${Math.round(progress)}%`;
            },
            (error) => {
                alert(`Error al subir el archivo: ${error.message}`);
            },
            async () => {
                // Obtener URL del archivo
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();

                // Guardar información en Firestore
                await db.collection('content').add({
                    title: title,
                    url: downloadURL,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    userId: auth.currentUser.uid,
                    userNick: auth.currentUser.displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                hideUploadForm();
                loadContent();
            }
        );
    } catch (error) {
        alert(`Error al subir el contenido: ${error.message}`);
        progressBar.classList.add('hidden');
    }
});

// Cargar contenido
async function loadContent() {
    try {
        const snapshot = await db.collection('content')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        contentFeed.innerHTML = '';

        snapshot.forEach(doc => {
            const data = doc.data();
            const element = document.createElement('div');
            element.className = 'content-card mb-6';
            
            const content = data.type === 'video' ?
                `<video controls class="w-full rounded-lg">
                    <source src="${data.url}" type="video/mp4">
                </video>` :
                `<img src="${data.url}" alt="${data.title}" class="w-full rounded-lg">`;

            element.innerHTML = `
                <div class="p-4">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-lg font-semibold">${data.title}</h3>
                        <span class="text-sm text-gray-500">Por ${data.userNick}</span>
                    </div>
                    ${content}
                </div>
            `;

            contentFeed.appendChild(element);
        });
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
    }
}

// Event Listeners
document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target) && !e.target.matches('[onclick="toggleProfileMenu()"]')) {
        profileMenu.classList.add('hidden');
    }
});

// Iniciar la carga de contenido cuando se muestra la pantalla principal
auth.onAuthStateChanged(user => {
    if (user) {
        loadContent();
    }
});
