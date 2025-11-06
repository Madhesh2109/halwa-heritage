// ======================================
// CHECKOUT-SHIPPING.JS – Django API Version
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shipping-form");
  const continueBtn = document.getElementById("continue-btn");

  // ============================
  // 🧠 Fetch Existing Shipping Info (if any)
  // ============================
  async function fetchShippingInfo() {
    try {
      const res = await fetch("/api/shipping/current/");
      if (res.ok) {
        const data = await res.json();
        populateForm(data);
      }
    } catch (err) {
      console.error("Error fetching shipping info:", err);
    }
  }

  // ============================
  // ✏️ Pre-fill Form Fields
  // ============================
  function populateForm(data) {
    for (const key in data) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = data[key];
    }
  }

  // ============================
  // 🧾 Submit Shipping Info
  // ============================
  async function saveShippingInfo(formData) {
    try {
      const res = await fetch("/api/shipping/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save shipping info");

      // ✅ Redirect to payment/checkout page
      window.location.href = "checkout.html";
    } catch (err) {
      console.error(err);
      showToast("Unable to save shipping info. Please try again.");
    }
  }

  // ============================
  // ✅ Form Validation
  // ============================
  function validateForm() {
    const fields = form.querySelectorAll("input[required], select[required]");
    for (let field of fields) {
      if (!field.value.trim()) {
        showToast(`Please fill out the ${field.name} field`);
        field.focus();
        return false;
      }
    }
    return true;
  }

  // ============================
  // 📦 Continue Button Click
  // ============================
  continueBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = Object.fromEntries(new FormData(form).entries());
    saveShippingInfo(formData);
  });

  // ============================
  // 🔔 Toast Notification
  // ============================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // Load shipping info if available
  fetchShippingInfo();
});
