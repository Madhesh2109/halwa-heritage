// contact.js – Feedback Section Version

document.addEventListener("DOMContentLoaded", () => {
    initStarRating();
    initFeedbackSubmit();
});

// ===============================
// STAR RATING FUNCTIONALITY
// ===============================
let rating = 0;

function initStarRating() {
    const stars = document.querySelectorAll(".star");

    stars.forEach(star => {
        star.addEventListener("mouseenter", () => {
            highlightStars(star.dataset.value);
        });

        star.addEventListener("click", () => {
            rating = star.dataset.value;
            highlightStars(rating);
        });

        star.addEventListener("mouseleave", () => {
            highlightStars(rating);
        });
    });
}

function highlightStars(limit) {
    const stars = document.querySelectorAll(".star");
    stars.forEach(star => {
        star.classList.remove("active");
        if (star.dataset.value <= limit) {
            star.classList.add("active");
        }
    });
}

// ===============================
// FEEDBACK SUBMISSION
// ===============================
function initFeedbackSubmit() {
    const btn = document.getElementById("submitFeedback");
    const textarea = document.querySelector(".feedback-text");

    btn.addEventListener("click", () => {
        // Rating check
        if (rating === 0) {
            showNotification("Please select a rating.", "error");
            return;
        }

        // Text check
        if (textarea.value.trim() === "") {
            showNotification("Please write your feedback.", "error");
            return;
        }

        btn.textContent = "Sending...";
        btn.disabled = true;

        // Simulated backend delay
        setTimeout(() => {
            showNotification("Thank you! Your feedback has been submitted.", "success");

            // Reset UI
            textarea.value = "";
            rating = 0;
            highlightStars(0);

            btn.textContent = "Submit Feedback";
            btn.disabled = false;

        }, 1500);
    });
}

// ===============================
// NOTIFICATION POPUP
// ===============================
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.classList.add("contact-notification", type);
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add("hide");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
