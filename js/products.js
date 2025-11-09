// products.js — Dynamic Filter + Sort + Add to Cart (Final Version)

document.addEventListener("DOMContentLoaded", () => {
  const sortFilter = document.querySelector("#sortFilter");
  const priceFilter = document.querySelector("#priceFilter");
  const resetFilters = document.querySelector("#resetFilters");
  const productGrid = document.querySelector(".product-grid");

  let allProducts = [];

  // =====================================
  // 🔗 Initialize Products from HTML
  // =====================================
  function initializeProductsFromHTML() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
      const name = card.querySelector("h3").textContent.trim();
      const description = card.querySelector("p").textContent.trim();
      const image = card.querySelector("img").getAttribute("src");
      const priceText = card.querySelector(".price").textContent.trim();

      // ✅ Correct numeric extraction — ignores 'Rs.' and keeps decimals
      const priceMatch = priceText.replace(/,/g, "").match(/\d+(\.\d+)?/);
      const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

      const id = index + 1;
      const product = { id, name, description, image, price };
      allProducts.push(product);

      const btn = card.querySelector(".add-to-cart-btn");
      btn.dataset.id = id;
      btn.addEventListener("click", () => addToCart(product));
    });
  }

  // =====================================
  // 🛒 Add Product to Cart
  // =====================================
  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart!`);
    updateCartCount();
  }

  // =====================================
  // 🔍 Filter by Price Range + Sort by Price
  // =====================================
  function applyFilters() {
    const sortValue = sortFilter ? sortFilter.value : "default";
    const selectedPrice = priceFilter ? priceFilter.value : "all";

    let filtered = [...allProducts];

    // Filter by price range
    if (selectedPrice !== "all") {
      filtered = filtered.filter((p) => {
        if (selectedPrice === "low") return p.price < 400;
        if (selectedPrice === "medium") return p.price >= 400 && p.price <= 600;
        if (selectedPrice === "high") return p.price > 600;
        return true;
      });
    }

    // Sort by price
    if (sortValue === "lowToHigh") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "highToLow") {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderFilteredProducts(filtered);
  }

  // =====================================
  // 🎨 Render Filtered Products
  // =====================================
  function renderFilteredProducts(products) {
    if (products.length === 0) {
      productGrid.innerHTML = `<p style="text-align:center; padding:40px;">No products found</p>`;
      return;
    }

    productGrid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card" data-id="${p.id}">
        <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <span class="price">₹${p.price.toFixed(2)}/kg</span>
        <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    `
      )
      .join("");

    // Rebind Add-to-Cart buttons for filtered products
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      const product = products.find((p) => p.id == btn.dataset.id);
      btn.addEventListener("click", () => addToCart(product));
    });
  }

  // =====================================
  // 🧮 Update Cart Count
  // =====================================
  function updateCartCount() {
    const cartCount = document.querySelector(".cart-count");
    if (!cartCount) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
  }

  // =====================================
  // 🔔 Toast
  // =====================================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // =====================================
  // 🧭 Filter + Sort Event Listeners
  // =====================================
  sortFilter?.addEventListener("change", applyFilters);
  priceFilter?.addEventListener("change", applyFilters);

  resetFilters?.addEventListener("click", () => {
    if (sortFilter) sortFilter.value = "default";
    if (priceFilter) priceFilter.value = "all";
    renderFilteredProducts(allProducts);
  });

  // =====================================
  // 🚀 Init
  // =====================================
  initializeProductsFromHTML();
  updateCartCount();
});
