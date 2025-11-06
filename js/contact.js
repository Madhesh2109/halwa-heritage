// contact.js - Clean functional version (no inline styles)

document.addEventListener('DOMContentLoaded', () => {
    attachEventListeners();
    initializeFormValidation();
});

function attachEventListeners() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmission();
        });
    }

    // Add validation on blur
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
    });
}

function initializeFormValidation() {
    const nameInput = document.querySelector('.contact-form input[type="text"]');
    const emailInput = document.querySelector('.contact-form input[type="email"]');
    const messageInput = document.querySelector('.contact-form textarea');

    if (nameInput) nameInput.setAttribute('required', 'true');
    if (emailInput) emailInput.setAttribute('required', 'true');
    if (messageInput) messageInput.setAttribute('required', 'true');
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.type) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            errorMessage = 'Please enter a valid email address';
            break;
        case 'tel':
            if (value) {
                isValid = /^[6-9]\d{9}$/.test(value);
                errorMessage = 'Please enter a valid 10-digit phone number';
            }
            break;
        default:
            if (field.hasAttribute('required')) {
                isValid = value !== '';
                errorMessage = 'This field is required';
            }
    }

    setFieldValidity(field, isValid, errorMessage);
    return isValid;
}

function setFieldValidity(field, isValid, errorMessage) {
    removeError(field);
    if (isValid) {
        field.style.borderColor = '#27ae60';
    } else {
        field.style.borderColor = '#e74c3c';
        showError(field, errorMessage);
    }
}

function showError(field, message) {
    const error = document.createElement('div');
    error.classList.add('field-error');
    error.textContent = message;
    field.parentNode.appendChild(error);
}

function removeError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) existingError.remove();
}

function validateForm() {
    const requiredFields = document.querySelectorAll('.contact-form [required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

async function handleFormSubmission() {
    if (!validateForm()) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }

    const submitBtn = document.querySelector('.contact-form .btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success notification
        showNotification('Message sent successfully! We will get back to you soon.', 'success');

        // Reset form
        document.querySelector('.contact-form form').reset();

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('contact-notification', type);
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
