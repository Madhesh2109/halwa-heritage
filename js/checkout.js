// ============================
// CHECKOUT.JS – Django API Version
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const orderSummary = document.getElementById("order-summary");
  const totalElement = document.getElementById("order-total");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const emptyMessage = document.getElementById("empty-message");

  let cart = [];

  // ============================
  // 🧠 Fetch Cart Items from API
  // ============================
  async function fetchCart() {
    try {
      const res = await fetch("/api/cart/");
      if (!res.ok) throw new Error("Failed to load cart");
      cart = await res.json();
      renderOrderSummary();
    } catch (err) {
      console.error(err);
      showToast("Unable to load your cart. Please try again.");
    }
  }

  // ============================
  // 🧱 Render Order Summary
  // ============================
  function renderOrderSummary() {
    if (!cart || cart.length === 0) {
      orderSummary.innerHTML = "";
      emptyMessage.style.display = "block";
      totalElement.textContent = "₹0";
      return;
    }

    emptyMessage.style.display = "none";

    orderSummary.innerHTML = cart
      .map(
        (item) => `
      <div class="summary-item">
        <div class="item-details">
          <h3>${item.name}</h3>
          <p>₹${item.price} × ${item.quantity}</p>
        </div>
        <p class="item-total">₹${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `
      )
      .join("");

    updateOrderTotal();
  }

  // ============================
  // 💰 Update Order Total
  // ============================
  function updateOrderTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  // ============================
  // 🧾 Place Order via API
  // ============================
  async function placeOrder() {
    try {
      // Optionally include shipping or user data if stored globally
      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Order placement failed");

      // ✅ Redirect to confirmation page
      const order = await res.json();
      window.location.href = `order-confirmation.html?order_id=${order.id}`;
    } catch (err) {
      console.error(err);
      showToast("Unable to place order. Please try again.");
    }
  }

  // ============================
  // 🧭 Event Listener
  // ============================
  placeOrderBtn?.addEventListener("click", async () => {
    if (!cart || cart.length === 0) {
      showToast("Your cart is empty!");
    } else {
      await placeOrder();
    }
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

  // Initial cart fetch
  fetchCart();
});
