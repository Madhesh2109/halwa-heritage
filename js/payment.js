// ============================
// PAYMENT.JS – Django API Version
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const paymentModal = document.querySelector(".payment-modal");
  const processingContent = document.querySelector(".processing-content");
  const paymentSuccess = document.querySelector(".payment-success");
  const codSuccess = document.querySelector(".cod-success");
  const codNote = document.querySelector(".cod-note");

  const payOnlineBtn = document.getElementById("pay-online");
  const payCodBtn = document.getElementById("pay-cod");

  // ============================================
  // 💳 Confirm Order with Backend
  // ============================================
  async function confirmOrder(paymentMethod) {
    try {
      const res = await fetch("/api/order/confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });

      if (!res.ok) throw new Error("Order confirmation failed");

      const order = await res.json();
      showPaymentSuccess(paymentMethod, order.id);
    } catch (err) {
      console.error(err);
      showToast("Unable to place your order. Please try again.");
      closeModal();
    }
  }

  // ============================================
  // 💳 Payment Simulation Flow
  // ============================================
  payOnlineBtn?.addEventListener("click", async () => {
    openModal();
    showProcessing();
    await delay(2000);
    await confirmOrder("ONLINE");
  });

  payCodBtn?.addEventListener("click", async () => {
    openModal();
    showProcessing();
    await delay(1500);
    await confirmOrder("COD");
  });

  // ============================================
  // 🪄 UI Handlers
  // ============================================
  function openModal() {
    paymentModal.classList.add("active");
  }

  function closeModal() {
    paymentModal.classList.remove("active");
  }

  function showProcessing() {
    processingContent.style.display = "block";
    paymentSuccess.style.display = "none";
    codSuccess.style.display = "none";
    codNote.style.display = "none";
  }

  function showPaymentSuccess(paymentMethod, orderId) {
    processingContent.style.display = "none";

    if (paymentMethod === "COD") {
      codSuccess.style.display = "block";
      codNote.style.display = "block";
    } else {
      paymentSuccess.style.display = "block";
    }

    setTimeout(() => {
      window.location.href = `order-confirmation.html?order_id=${orderId}`;
    }, 2000);
  }

  // ============================================
  // 🧩 Utility Helpers
  // ============================================
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
});
