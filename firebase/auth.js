// firebase/auth.js
import { app } from "./firebase-config.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🧠 Register new user
export async function registerUser(username, mobile, email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCred.user;

  // Save extra user data in Firestore
  await setDoc(doc(db, "users", user.uid), {
    username,
    mobile,
    email,
    createdAt: new Date()
  });

  return user;
}

// 🔐 Login existing user
export async function loginUser(email, password) {
  await setPersistence(auth, browserLocalPersistence); // Remember user session
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// 🚪 Logout
export async function logoutUser() {
  await signOut(auth);
}
