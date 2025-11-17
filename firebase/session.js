// firebase/session.js
import { app } from "./firebase-config.js";
import 
{
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import 
{
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const auth = getAuth(app);
const db = getFirestore(app);
const REQUIRE_AUTH = document.body.dataset.protected === "true";

document.addEventListener("DOMContentLoaded", () => 
{
    const loginBtn = document.querySelector(".btn-login");
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profileBtn = document.getElementById("profile-btn");
    const dropdown = document.getElementById("profile-dropdown");
    const nameEl = document.getElementById("profile-name");
    const emailEl = document.getElementById("profile-email");
    const mobileEl = document.getElementById("profile-mobile");
    const editBtn = document.getElementById("edit-btn");
    const updateBtn = document.getElementById("update-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const logoutBtn = document.getElementById("logout-btn");

    async function checkAdminRole(user)
    {
        if (!user) return false;
        try
        {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            return userDoc.exists() && userDoc.data()?.role === "admin";
        }
        catch (err)
        {
            return false;
        }
    }

    onAuthStateChanged(auth, async (user) => 
    {
        if (user) 
        {
            const isAdmin = await checkAdminRole(user);
    
            if (isAdmin)
            {
                // Admin detected on main site - handle differently
                handleAdminOnMainSite();
                return; // Don't show regular user UI
            }

            // Show My Orders link for regular users
            const myOrdersLink = document.getElementById('my-orders-link');
            if (myOrdersLink) myOrdersLink.style.display = "inline-block";

            if (loginBtn) loginBtn.style.display = "none";
            if (profileWrapper) profileWrapper.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "inline-block";

            try
            {
                const docRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(docRef);
                if (userSnap.exists()) 
                {
                    const data = userSnap.data();
                    nameEl.value = data.username || "";
                    emailEl.value = data.email || user.email;
                    mobileEl.value = data.mobile || "";
                }
                else 
                {
                    nameEl.value = "";
                    emailEl.value = user.email;
                    mobileEl.value = "";
                }
            }
            catch (err)
            {
                console.error("Profile load failed:", err);
            }
        }
        else
        {
            // Hide My Orders link when logged out
            const myOrdersLink = document.getElementById('my-orders-link');
            if (myOrdersLink) myOrdersLink.style.display = "none";

            if (loginBtn) loginBtn.style.display = "inline-block";
            if (profileWrapper) profileWrapper.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "none";

            if (REQUIRE_AUTH)
            {
                alert("You must log in first to access this page.");
                window.location.href = "auth.html";
            }
        }
    });

    function handleAdminOnMainSite()
    {
        // Option A: Redirect to admin panel
        if (!window.location.pathname.includes('/admin/'))
        {
            window.location.href = 'admin/admin-dashboard.html';
        }
    }
    
    // --- Toggle dropdown ---
    if (profileBtn && dropdown)
    {
        profileBtn.addEventListener("click", (e) => 
        {
            e.stopPropagation(); // prevent immediate close
            dropdown.classList.toggle("show"); // toggle fade + slide
        });
        // Close when clicking outside
        document.addEventListener("click", (e) => 
        {
            if (!profileWrapper.contains(e.target)) 
            {
                dropdown.classList.remove("show");
            }
        });
    }
    
    // --- Edit Mode ---
    editBtn?.addEventListener("click", () => 
    {
        nameEl.readOnly = false;
        mobileEl.readOnly = false;
        editBtn.style.display = "none";
        updateBtn.style.display = "inline-block";
        cancelBtn.style.display = "inline-block";
    });

    // --- Cancel Edit ---
    cancelBtn?.addEventListener("click", () =>
    {
        nameEl.readOnly = true;
        mobileEl.readOnly = true;
        editBtn.style.display = "inline-block";
        updateBtn.style.display = "none";
        cancelBtn.style.display = "none";
    });

    // --- Update Info ---
    updateBtn?.addEventListener("click", async () =>
    {
        const user = auth.currentUser;
        if (!user) return alert("Not logged in.");

        const newName = nameEl.value.trim();
        const newMobile = mobileEl.value.trim();

        if (!newName || !/^[a-zA-Z\s]{3,}$/.test(newName))
        {
            alert("Enter a valid name (letters only, min 3 chars).");
            return;
        }
        
        if (!/^\d{10}$/.test(newMobile)) 
        {
            alert("Enter a valid 10-digit mobile number.");
            return;
        }

        try
        {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, 
            {
                username: newName,
                mobile: newMobile
            });

            alert("Profile updated successfully!");
            nameEl.readOnly = true;
            mobileEl.readOnly = true;
            editBtn.style.display = "inline-block";
            updateBtn.style.display = "none";
            cancelBtn.style.display = "none";
        }
        catch (err)
        {
            console.error("Update failed:", err);
            alert("Error updating profile. Please try again.");
        }
    });

    // --- Change Email ---
    const changeEmailBtn = document.getElementById("change-email-btn");
    if (changeEmailBtn) 
    {
        changeEmailBtn.addEventListener("click", async () => 
        {
            const user = auth.currentUser;
            if (!user) return alert("You must be logged in.");

            const newEmail = prompt("Enter your new email:");
            if (!newEmail || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) 
            {
                return alert("Please enter a valid email.");
            }

            const password = prompt("Please enter your password to confirm:");
            if (!password) return alert("Password is required for verification.");

            try 
            {
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);
                
                // Update the email
                await updateEmail(user, newEmail);

                // Send verification link to the new email
                await sendEmailVerification(user);
                alert("Verification link sent to your new email. Please verify before logging in again.");

                // Update Firestore copy
                await updateDoc(doc(db, "users", user.uid), { email: newEmail });

                alert("Email updated successfully! Please log in again.");
                await signOut(auth);
                window.location.href = "auth.html";
            }
            catch (err) 
            {
                console.error("Email update failed:", err);
                alert(err.message || "Error updating email.");
            }
        });
    }
    
    // --- Logout ---
    logoutBtn?.addEventListener("click", async () => 
    {
        await signOut(auth);
        alert("Logged out successfully!");
        window.location.reload();
    });
});
