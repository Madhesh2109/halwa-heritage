// ============================
// CHECKOUT.JS – With Realistic Shipping Rates
// ============================

import { db } from "../firebase/firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const orderSummary = document.getElementById("order-summary");
  const subtotalElement = document.getElementById("order-subtotal");
  const shippingElement = document.getElementById("order-shipping");
  const totalElement = document.getElementById("order-total");
  const placeOrderBtn = document.getElementById("place-order-btn");

  // Form inputs
  const fullNameInput = document.getElementById("fullname");
  const addressInput = document.getElementById("address");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");

  let cart = [];
  let shipping = 0;

  // ============================
  // 🚚 REALISTIC SHIPPING RATES
  // ============================
  const shippingRates = {
    // 🏠 LOCAL DELIVERY (Free)
    'tirunelveli_local': {
      cities: ['Tirunelveli', 'Palayamkottai', 'Tirunelveli Junction', 'Thachanallur'],
      rate: 0,
      delivery: '1-2 days'
    },

    // 🚗 NEARBY CITIES (Low Cost)
    'nearby_tamilnadu': {
      cities: [
        'Tenkasi', 'Ambasamudram', 'Puliyangudi', 'Sankarankovil',
        'Kadayanallur', 'Rajapalayam', 'Sivakasi', 'Virudhunagar'
      ],
      rate: 49,
      delivery: '2 days'
    },

    // 🏙️ MAJOR TN CITIES
    'tamilnadu_major': {
      cities: [
        'Madurai', 'Coimbatore', 'Trichy', 'Salem', 
        'Erode', 'Tiruppur', 'Vellore', 'Kumbakonam',
        'Thanjavur', 'Dindigul', 'Karur', 'Nagapattinam'
      ],
      rate: 79,
      delivery: '2-3 days'
    },

    // 🏙️ CHENNAI METRO
    'chennai': {
      cities: ['Chennai'],
      rate: 99,
      delivery: '3 days'
    },

    // 🗺️ OTHER TN CITIES
    'tamilnadu_other': {
      rate: 89,
      delivery: '3-4 days'
    },

    // 🌆 SOUTH INDIAN METROS
    'south_metros': {
      cities: ['Bangalore', 'Hyderabad', 'Kochi', 'Thiruvananthapuram'],
      rate: 129,
      delivery: '3-4 days'
    },

    // 🏙️ OTHER SOUTH STATES
    'south_other': {
      states: ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
      rate: 119,
      delivery: '4-5 days'
    },

    // 🏙️ WEST/NORTH METROS
    'north_metros': {
      cities: ['Mumbai', 'Delhi', 'Pune', 'Ahmedabad', 'Kolkata'],
      rate: 149,
      delivery: '4-5 days'
    },

    // 🗺️ REST OF INDIA
    'other_india': {
      rate: 169,
      delivery: '5-7 days'
    },

    // 🏔️ SPECIAL REGIONS
    'special_regions': {
      states: ['Jammu & Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Meghalaya'],
      rate: 199,
      delivery: '6-8 days'
    }
  };

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
      shippingElement.textContent = "₹0";
      totalElement.textContent = "₹0";
      return;
    }

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

    // Calculate shipping based on address
    const address = addressInput ? addressInput.value.trim() : '';
    shipping = calculateShipping(address, subtotal);
    
    const total = subtotal + shipping;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = `₹${shipping.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;

    // Show free shipping message if applicable
    showFreeShippingMessage(subtotal);
  }

  // ============================
  // 🚚 CALCULATE SHIPPING COST
  // ============================
  function calculateShipping(address, subtotal) {
    // Free shipping for orders above ₹1499
    if (subtotal >= 1499) {
      return 0;
    }

    const city = extractCityFromAddress(address);
    const state = extractStateFromAddress(address);

    // Check local delivery (Tirunelveli)
    if (shippingRates.tirunelveli_local.cities.includes(city)) {
      return shippingRates.tirunelveli_local.rate;
    }
    
    // Check nearby cities
    if (shippingRates.nearby_tamilnadu.cities.includes(city)) {
      return shippingRates.nearby_tamilnadu.rate;
    }
    
    // Check major Tamil Nadu cities
    if (shippingRates.tamilnadu_major.cities.includes(city)) {
      return shippingRates.tamilnadu_major.rate;
    }
    
    // Check Chennai specifically
    if (shippingRates.chennai.cities.includes(city)) {
      return shippingRates.chennai.rate;
    }
    
    // Check if in Tamil Nadu
    if (state === 'Tamil Nadu') {
      return shippingRates.tamilnadu_other.rate;
    }
    
    // Check South Indian metros
    if (shippingRates.south_metros.cities.includes(city)) {
      return shippingRates.south_metros.rate;
    }
    
    // Check other South Indian states
    if (shippingRates.south_other.states.includes(state)) {
      return shippingRates.south_other.rate;
    }
    
    // Check North Indian metros
    if (shippingRates.north_metros.cities.includes(city)) {
      return shippingRates.north_metros.rate;
    }
    
    // Check special regions
    if (shippingRates.special_regions.states.includes(state)) {
      return shippingRates.special_regions.rate;
    }
    
    // Rest of India
    return shippingRates.other_india.rate;
  }

  // ============================
  // 🎯 FREE SHIPPING MESSAGE
  // ============================
  function showFreeShippingMessage(subtotal) {
    // Remove existing message
    const existingMessage = document.querySelector('.free-shipping-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    if (subtotal > 0 && subtotal < 1499) {
      const amountNeeded = 1499 - subtotal;
      const message = document.createElement('div');
      message.className = 'free-shipping-message';
      message.style.cssText = `
        background: #e8f5e8;
        border: 1px solid #27ae60;
        border-radius: 8px;
        padding: 10px;
        margin: 10px 0;
        text-align: center;
        font-size: 0.9em;
        color: #2e7d32;
      `;
      message.innerHTML = `🛒 Add <strong>₹${amountNeeded}</strong> more for <strong>FREE SHIPPING</strong>!`;
      
      const orderSummaryCard = document.querySelector('.order-summary');
      if (orderSummaryCard) {
        orderSummaryCard.insertBefore(message, orderSummaryCard.querySelector('.summary-line'));
      }
    }
  }

  // ============================
  // 🗺️ ADDRESS PARSING FUNCTIONS
  // ============================
  function extractCityFromAddress(address) {
    const allCities = [
      ...shippingRates.tirunelveli_local.cities,
      ...shippingRates.nearby_tamilnadu.cities,
      ...shippingRates.tamilnadu_major.cities,
      ...shippingRates.chennai.cities,
      ...shippingRates.south_metros.cities,
      ...shippingRates.north_metros.cities
    ];

    for (let city of allCities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    return '';
  }

  function extractStateFromAddress(address) {
    const states = [
      'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 
      'Telangana', 'Maharashtra', 'Delhi', 'Gujarat', 'West Bengal',
      'Jammu & Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Meghalaya'
    ];
    
    for (let state of states) {
      if (address.toLowerCase().includes(state.toLowerCase())) {
        return state;
      }
    }
    return '';
  }

  // ============================
  // ✅ VALIDATE CHECKOUT FORM
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

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneInput.value.trim())) {
      showToast("⚠️ Please enter a valid 10-digit phone number!");
      phoneInput.focus();
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showToast("⚠️ Please enter a valid email address!");
      emailInput.focus();
      return false;
    }

    return true;
  }

  // ============================
  // 📦 PLACE ORDER
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

    // Recalculate shipping at order time
    const address = addressInput.value.trim();
    shipping = calculateShipping(address, subtotal);
    const total = subtotal + shipping;

    // Disable button to prevent multiple clicks
    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = "Placing Order...";

    // Extract city and state from address
    const city = extractCityFromAddress(address) || "Tirunelveli";
    const state = extractStateFromAddress(address) || "Tamil Nadu";
    const pincode = extractPincodeFromAddress(address) || "627002";

    const orderData = {
      customer: {
        name: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
      },
      shipping: {
        address: address,
        city: city,
        state: state,
        pincode: pincode
      },
      items: cart.map(item => ({
        name: item.name,
        price: parseFloat(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || ""
      })),
      total: total,
      subtotal: subtotal,
      shipping: shipping,
      paymentMethod: paymentInput.value,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    showToast("⏳ Placing your order...");

    try {
      // ✅ ACTUAL FIREBASE SAVE
      const orderRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order saved with ID: ", orderRef.id);

      // Clear cart and redirect
      localStorage.removeItem("cart");
      
      showToast("✅ Order placed successfully!");
      
      // Redirect to confirmation page with order ID
      setTimeout(() => {
        window.location.href = `order-confirmation.html?orderId=${orderRef.id}`;
      }, 1500);

    } catch (error) {
      console.error("Order placement failed:", error);
      showToast("❌ Failed to place order. Please try again!");
      
      // Re-enable button
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = "Place Order";
    }
  }

  function extractPincodeFromAddress(address) {
    const pincodeMatch = address.match(/\b\d{6}\b/);
    return pincodeMatch ? pincodeMatch[0] : "627002";
  }

  // ============================
  // 🔔 TOAST NOTIFICATION
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
  // 🧭 EVENT LISTENERS
  // ============================
  placeOrderBtn?.addEventListener("click", placeOrder);

  // Real-time shipping update when address changes
  if (addressInput) {
    addressInput.addEventListener('input', updateTotals);
  }

  // Initial load
  loadCart();
});