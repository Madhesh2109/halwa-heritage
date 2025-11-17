// contact.js – Feedback Section Version with Firebase
import { db } from "../firebase/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    initStarRating();
    initFeedbackSubmit();
});

// ========================================================
// EMOJI RATING — Hover temporary, Click permanent
// ========================================================
let rating = 0; // Permanent rating

function initStarRating() {
    const stars = document.querySelectorAll(".star");
    const ratingBox = document.querySelector(".rating-box");

    // Temporary highlight while hovering
    ratingBox.addEventListener("mousemove", (event) => {
        if (event.target.classList.contains("star")) {
            let tempValue = parseInt(event.target.dataset.value);
            fillTempRating(tempValue);
        }
    });

    // Reset when leaving box
    ratingBox.addEventListener("mouseleave", () => {
        fillTempRating(0);        // clear all
        fillPermanentRating();    // show clicked rating
    });

    // Click to set permanent rating
    stars.forEach(star => {
        star.addEventListener("click", () => {
            rating = parseInt(star.dataset.value);
            fillPermanentRating();
        });
    });
}

function fillTempRating(limit) {
    const stars = document.querySelectorAll(".star");

    stars.forEach(star => {
        star.classList.remove("active");
        if (parseInt(star.dataset.value) <= limit) {
            star.classList.add("active");
        }
    });
}

function fillPermanentRating() {
    const stars = document.querySelectorAll(".star");

    stars.forEach(star => {
        star.classList.remove("active");
        if (parseInt(star.dataset.value) <= rating) {
            star.classList.add("active");
        }
    });
}

// ========================================================
// FEEDBACK SUBMISSION TO FIREBASE
// ========================================================
function initFeedbackSubmit() {
    const btn = document.getElementById("submitFeedback");
    const textarea = document.querySelector(".feedback-text");

    btn.addEventListener("click", async () => {

        if (rating === 0) {
            showNotification("Please select a rating.", "error");
            return;
        }

        if (textarea.value.trim() === "") {
            showNotification("Please write your feedback.", "error");
            return;
        }

        btn.textContent = "Sending...";
        btn.disabled = true;

        try {
            await addDoc(collection(db, "feedbacks"), {
                rating: rating,
                message: textarea.value.trim(),
                createdAt: serverTimestamp(),
                status: "new"
            });

            showNotification("Thank you! Your feedback has been submitted.", "success");

            textarea.value = "";
            rating = 0;
            fillPermanentRating();

        } catch (error) {
            console.error("Error submitting feedback:", error);
            showNotification("Error submitting feedback. Please try again.", "error");
        } finally {
            btn.textContent = "Submit Feedback";
            btn.disabled = false;
        }
    });
}

// ========================================================
// NOTIFICATION POPUP
// ========================================================
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.classList.add("contact-notification", type);
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("hide");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
