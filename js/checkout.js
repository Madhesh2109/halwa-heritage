// ============================
// CHECKOUT.JS – Firebase Ready & Modern UI Version
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const orderSummary = document.getElementById("order-summary");
  const subtotalElement = document.getElementById("order-subtotal");
  const totalElement = document.getElementById("order-total");
  const placeOrderBtn = document.getElementById("place-order-btn");

  // Shipping and payment form elements
  const fullNameInput = document.getElementById("fullname");
  const addressInput = document.getElementById("address");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");

  let cart = [];

  // ============================
  // 🧠 Load Cart from Local Storage
  // ============================
  function loadCart() {
    const storedCart = localStorage.getItem("cart");
    cart = storedCart ? JSON.parse(storedCart) : [];
    renderOrderSummary();
  }

  // ============================
  // 🧱 Render Order Summary
  // ============================
  function renderOrderSummary() {
    if (!cart || cart.length === 0) {
      orderSummary.innerHTML = `<p style="text-align:center; color:#999;">Your cart is empty.</p>`;
      subtotalElement.textContent = "₹0";
      totalElement.textContent = "₹0";
      return;
    }

    orderSummary.innerHTML = cart
      .map(
        (item) => `
        <div class="summary-item">
          <div class="item-details">
            <strong>${item.name}</strong>
            <p>₹${item.price} × ${item.quantity}</p>
          </div>
          <p class="item-total">₹${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      `
      )
      .join("");

    updateTotals();
  }

  // ============================
  // 💰 Calculate and Update Totals
  // ============================
  function updateTotals() {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = cart.length > 0 ? 50 : 0;
    const total = subtotal + shipping;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  // ============================
  // ✅ Validate Checkout Form
  // ============================
  function validateForm() {
    if (
      !fullNameInput.value.trim() ||
      !addressInput.value.trim() ||
      !phoneInput.value.trim() ||
      !emailInput.value.trim()
    ) {
      showToast("⚠️ Please fill all the required fields!");
      return false;
    }
    return true;
  }

  // ============================
  // 📦 Place Order (Firebase Ready)
  // ============================
  async function placeOrder() {
    if (!cart || cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    if (!validateForm()) return;

    const orderData = {
      name: fullNameInput.value.trim(),
      address: addressInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      paymentMethod: document.querySelector(
        'input[name="payment"]:checked'
      ).value,
      items: cart,
      totalAmount: totalElement.textContent.replace("₹", ""),
      createdAt: new Date().toISOString(),
    };

    showToast("⏳ Placing your order...");

    // ============================
    // 🔥 Firebase Integration (placeholder)
    // ============================
    // Example:
    // import { addDoc, collection } from "firebase/firestore";
    // await addDoc(collection(db, "orders"), orderData);

    // Simulate order success
    setTimeout(() => {
      localStorage.removeItem("cart");
      showToast("✅ Order placed successfully!");
      setTimeout(() => {
        window.location.href = "order-confirmation.html";
      }, 1500);
    }, 1500);
  }

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

  // ============================
  // 🧭 Event Listener
  // ============================
  placeOrderBtn?.addEventListener("click", placeOrder);

  // Initial cart load
  loadCart();
});
