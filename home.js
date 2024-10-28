// Firebase Config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9Do3nEXf2QQWr4dKzrk2oyr_UB3ByTlE",
  authDomain: "thebestgore-4bd6d.firebaseapp.com",
  databaseURL: "https://thebestgore-4bd6d-default-rtdb.firebaseio.com/",
  projectId: "thebestgore-4bd6d",
  storageBucket: "thebestgore-4bd6d.appspot.com",
  messagingSenderId: "615685617268",
  appId: "1:615685617268:web:63c280e698eeaaf11b0321",
  measurementId: "G-SXYJ04BTPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// HTML Elements
const profileIcon = document.getElementById("profile-icon");
const profileMenu = document.getElementById("profile-menu");
const welcomeMessage = document.getElementById("welcome-message");
const signOutButton = document.getElementById("sign-out-button");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-upload");
const progressBar = document.getElementById("upload-progress");
const sidebarToggle = document.getElementById("sidebar-toggle");
const sidebarContent = document.querySelector(".sidebar-content");
const feed = document.getElementById("feed");

// Toggle Profile Menu
profileIcon.addEventListener("click", () => {
  profileMenu.classList.toggle("visible");
});

// Check User Authentication State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Display welcome message with user's Nickname
    const userRef = ref(db, 'users/' + user.uid);
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val();
    welcomeMessage.textContent = `¡Bienvenido, ${userData.nick}!`;

    // Update profile picture if exists
    if (userData.photoURL) {
      profileIcon.src = userData.photoURL;
    }

    // Handle uploading new profile picture
    document.getElementById("update-photo-button").addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (file) {
        const fileRef = storageRef(storage, `profilePictures/${user.uid}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.value = progress;
          },
          (error) => {
            console.error("Error uploading profile picture:", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(user, { photoURL: downloadURL });
            await set(userRef, { ...userData, photoURL: downloadURL }, { merge: true });
            profileIcon.src = downloadURL;
            alert("Foto de perfil actualizada correctamente.");
          }
        );
      }
    });
  } else {
    window.location.href = "index.html"; // Redirect to login page if not logged in
  }
});

// Sign Out
signOutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Error signing out:", error);
    });
});

// Toggle Sidebar
sidebarToggle.addEventListener("click", () => {
  sidebarContent.classList.toggle("expanded");
});

// Upload Multimedia Content
uploadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const file = fileInput.files[0];
  if (file) {
    const fileRef = storageRef(storage, `uploads/${auth.currentUser.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.value = progress;
      },
      (error) => {
        console.error("Error uploading file:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // Save the uploaded file information to Realtime Database
        const uploadRef = ref(db, 'uploads/' + auth.currentUser.uid + '/' + file.name);
        await set(uploadRef, {
          uid: auth.currentUser.uid,
          url: downloadURL,
          type: file.type,
          name: file.name,
          timestamp: new Date().toISOString()
        });

        // Display uploaded file in the feed
        displayUploadedContent(downloadURL, file.type);
      }
    );
  }
});

// Display Uploaded Content
function displayUploadedContent(url, fileType) {
  const contentDiv = document.createElement("div");
  contentDiv.className = fileType.startsWith("image/") ? "photo" : "video";

  if (fileType.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url;
    contentDiv.appendChild(img);
  } else if (fileType.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    contentDiv.appendChild(video);
  }

  feed.appendChild(contentDiv);
}