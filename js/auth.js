// js/auth.js
import { registerUser, loginUser } from "../firebase/auth.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () =>
{
  // 🔒 Prevent all forms from doing default browser submission (no 405 error)
  document.querySelectorAll("form").forEach(form =>
  {
    form.addEventListener("submit", e => e.preventDefault());
  });

  // === Pre-fill remembered email if stored ===
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    const emailField = document.getElementById("login-email");
    if (emailField) emailField.value = savedEmail;
  }

  // ===== Detect form elements =====
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");

  // ===== Toggle between Login and Register =====
  if (showRegister && showLogin) {
    showRegister.addEventListener("click", () => {
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
    });

    showLogin.addEventListener("click", () => {
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    });
  }

  // ===== Password visibility toggle =====
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const field = document.getElementById(targetId);
      if (field) {
        field.type = field.type === "password" ? "text" : "password";
      }
    });
  });

  // ===== Validation Helpers =====
  function validateEmail(emailVal) {
    return /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailVal);
  }

  function validatePassword(pwd) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);
  }

  function validateUsername(name) {
    return name && name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
  }

  function validateMobile(mob) {
    return /^\d{10}$/.test(mob);
  }

  function showError(input, message) {
    if (!input) return;
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-message")) {
      errorEl = document.createElement("div");
      errorEl.classList.add("error-message");
      errorEl.style.color = "red";
      errorEl.style.fontSize = "0.85rem";
      errorEl.style.marginTop = "4px";
      input.insertAdjacentElement("afterend", errorEl);
    }
    errorEl.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach((el) => el.remove());
  }

  // ===== Form Handling (Firebase Integrated) =====

  // Login + Register submit handlers for both forms
  if (loginForm)
  {
    loginForm.addEventListener("submit", async (event) =>
    {
      event.preventDefault();
      clearErrors();
      await handleLogin();
    });
  }

  if (registerForm)
  {
    registerForm.addEventListener("submit", async (event) =>
    {
      event.preventDefault();
      clearErrors();
      await handleRegister();
    });
  }

  // Login logic
  async function handleLogin() 
  {
    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    const rememberMe = document.querySelector(".remember-me input")?.checked;
    const loader = document.getElementById("page-loader");

    let valid = true;
    if (!validateEmail(email.value.trim())) 
    {
      showError(email, "Enter a valid email address.");
      valid = false;
    }
    if (!validatePassword(password.value.trim())) 
    {
      showError(password, "Password must include uppercase, lowercase, number, and symbol.");
      valid = false;
    }
    if (!valid) return;

    // Remember email locally
    if (rememberMe) localStorage.setItem("rememberedEmail", email.value.trim());
    else localStorage.removeItem("rememberedEmail");

    try
    {
      // SHOW LOADER
      loader.style.display = "flex";
      const user = await loginUser(email.value.trim(), password.value.trim());
      // HIDE LOADER AFTER SOME SMOOTH DELAY
      setTimeout(() => 
      {
        window.location.href = "index.html"; // redirect after login
      }, 300);
    }
    catch (err)
    {
      loader.style.display = "none"; // hide loader on error too
      console.error("Login error:", err);
      alert(err.message || "Error during login. Please try again.");
    }
  }

  // Registration logic
  async function handleRegister()
  {
    const username = document.getElementById("username");
    const mobile = document.getElementById("mobile");
    const email = document.getElementById("register-email");
    const password = document.getElementById("register-password");
    const confirm = document.getElementById("confirm-password");

    let valid = true;
    if (!validateUsername(username.value.trim())) {
      showError(username, "Enter a valid name (letters only, min 3 chars).");
      valid = false;
    }
    if (!validateMobile(mobile.value.trim())) {
      showError(mobile, "Enter a valid 10-digit mobile number.");
      valid = false;
    }
    if (!validateEmail(email.value.trim())) {
      showError(email, "Enter a valid email address.");
      valid = false;
    }
    if (!validatePassword(password.value.trim())) {
      showError(password, "Password must include uppercase, lowercase, number, and special char.");
      valid = false;
    }
    if (password.value.trim() !== confirm.value.trim()) {
      showError(confirm, "Passwords do not match.");
      valid = false;
    }

    if (!valid) return;

    try {
      const user = await registerUser(
        username.value.trim(),
        mobile.value.trim(),
        email.value.trim(),
        password.value.trim()
      );
      alert("User registered successfully!");
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    } catch (err) {
      console.error("Register error:", err);
      alert(err.message || "Error during registration. Please try again.");
    }
  }

  // === Forgot Password Modal Logic (Enhanced with inline messages) ===
  const forgotLink = document.querySelector(".auth-link");
  const modal = document.getElementById("reset-modal");
  const sendBtn = document.getElementById("send-reset-btn");
  const closeBtn = document.getElementById("close-reset-btn");
  const emailInput = document.getElementById("reset-email");
  const messageBox = document.getElementById("reset-message");

  if (forgotLink && modal && sendBtn && closeBtn && messageBox)
  {
    function showMessage(type, text)
    {
      messageBox.textContent = text;
      messageBox.className = `reset-message ${type} show`;
      setTimeout(() => messageBox.classList.remove("show"), 4000);
    }

    forgotLink.addEventListener("click", (e) => 
    {
      e.preventDefault();
      modal.style.display = "flex";
      messageBox.textContent = "";
    });

    sendBtn.addEventListener("click", async () =>
    {
      const email = emailInput.value.trim();
      if (!email || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) 
      {
        showMessage("error", "⚠️ Please enter a valid email address.");
        return;
      }

      try 
      {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        showMessage("success", `✅ Reset link sent to ${email}. Please check your inbox.`);
        emailInput.value = "";

        setTimeout(() => 
        {
          modal.style.display = "none";
          messageBox.textContent = "";
        }, 4000);
      }
      catch (err) 
      {
        console.error("Password reset failed:", err);
        showMessage("error", err.message || "❌ Error sending reset email.");
      }
    });

    closeBtn.addEventListener("click", () =>
    {
      modal.style.display = "none";
      emailInput.value = "";
      messageBox.textContent = "";
    });

    modal.addEventListener("click", (e) => 
    {
      if (e.target === modal) 
      {
        modal.style.display = "none";
        emailInput.value = "";
        messageBox.textContent = "";
      }
    });
  }
});
