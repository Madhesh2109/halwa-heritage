/* feedbacks-admin.js */
import * as FS from "./admin-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadFeedbacks();
});

async function loadFeedbacks() {
    try {
        const feedbacks = await FS.getFeedbacks();
        displayFeedbacks(feedbacks);
        updateStats(feedbacks);
    } catch (error) {
        console.error("Error loading feedbacks:", error);
        document.getElementById("positiveFeedbacks").innerHTML = "<p class='error'>Error loading feedbacks</p>";
        document.getElementById("neutralFeedbacks").innerHTML = "<p class='error'>Error loading feedbacks</p>";
        document.getElementById("negativeFeedbacks").innerHTML = "<p class='error'>Error loading feedbacks</p>";
    }
}

function displayFeedbacks(feedbacks) {
    const positive = feedbacks.filter(f => f.rating >= 4);
    const neutral = feedbacks.filter(f => f.rating === 3);
    const negative = feedbacks.filter(f => f.rating <= 2);

    // Display Positive Feedbacks
    const positiveContainer = document.getElementById("positiveFeedbacks");
    if (positive.length === 0) {
        positiveContainer.innerHTML = "<p class='muted'>No positive feedbacks yet.</p>";
    } else {
        positiveContainer.innerHTML = positive.map(feedback => `
            <div class="list-item" data-id="${feedback.id}">
                <div class="meta">
                    <div>
                        <div class="rating-stars">${getStars(feedback.rating)}</div>
                        <strong>${feedback.message}</strong>
                        <div class="small muted">
                            ${formatDate(feedback.createdAt)}
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn ghost small delete-feedback" data-id="${feedback.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Display Neutral Feedbacks
    const neutralContainer = document.getElementById("neutralFeedbacks");
    if (neutral.length === 0) {
        neutralContainer.innerHTML = "<p class='muted'>No neutral feedbacks yet.</p>";
    } else {
        neutralContainer.innerHTML = neutral.map(feedback => `
            <div class="list-item" data-id="${feedback.id}">
                <div class="meta">
                    <div>
                        <div class="rating-stars">${getStars(feedback.rating)}</div>
                        <strong>${feedback.message}</strong>
                        <div class="small muted">
                            ${formatDate(feedback.createdAt)}
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn ghost small delete-feedback" data-id="${feedback.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Display Negative Feedbacks
    const negativeContainer = document.getElementById("negativeFeedbacks");
    if (negative.length === 0) {
        negativeContainer.innerHTML = "<p class='muted'>No negative feedbacks yet.</p>";
    } else {
        negativeContainer.innerHTML = negative.map(feedback => `
            <div class="list-item" data-id="${feedback.id}">
                <div class="meta">
                    <div>
                        <div class="rating-stars">${getStars(feedback.rating)}</div>
                        <strong>${feedback.message}</strong>
                        <div class="small muted">
                            ${formatDate(feedback.createdAt)}
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn ghost small delete-feedback" data-id="${feedback.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Attach delete handlers
    attachDeleteHandlers();
}

function updateStats(feedbacks) {
    const total = feedbacks.length;
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    const neutral = feedbacks.filter(f => f.rating === 3).length;
    const negative = feedbacks.filter(f => f.rating <= 2).length;

    document.getElementById("feedbackStats").innerHTML = 
        `Total: ${total} | Positive: ${positive} | Neutral: ${neutral} | Negative: ${negative}`;
}

function getStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '⭐' : '☆';
    }
    return stars;
}

function formatDate(date) {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function attachDeleteHandlers() {
    document.querySelectorAll(".delete-feedback").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            if (!confirm("Are you sure you want to delete this feedback?")) return;
            
            try {
                await FS.deleteFeedback(id);
                await loadFeedbacks(); // Reload the list
            } catch (error) {
                console.error("Error deleting feedback:", error);
                alert("Error deleting feedback. Please try again.");
            }
        });
    });
}
