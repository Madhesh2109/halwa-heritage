document.addEventListener('DOMContentLoaded', () =>
{
    // === Pre-fill remembered email if stored ===
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail) {
    const emailField = document.getElementById('login-email');
    if (emailField) emailField.value = savedEmail;
  }

  // ===== Detect current form elements =====
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');

  // ===== Toggle between Login and Register =====
  if (showRegister && showLogin) {
    showRegister.addEventListener('click', () =>
    {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', () =>
    {
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }

  // ===== Password visibility toggle =====
  document.querySelectorAll('.toggle-password').forEach(btn => 
  {
    btn.addEventListener('click', () => 
    {
      const targetId = btn.getAttribute('data-target');
      const field = document.getElementById(targetId);
      if (field) 
      {
        field.type = field.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // ===== Form handling =====
  const form = document.querySelector('.auth-form');
  if (!form) return;

  // Detect which form is visible
  function getActiveForm() {
    return !loginForm.classList.contains('hidden') ? 'login' : 'register';
  }

  function showError(input, message) {
    if (!input) return;
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains('error-message')) {
      errorEl = document.createElement('div');
      errorEl.classList.add('error-message');
      errorEl.style.color = 'red';
      errorEl.style.fontSize = '0.85rem';
      errorEl.style.marginTop = '4px';
      input.insertAdjacentElement('afterend', errorEl);
    }
    errorEl.textContent = message;
  }

  function clearErrors()
  {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
  }

  function validateEmail(emailVal)
  {
    return /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(emailVal);
  }

  function validatePassword(pwd)
  {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);
  }

  function validateUsername(name)
  {
    return name && name.length >= 3 && /^[a-zA-Z\s]+$/.test(name);
  }

  function validateMobile(mob)
  {
    return /^\d{10}$/.test(mob);
  }

  // ===== Form submit handler =====
  form.addEventListener('submit', async (event) =>
  {
    event.preventDefault();
    clearErrors();

    const activeForm = getActiveForm();

    if (activeForm === 'login')
    {
      const email = document.getElementById('login-email');
      const password = document.getElementById('login-password');
      const rememberMe = document.querySelector('.remember-me input').checked;

      let valid = true;

      if (!validateEmail(email.value.trim()))
      {
        showError(email, 'Enter a valid email address.');
        valid = false;
      }

      if (!validatePassword(password.value.trim()))
      {
        showError(password, 'Password must be at least 8 chars, include uppercase, number & symbol.');
        valid = false;
      }

      if (!valid) return;

      // Save or clear remembered email
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.value.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      try
      {
        const res = await fetch('http://localhost:3000/api/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
          {
            email: email.value.trim(),
            password: password.value.trim()
          })
        });
        const data = await res.json();
        alert(data.message);
        if (data.message === 'Login successful!')
        {
          window.location.href = '/';
        }
      }
      catch (err)
      {
        console.error('Login error:', err);
        alert('Error during login. Please try again.');
      }
    }

    else if (activeForm === 'register')
    {
      const username = document.getElementById('username');
      const mobile = document.getElementById('mobile');
      const email = document.getElementById('register-email');
      const password = document.getElementById('register-password');
      const confirm = document.getElementById('confirm-password');

      let valid = true;

      if (!validateUsername(username.value.trim()))
      {
        showError(username, 'Enter a valid name (letters only, min 3 chars).');
        valid = false;
      }
      if (!validateMobile(mobile.value.trim()))
      {
        showError(mobile, 'Enter a valid 10-digit mobile number.');
        valid = false;
      }
      if (!validateEmail(email.value.trim()))
      {
        showError(email, 'Enter a valid email address.');
        valid = false;
      }
      if (!validatePassword(password.value.trim())) 
      {
        showError(password, 'Password must include uppercase, lowercase, number, and special char.');
        valid = false;
      }
      if (password.value.trim() !== confirm.value.trim())
      {
        showError(confirm, 'Passwords do not match.');
        valid = false;
      }

      if (!valid) return;

      try
      {
        const res = await fetch('http://localhost:3000/api/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
          {
            username: username.value.trim(),
            mobile: mobile.value.trim(),
            email: email.value.trim(),
            password: password.value.trim()
          })
        });
        const data = await res.json();
        alert(data.message);
        if (data.message === 'User registered successfully!')
        {
          // Switch to login form automatically
          registerForm.classList.add('hidden');
          loginForm.classList.remove('hidden');
        }
      }
      catch (err)
      {
        console.error('Register error:', err);
        alert('Error during registration. Please try again.');
      }
    }
  });
});
