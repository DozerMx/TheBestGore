// Variables globales y elementos DOM
const welcomeScreen = document.getElementById('welcome-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const homeScreen = document.getElementById('home-screen');
const uploadModal = document.getElementById('upload-modal');
const profileModal = document.getElementById('profile-modal');
const contentFeed = document.getElementById('content-feed');
const userNick = document.getElementById('user-nick');
const profileMenu = document.getElementById('profile-menu');
const profileImage = document.getElementById('profile-image');
const contentCardTemplate = document.getElementById('content-card-template');

// Estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        showHomeScreen(user);
        loadContent();
    } else {
        showWelcomeScreen();
    }
});

// Funciones de navegación
function showWelcomeScreen() {
    welcomeScreen.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.add('hidden');
    uploadModal.classList.add('hidden');
    profileModal.classList.add('hidden');
}

function showLoginForm() {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.add('hidden');
    uploadModal.classList.add('hidden');
    profileModal.classList.add('hidden');
}

function showRegisterForm() {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    homeScreen.classList.add('hidden');
    uploadModal.classList.add('hidden');
    profileModal.classList.add('hidden');
}

function showHomeScreen(user) {
    welcomeScreen.classList.add('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    updateUserInfo(user);
}

// Funciones de perfil mejoradas
function toggleProfileMenu() {
    if (profileMenu) {
        profileMenu.classList.toggle('hidden');
    }
}

function updateUserInfo(user) {
    if (user && userNick && profileImage) {
        userNick.textContent = user.displayName || user.email;
        profileImage.src = user.photoURL || '/api/placeholder/32/32';
    }
}

function showProfileSettings() {
    if (!profileModal) return;
    
    profileMenu.classList.add('hidden');
    const user = auth.currentUser;
    
    if (user) {
        document.getElementById('profile-nick').value = user.displayName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-preview').src = user.photoURL || '/api/placeholder/128/128';
        profileModal.classList.remove('hidden');
    }
}

function hideProfileModal() {
    if (profileModal) {
        profileModal.classList.add('hidden');
        document.getElementById('profile-form').reset();
    }
}

// Event Listeners para el perfil
document.getElementById('profile-photo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('profile-preview');
            if (preview) {
                preview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }
});

