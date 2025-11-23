// ============================
// CART.JS – Clean, Stable, Firebase-Ready
// ============================

document.addEventListener("DOMContentLoaded", () =>
{
  const cartContainer = document.getElementById("cart-items-container");
  const totalElement = document.getElementById("cart-total");
  const cartCount = document.querySelector(".cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const emptyMessage = document.getElementById("empty-cart-message");
  const loginMessage = document.getElementById("login-required-message");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // ============================
  // ✅ Render Cart Items
  // ============================
  function renderCart() 
  {
    if (!cartContainer) return;

    if (cart.length === 0) 
    {
      cartContainer.innerHTML = "";
      emptyMessage.style.display = "block";
      if (loginMessage) loginMessage.style.display = "none";
      totalElement.textContent = "₹0";
      if (cartCount) cartCount.textContent = "0";
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
                <button class="quantity-btn decrease" data-index="${index}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" readonly>
                <button class="quantity-btn increase" data-index="${index}">+</button>
              </div>
            </div>
          </div>

          <button class="remove-item" data-index="${index}">✕</button>
        </div>
        `
      )
      .join("");

    updateCartTotal();
    updateCartCount();
  }

  // ============================
  // ✅ Save Cart with Safe Price Fix
  // ============================
  function saveCart() {
    cart.forEach((item) => {
      let price = parseFloat(item.price);

      // Fix bad decimal data: 0.8 → 800
      if (price > 0 && price < 10) {
        price = price * 1000;
      }

      item.price = price;
    });

    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // ============================
  // ✅ Update Totals
  // ============================
  function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  function updateCartCount() 
  {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = count;

    // Update in summary box
    const rightCount = document.querySelector(".item-count");
    if (rightCount) rightCount.textContent = count;
  }

  // ============================
  // ✅ Quantity & Remove
  // ============================
  function changeQuantity(index, delta) {
    const newQty = cart[index].quantity + delta;
    if (newQty < 1) return;

    cart[index].quantity = newQty;
    saveCart();
    renderCart();
  }

  function removeCartItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  // ============================
  // ✅ Event Delegation
  // ============================
  if(cartContainer)
  {
    cartContainer.addEventListener("click", (e) =>
    {
      const index = e.target.dataset.index;
      if (!index) return;

      if (e.target.classList.contains("increase")) changeQuantity(index, 1);
      if (e.target.classList.contains("decrease")) changeQuantity(index, -1);
      if (e.target.classList.contains("remove-item")) removeCartItem(index);
    });
  }

  // ============================
  // ✅ Checkout
  // ============================
  if (checkoutBtn)
  {
    checkoutBtn.addEventListener("click", () =>
    {
      if (cart.length === 0)
      {
        showToast("Your cart is empty!");
        return;
      }
      window.location.href = "checkout.html";
    });
  }

  // ============================
  // ✅ Toast
  // ============================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2000);
  }

  // ============================
  // ✅ Init
  // ============================
  renderCart();
});
