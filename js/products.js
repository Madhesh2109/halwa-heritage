document.addEventListener("DOMContentLoaded", () => {

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
    "Muscoth Halwa": "New"
  };

  const bulkOfferData = {
    enabled: true,
    title: "🎁 Bulk Order Discounts",
    description: "Get 10% OFF on orders above ₹500. Perfect for weddings & festivals!"
  };

  const comboPacks = [
    {
      name: "Family Halwa Combo",
      image: "images/combo1.jpg",
      desc: "1kg Wheat + 1kg Carrot + 1kg Milk Halwa",
      price: "₹999"
    },
    {
      name: "Festive Premium Box",
      image: "images/combo2.jpg",
      desc: "Badam + Cashew + Fruit Halwa Assorted Set",
      price: "₹1299"
    }
  ];

  /* ============================================
     ✅ Static Products to JS
     ============================================ */

  function initializeProductsFromHTML() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach((card, index) => {
      const name = card.querySelector("h3").textContent.trim();
      const description = card.querySelector("p").textContent.trim();
      const image = card.querySelector("img").getAttribute("src");
      const priceText = card.querySelector(".price").textContent;
      const price = parseFloat(priceText.replace(/[^\d.]/g, ""));

      const id = index + 1;
      const product = { id, name, description, image, price };

      allProducts.push(product);

      // ✅ Apply badge if exists
      const badgeText = productBadges[name] || "";
      if (badgeText) {
        let badge = card.querySelector(".product-badge");
        badge.innerText = badgeText;
        badge.style.display = "inline-block";
      }

      // ✅ Add cart + recently viewed
      const btn = card.querySelector(".add-to-cart-btn");
      btn.dataset.id = id;
      btn.addEventListener("click", () => {
        addToCart(product);
        saveRecentlyViewed(product);
      });
    });
  }

  /* ============================================
     ✅ Add to cart
     ============================================ */

  function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }

  /* ============================================
     ✅ Filters + Sorting
     ============================================ */

  function renderFilteredProducts(products) {
    productGrid.innerHTML = products
      .map(
        (p) => `
      <div class="product-card">
        <span class="product-badge"></span>
        <div class="product-image"><img src="${p.image}"></div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <span class="price">₹${p.price}/kg</span>
        <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
      </div>
    `
      )
      .join("");

    // ✅ Apply badges again
    document.querySelectorAll(".product-card").forEach((card) => {
      const name = card.querySelector("h3").innerText;
      const badgeText = productBadges[name] || "";
      if (badgeText) {
        let badge = card.querySelector(".product-badge");
        badge.innerText = badgeText;
        badge.style.display = "inline-block";
      }
    });

    // ✅ Re-bind cart + recently viewed
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      const id = btn.dataset.id;
      const product = products.find((p) => p.id == id);
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
    let recent = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    grid.innerHTML = recent
      .map(
        (p) => `
      <div class="recent-card">
        <img src="${p.image}">
        <h4>${p.name}</h4>
        <span class="price">₹${p.price}</span>
      </div>
    `
      )
      .join("");
  }

  /* ============================================
     ✅ Combo Packs
     ============================================ */

  function renderCombos() {
    const grid = document.getElementById("comboGrid");

    grid.innerHTML = comboPacks
      .map(
        (c) => `
      <div class="combo-card">
        <img src="${c.image}">
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <span class="price">${c.price}</span>
      </div>
    `
      )
      .join("");
  }

  /* ============================================
     ✅ Bulk Offer
     ============================================ */

  function renderBulkOffer() {
    const box = document.getElementById("bulkOfferSection");

    if (!bulkOfferData.enabled) {
      box.style.display = "none";
      return;
    }

    box.innerHTML = `
      <h2>${bulkOfferData.title}</h2>
      <p>${bulkOfferData.description}</p>
    `;
  }

  /* ============================================
     ✅ Start
     ============================================ */

  initializeProductsFromHTML();
  renderRecentlyViewed();
  renderCombos();
  renderBulkOffer();
});