// Actualización del perfil mejorada
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
        const newNick = document.getElementById('profile-nick').value;
        const newEmail = document.getElementById('profile-email').value;
        const newPassword = document.getElementById('profile-password').value;
        const photoFile = document.getElementById('profile-photo').files[0];

        // Mostrar loading
        Swal.fire({
            title: 'Actualizando perfil...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Actualizar foto si se seleccionó una nueva
        if (photoFile) {
            const photoRef = storage.ref(`profiles/${user.uid}/${photoFile.name}`);
            await photoRef.put(photoFile);
            const photoURL = await photoRef.getDownloadURL();
            await user.updateProfile({ photoURL });
        }

        // Actualizar nick
        if (newNick !== user.displayName) {
            await user.updateProfile({ displayName: newNick });
        }

        // Actualizar email
        if (newEmail !== user.email) {
            await user.updateEmail(newEmail);
        }

        // Actualizar contraseña
        if (newPassword) {
            await user.updatePassword(newPassword);
        }

        // Actualizar Firestore
        await db.collection('users').doc(user.uid).update({
            nick: newNick,
            email: newEmail,
            photoURL: user.photoURL,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        updateUserInfo(user);
        hideProfileModal();

        Swal.fire({
            title: '¡Perfil actualizado!',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
    }
});

// Resto del código se mantiene igual...
[El resto del código continúa igual que en tu versión original]

async function logout() {
    try {
        await auth.signOut();
        showWelcomeScreen();
        Swal.fire({
            title: '¡Hasta pronto!',
            text: 'Has cerrado sesión exitosamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
    }
}

// Funciones de contenido
function showUploadForm() {
    uploadModal.classList.remove('hidden');
}

function hideUploadForm() {
    uploadModal.classList.add('hidden');
    document.getElementById('upload-form').reset();
    document.getElementById('upload-progress').classList.add('hidden');
}

function createContentCard(data, docId) {
    const template = contentCardTemplate.content.cloneNode(true);
    const card = template.querySelector('.content-card');
    
    // Configurar elementos de la tarjeta
    card.querySelector('.user-avatar').src = data.userPhotoURL || '/api/placeholder/32/32';
    card.querySelector('.user-nick').textContent = data.userNick;
    card.querySelector('.upload-date').textContent = data.createdAt?.toDate().toLocaleDateString() || 'Fecha desconocida';
    card.querySelector('.content-title').textContent = data.title;
    card.querySelector('.content-description').textContent = data.description;
    
    // Configurar contenido multimedia
    const mediaContainer = card.querySelector('.content-media');
    if (data.type === 'video') {
        const video = document.createElement('video');
        video.className = 'w-full rounded-lg';
        video.controls = true;
        video.src = data.url;
        mediaContainer.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.className = 'w-full rounded-lg';
        img.src = data.url;
        img.alt = data.title;
        mediaContainer.appendChild(img);
    }

    // Configurar botón de eliminar si el contenido es del usuario actual
    if (data.userId === auth.currentUser?.uid) {
        const deleteButton = card.querySelector('.delete-button');
        deleteButton.classList.remove('hidden');
        deleteButton.querySelector('button').onclick = () => deleteContent(docId);
    }

    // Configurar contador de likes y vistas
    card.querySelector('.like-count').textContent = data.likes || 0;
    card.querySelector('.view-count').textContent = data.views || 0;

    // Configurar botón de like
    const likeButton = card.querySelector('.like-button');
    if (data.likedBy?.includes(auth.currentUser?.uid)) {
        likeButton.querySelector('i').classList.remove('far');
        likeButton.querySelector('i').classList.add('fas');
    }
    likeButton.onclick = () => toggleLike(docId);

    return card;
}

async function toggleLike(docId) {
    try {
        const docRef = db.collection('content').doc(docId);
        const doc = await docRef.get();
        const data = doc.data();
        const userId = auth.currentUser.uid;
        const likedBy = data.likedBy || [];
        const isLiked = likedBy.includes(userId);

        if (isLiked) {
            await docRef.update({
                likes: firebase.firestore.FieldValue.increment(-1),
                likedBy: firebase.firestore.FieldValue.arrayRemove(userId)
            });
        } else {
            await docRef.update({
                likes: firebase.firestore.FieldValue.increment(1),
                likedBy: firebase.firestore.FieldValue.arrayUnion(userId)
            });
        }

        loadContent(); // Recargar contenido para actualizar la UI
    } catch (error) {
        console.error('Error al actualizar like:', error);
    }
}

async function deleteContent(docId) {
    try {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const doc = await db.collection('content').doc(docId).get();
            const data = doc.data();

            // Eliminar archivo de Storage
            if (data.url) {
                const fileRef = storage.refFromURL(data.url);
                await fileRef.delete();
            }

            // Eliminar documento de Firestore
            await db.collection('content').doc(docId).delete();

            await Swal.fire(
                '¡Eliminado!',
                'El contenido ha sido eliminado.',
                'success'
            );

            loadContent(); // Recargar contenido
        }
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
    }
}

// Subida de contenido
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('content-file').files[0];
    const title = document.getElementById('content-title').value;
    const description = document.getElementById('content-description').value;

    if (!file) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor selecciona un archivo',
            icon: 'error'
        });
        return;
    }

    const progressBar = document.getElementById('upload-progress');
    const progressBarFill = progressBar.querySelector('.progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    progressBar.classList.remove('hidden');

    try {
        // Subir archivo a Storage
        const fileRef = storage.ref(`content/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        const uploadTask = fileRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBarFill.style.width = `${progress}%`;
                progressText.textContent = `${Math.round(progress)}%`;
            },
            (error) => {
                throw error;
            },
            async () => {
                // Obtener URL del archivo
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                const user = auth.currentUser;

                // Guardar información en Firestore
                await db.collection('content').add({
                    title: title,
                    description: description,
                    url: downloadURL,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    userId: user.uid,
                    userNick: user.displayName,
                    userPhotoURL: user.photoURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    likes: 0,
                    views: 0,
                    likedBy: []
                });

                hideUploadForm();
                loadContent();
                
                Swal.fire({
                    title: '¡Contenido subido!',
                    text: 'Tu contenido ha sido publicado exitosamente',
                    icon: 'success'
                });
            }
        );
    } catch (error) {
        Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
        });
        progressBar.classList.add('hidden');
    }
});

// Cargar contenido
async function loadContent(filter = 'all') {
    try {
        let query = db.collection('content').orderBy('createdAt', 'desc');
        
        if (filter === 'my') {
            query = query.where('userId', '==', auth.currentUser.uid);
        }

        const snapshot = await query.limit(20).get();
        contentFeed.innerHTML = '';

        snapshot.forEach(doc => {
            const contentCard = createContentCard(doc.data(), doc.id);
            contentFeed.appendChild(contentCard);
        });
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
        Swal.fire({
            title: 'Error',
            text: 'Error al cargar el contenido',
            icon: 'error'
        });
    }
}

function showAllContent() {
    loadContent('all');
}

function showMyContent() {
    loadContent('my');
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
