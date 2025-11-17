/* admin-auth.js */
import { app } from "../../firebase/firebase-config.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { db } from "../../firebase/firebase-config.js";

const auth = getAuth(app);

async function checkAdminRole(user)
{
  if (!user) return false;
  try 
  {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) 
    {
      const data = userDoc.data();
      return data?.role === "admin";
    }
    return false;
  }
  catch (err)
  {
    console.error("Role check failed:", err);
    return false;
  }
}

// Login page logic
if (document.getElementById("loginForm"))
{
  const form = document.getElementById("loginForm");
  const err = document.getElementById("err");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const isAdmin = await checkAdminRole(cred.user);
      if (!isAdmin) {
        await signOut(auth);
        err.textContent = "Not authorized as admin.";
        return;
      }
      // redirect to dashboard
      window.location.href = "admin-dashboard.html";
    } catch (e) {
      console.error(e);
      err.textContent = e.message || "Login failed";
    }
  });
}

// Protect admin pages
onAuthStateChanged(auth, async (user) =>
{
  // if on login page and already admin: forward to dashboard
  if (!document.querySelector(".admin-shell") && user) {
    const isAdmin = await checkAdminRole(user);
    if (isAdmin) {
      window.location.href = "admin-dashboard.html";
    } else {
      await signOut(auth);
    }
  }

  // for all admin pages, ensure admin is logged in
  if (document.querySelector(".admin-shell"))
  {
    const logoutBtn = document.getElementById("logoutBtn");
    const adminEmail = document.getElementById("adminEmail");
    
    if (!user)
    {
      // redirect to login
      window.location.href = "admin-login.html";
      return;
    }
    
    const isAdmin = await checkAdminRole(user);
    
    if (!isAdmin)
    {
      await signOut(auth);
      window.location.href = "admin-login.html";
      return;
    }
    
    if (adminEmail) adminEmail.textContent = user.email;
    // attach logout
    logoutBtn?.addEventListener("click", async (e) =>
    {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "admin-login.html";
    });
    
    document.getElementById("openSite")?.addEventListener("click", (ev) =>
    {
      ev.preventDefault();
      window.open("../index.html", "_blank");
    });
  }
});
