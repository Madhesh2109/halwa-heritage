// ============================
// CHECKOUT.JS – Firebase Ready & Polished Final Version
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const orderSummary = document.getElementById("order-summary");
  const subtotalElement = document.getElementById("order-subtotal");
  const totalElement = document.getElementById("order-total");
  const placeOrderBtn = document.getElementById("place-order-btn");

  // Shipping and form inputs
  const fullNameInput = document.getElementById("fullname");
  const addressInput = document.getElementById("address");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");

  let cart = [];
  let shipping = 0;

  // ============================
  // 🧠 Load Cart from Local Storage
  // ============================
  function loadCart() {
    try {
      const storedCart = localStorage.getItem("cart");
      cart = storedCart ? JSON.parse(storedCart) : [];
      renderOrderSummary();
    } catch (error) {
      console.error("Error loading cart:", error);
      showToast("⚠️ Failed to load your cart.");
    }
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

    // Generate cart HTML
    const itemsHTML = cart
      .map((item) => {
        const price = parseFloat(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        const totalItemPrice = price * qty;

        return `
          <div class="summary-item">
            <div class="item-details">
              <strong>${item.name}</strong>
              <p>₹${price} × ${qty}</p>
            </div>
            <p class="item-total">₹${totalItemPrice.toFixed(2)}</p>
          </div>
        `;
      })
      .join("");

    orderSummary.innerHTML = itemsHTML;
    updateTotals();
  }

  // ============================
  // 💰 Calculate & Update Totals
  // ============================
  function updateTotals() {
    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);

    const total = subtotal + shipping;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  // ============================
  // 🚚 Set Shipping Dynamically (optional)
  // ============================
  function setShippingCost(amount) {
    shipping = parseFloat(amount) || 0;
    updateTotals();
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
  // 📦 Place Order
  // ============================
  async function placeOrder() {
    if (!cart || cart.length === 0) {
      showToast("🛒 Your cart is empty!");
      return;
    }

    if (!validateForm()) return;

    // Payment selection validation
    const paymentInput = document.querySelector('input[name="payment"]:checked');
    if (!paymentInput) {
      showToast("⚠️ Please select a payment method!");
      return;
    }

    const subtotal = cart.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);

    const total = subtotal + shipping;

    const orderData = {
      name: fullNameInput.value.trim(),
      address: addressInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      paymentMethod: paymentInput.value,
      items: cart,
      subtotal,
      shipping,
      totalAmount: total,
      createdAt: new Date().toISOString(),
    };

    showToast("⏳ Placing your order...");

    try {
      // ============================
      // 🔥 Firebase Integration (placeholder)
      // ============================
      // Example:
      // import { addDoc, collection } from "firebase/firestore";
      // await addDoc(collection(db, "orders"), orderData);

      // Simulated success
      setTimeout(() => {
        localStorage.removeItem("cart");
        showToast("✅ Order placed successfully!");
        setTimeout(() => {
          window.location.href = "order-confirmation.html";
        }, 1200);
      }, 1200);
    } catch (error) {
      console.error("Order placement failed:", error);
      showToast("❌ Failed to place order. Try again!");
    }
  }

  // ============================
  // 🔔 Toast Notification
  // ============================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  // ============================
  // 🧭 Event Listeners
  // ============================
  placeOrderBtn?.addEventListener("click", placeOrder);

  // Initial load
  loadCart();

  // Example dynamic shipping if needed:
  // setShippingCost(50);
});
