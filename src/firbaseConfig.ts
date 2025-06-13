import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnKbyKQda2tjq9Ke12Q-Gltf1eetbsex4",
  authDomain: "kaalo-msr.firebaseapp.com",
  projectId: "kaalo-msr",
  storageBucket: "kaalo-msr.firebasestorage.app",
  messagingSenderId: "472296308076",
  appId: "1:472296308076:web:70bad9d8e3b113ac77c749"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const storage = getStorage(app);