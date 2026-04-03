import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDA_t6i6UJrd6d3LrW1tXMWym62dpZ4dPs",
  authDomain: "yet-another-project-9fe57.firebaseapp.com",
  projectId: "yet-another-project-9fe57",
  storageBucket: "yet-another-project-9fe57.firebasestorage.app",
  messagingSenderId: "187203229113",
  appId: "1:187203229113:web:3e1eede83e1b2dedb4d268",
  measurementId: "G-5SVRSBWKH5",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
