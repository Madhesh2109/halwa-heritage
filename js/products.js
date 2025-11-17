// products.js — Dynamic Filter + Sort + Badges + Recently Viewed + Add to Cart (Final)

import { getProducts } from "../firebase/firestore.js";

document.addEventListener("DOMContentLoaded", () =>
{
  const sortFilter = document.querySelector("#sortFilter");
  const priceFilter = document.querySelector("#priceFilter");
  const resetFilters = document.querySelector("#resetFilters");
  const productGrid = document.querySelector(".product-grid");
  let allProducts = [];

  /* ============================================
     ✅ Dynamic Data (Admin Controlled)
     ============================================ */
  const productBadges = {
    "Carrot Halwa": "Best Seller",
    "Wheat Halwa": "Popular",
    "Badam Halwa": "Premium",
    "Moong Dal Halwa": "Trending",
    "Fruit Halwa": "",
    "Muscoth Halwa": "New",
  };

  const comboPacks = [
    { name: "Family Halwa Combo", image: "images/combo1.jpg", desc: "1kg Wheat + 1kg Carrot + 1kg Milk Halwa", price: "₹999" },
    { name: "Festive Premium Box", image: "images/combo2.jpg", desc: "Badam + Cashew + Fruit Halwa Assorted Set", price: "₹1299" },
  ];

  // ===== Helpers =====
  const parsePrice = (text) => {
    const m = String(text).replace(/,/g, "").match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : 0;
  };

  /* ============================================
     ✅ Static Products → JS (and apply badges)
     ============================================ */
  function initializeProductsFromHTML() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
      const name = card.querySelector("h3")?.textContent.trim() || "";
      const description = card.querySelector("p")?.textContent.trim() || "";
      const image = card.querySelector("img")?.getAttribute("src") || "";
      const priceText = card.querySelector(".price")?.textContent.trim() || "0";
      const price = parsePrice(priceText);

      const id = index + 1;
      const product = { id, name, description, image, price };
      allProducts.push(product);

      // Apply badge on initial static cards
      const badgeText = productBadges[name] || "";
      if (badgeText) {
        let badge = card.querySelector(".product-badge");
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "product-badge";
          card.insertBefore(badge, card.firstChild);
        }
        badge.innerText = badgeText;
        badge.dataset.type = badgeText;
        badge.style.display = "inline-block";
      }

      // Bind Add to Cart + Recently Viewed
      const btn = card.querySelector(".add-to-cart-btn");
      if (btn) {
        btn.dataset.id = id;
        btn.addEventListener("click", () => {
          addToCart(product);
          saveRecentlyViewed(product);
        });
      }
    });
  }

  /* ============================================
     ✅ Add to cart + Cart count + Toast
     ============================================ */
  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, price: Number(product.price), quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(`${product.name} added to cart!`);
    updateCartCount();
  }

  function updateCartCount() {
    const cartCount = document.querySelector(".cart-count");
    if (!cartCount) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    cartCount.textContent = count;
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  /* ============================================
     ✅ Filters + Sorting
     ============================================ */
  function applyFilters() {
    const sortValue = sortFilter ? sortFilter.value : "default";
    const selectedPrice = priceFilter ? priceFilter.value : "all";

    let filtered = [...allProducts];

    // Price range filter
    if (selectedPrice !== "all") {
      filtered = filtered.filter((p) => {
        if (selectedPrice === "low") return p.price < 400;
        if (selectedPrice === "medium") return p.price >= 400 && p.price <= 600;
        if (selectedPrice === "high") return p.price > 600;
        return true;
      });
    }

    // Sort by price
    if (sortValue === "lowToHigh") filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === "highToLow") filtered.sort((a, b) => b.price - a.price);

    renderFilteredProducts(filtered);
  }

  /* ============================================
     ✅ Render Products (ensures badges after filtering)
     ============================================ */
  function renderFilteredProducts(products) {
    if (!productGrid) return;

    if (!products || products.length === 0) {
      productGrid.innerHTML = `<p style="text-align:center; padding:40px;">No products found</p>`;
      return;
    }

    productGrid.innerHTML = products
      .map(
        (p) => `
        <div class="product-card" data-id="${p.id}">
          <span class="product-badge" style="display:none"></span>
          <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          <span class="price">₹${Number(p.price).toFixed(2)}/kg</span>
          <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
        </div>`
      )
      .join("");

    // Re-apply badges on rendered list
    document.querySelectorAll(".product-card").forEach((card) => {
      const name = card.querySelector("h3")?.innerText?.trim() || "";
      const badgeText = productBadges[name] || "";
      const badge = card.querySelector(".product-badge");
      if (badgeText) {
        badge.innerText = badgeText;
        badge.style.display = "inline-block";
      } else if (badge) {
        badge.style.display = "none";
        badge.innerText = "";
      }
    });

    // Rebind Add-to-Cart + Recently Viewed
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      const id = Number(btn.dataset.id);
      const product = products.find((p) => p.id === id) || allProducts.find((p) => p.id === id);
      btn.addEventListener("click", () => {
        addToCart(product);
        saveRecentlyViewed(product);
      });
    });
  }

  /* ============================================
     ✅ Recently Viewed
     ============================================ */
  function saveRecentlyViewed(product) {
    let recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    recent = recent.filter((p) => p.id !== product.id);
    recent.unshift(product);
    recent = recent.slice(0, 6);
    localStorage.setItem("recentlyViewed", JSON.stringify(recent));
    renderRecentlyViewed();
  }

  function renderRecentlyViewed() {
    const grid = document.getElementById("recentGrid");
    if (!grid) return;
    let recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    grid.innerHTML = recent
      .map(
        (p) => `
        <div class="recent-card">
          <img src="${p.image}" alt="${p.name}">
          <h4>${p.name}</h4>
          <span class="price">₹${Number(p.price).toFixed(2)}</span>
        </div>`
      )
      .join("");
  }

  /* ============================================
     ✅ Combo Packs
     ============================================ */
  function renderCombos() {
    const grid = document.getElementById("comboGrid");
    if (!grid) return;
    grid.innerHTML = comboPacks
      .map(
        (c) => `
        <div class="combo-card">
          <img src="${c.image}" alt="${c.name}">
          <h3>${c.name}</h3>
          <p>${c.desc}</p>
          <span class="price">${c.price}</span>
        </div>`
      )
      .join("");
  }

  /* ============================================
     ✅ Events
     ============================================ */
  sortFilter?.addEventListener("change", applyFilters);
  priceFilter?.addEventListener("change", applyFilters);

  resetFilters?.addEventListener("click", () => {
    if (sortFilter) sortFilter.value = "default";
    if (priceFilter) priceFilter.value = "all";
    renderFilteredProducts(allProducts); // badges will be re-applied inside
  });

  /* ============================================
   ✅ Apply Badges (after Firestore render)
   ============================================ */
  function applyBadges() 
  {
    const badgeColors = 
    {
      "Best Seller": "linear-gradient(135deg, #a93226, #e74c3c)",  // Deep red
      "Popular": "linear-gradient(135deg, #117864, #1abc9c)",      // Emerald green
      "Premium": "linear-gradient(135deg, #7d6608, #f7dc6f)",      // Gold
      "Trending": "linear-gradient(135deg, #c0392b, #f39c12)",     // Red-orange
      "New": "linear-gradient(135deg, #1e8449, #27ae60)",          // Fresh green
      "": "linear-gradient(135deg, #7f8c8d, #95a5a6)"              // Neutral grey
    };
    document.querySelectorAll(".product-card").forEach((card) => 
    {
      const name = card.querySelector("h3")?.innerText?.trim() || "";
      const badgeText = productBadges[name] || "";
      const badge = card.querySelector(".product-badge");

      if (badgeText && badge) 
      {
        badge.innerText = badgeText;
        badge.style.display = "inline-block";
        badge.dataset.type = badgeText;

        const bg = badgeColors[badgeText] || badgeColors[""];
        badge.style.background = bg;

        badge.style.color = "#fff";
        badge.style.padding = "4px 8px";
        badge.style.borderRadius = "8px";
        badge.style.fontSize = "0.8rem";
        badge.style.fontWeight = "600";
        badge.style.position = "absolute";
        badge.style.top = "10px";
        badge.style.left = "10px";
        badge.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
        badge.style.transition = "transform 0.3s ease, background 0.3s ease";
      }
    });
  }

  /* ============================================
   ✅ Fetch Products from Firestore (merge with static)
   ============================================ */
  async function initializeProductsFromFirestore()
  {
    try
    {
      const snapshot = await getProducts();

      const fetched = snapshot.map((p, index) => (
      {
        id: allProducts.length + index + 1, // continue after static ones
        name: p.name,
        description: p.description,
        image: p.image,
        price: Number(p.price),
        badge: p.badge || "", // allow Firestore to set custom badges
      }));

      // Merge static + Firestore products
      allProducts = [...allProducts, ...fetched];

      // Render everything (badges + filters still work)
      renderFilteredProducts(allProducts);

      // ✅ Re-apply badge styles AFTER rendering
      applyBadges();

    }
    catch (err)
    {
      console.error("⚠️ Firestore fetch failed:", err);
    }
  }

  /* ============================================
     🚀 Init
     ============================================ */
  initializeProductsFromHTML();       // Load static HTML products first
  initializeProductsFromFirestore();  // Then load from Firestore and merge
  
  updateCartCount();
  renderRecentlyViewed();
  renderCombos();
  // Ensure initial badge-accurate render (optional): keep DOM order, but harmonize markup if needed
  // renderFilteredProducts(allProducts);
});
