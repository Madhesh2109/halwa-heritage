// ============================
// CART.JS – Django API Version
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cart-items-container");
  const totalElement = document.getElementById("cart-total");
  const cartCount = document.querySelector(".cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const emptyMessage = document.getElementById("cart-empty-message");

  let cart = [];

  // ============================
  // 🧠 Fetch Cart Data from API
  // ============================
  async function fetchCart() {
    try {
      const res = await fetch("/api/cart/");
      if (!res.ok) throw new Error("Failed to load cart");
      cart = await res.json();
      renderCart();
    } catch (err) {
      console.error(err);
      showToast("Unable to load your cart. Please try again later.");
    }
  }

  // ============================
  // 🧠 Save Cart Changes to API
  // ============================
  async function updateCartItem(productId, quantity) {
    try {
      const res = await fetch(`/api/cart/${productId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      await fetchCart(); // refresh UI after update
    } catch (err) {
      console.error(err);
      showToast("Unable to update item. Try again.");
    }
  }

  async function removeCartItem(productId) {
    try {
      const res = await fetch(`/api/cart/${productId}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (err) {
      console.error(err);
      showToast("Unable to remove item.");
    }
  }

  // ============================
  // 🧱 Render Cart Items
  // ============================
  function renderCart() {
    if (!cart || cart.length === 0) {
      cartContainer.innerHTML = "";
      emptyMessage.style.display = "block";
      totalElement.textContent = "₹0";
      cartCount.textContent = "0";
      return;
    }

    emptyMessage.style.display = "none";
    cartContainer.innerHTML = cart
      .map(
        (item, index) => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>₹${item.price}/kg</p>
            <div class="quantity-control">
              <button class="quantity-btn decrease" data-id="${item.id}" data-index="${index}">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
              <button class="quantity-btn increase" data-id="${item.id}" data-index="${index}">+</button>
            </div>
          </div>
        </div>
        <button class="remove-item" data-id="${item.id}" data-index="${index}">✕</button>
      </div>
    `
      )
      .join("");

    updateCartTotal();
    updateCartCount();
  }

  // ============================
  // 💰 Update Total & Count
  // ============================
  function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }

  // ============================
  // 🗑️ Remove / Update Quantity
  // ============================
  let quantityTimer;
  function changeQuantity(productId, index, delta) {
    clearTimeout(quantityTimer);
    quantityTimer = setTimeout(() => {
      const newQty = cart[index].quantity + delta;
      if (newQty < 1) return;
      updateCartItem(productId, newQty);
    }, 200);
  }

  // ============================
  // ⚡ Event Delegation
  // ============================
  cartContainer.addEventListener("click", (e) => {
    const productId = e.target.dataset.id;
    const index = e.target.dataset.index;

    if (e.target.classList.contains("remove-item")) {
      removeCartItem(productId);
    }
    if (e.target.classList.contains("increase")) {
      changeQuantity(productId, index, 1);
    }
    if (e.target.classList.contains("decrease")) {
      changeQuantity(productId, index, -1);
    }
  });

  // ============================
  // 🧾 Checkout Navigation
  // ============================
  checkoutBtn?.addEventListener("click", () => {
    if (!cart || cart.length === 0) {
      showToast("Your cart is empty!");
    } else {
      window.location.href = "checkout.html";
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
