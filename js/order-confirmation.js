// ======================================
// ORDER-CONFIRMATION.JS – With Delivery Date Estimation
// ======================================

import { db } from "../firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => 
{
  // ============================
  // 🔍 Get Order ID from URL
  // ============================
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  if (!orderId) {
    showError("Missing order information. Please check your order confirmation email.");
    return;
  }

  // ============================
  // 🗓️ DELIVERY DATE ESTIMATION
  // ============================
  const deliveryEstimates = {
    // 🏠 LOCAL DELIVERY (Tirunelveli)
    'tirunelveli_local': {
      cities: ['Tirunelveli', 'Palayamkottai', 'Tirunelveli Junction', 'Thachanallur'],
      days: 1,
      description: 'Next day delivery'
    },

    // 🚗 NEARBY CITIES
    'nearby_tamilnadu': {
      cities: [
        'Tenkasi', 'Ambasamudram', 'Puliyangudi', 'Sankarankovil',
        'Kadayanallur', 'Rajapalayam', 'Sivakasi', 'Virudhunagar'
      ],
      days: 2,
      description: '2 days delivery'
    },

    // 🏙️ MAJOR TN CITIES
    'tamilnadu_major': {
      cities: [
        'Madurai', 'Coimbatore', 'Trichy', 'Salem', 
        'Erode', 'Tiruppur', 'Vellore', 'Kumbakonam'
      ],
      days: 3,
      description: '3 days delivery'
    },

    // 🏙️ CHENNAI & OTHER MAJOR CITIES
    'chennai': {
      cities: ['Chennai'],
      days: 3,
      description: '3 days delivery'
    },

    // 🗺️ OTHER TN CITIES
    'tamilnadu_other': {
      days: 4,
      description: '4 days delivery'
    },

    // 🌆 SOUTH INDIAN METROS
    'south_metros': {
      cities: ['Bangalore', 'Hyderabad', 'Kochi', 'Thiruvananthapuram'],
      days: 4,
      description: '4 days delivery'
    },

    // 🏙️ OTHER SOUTH STATES
    'south_other': {
      states: ['Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'],
      days: 5,
      description: '5 days delivery'
    },

    // 🏙️ WEST/NORTH METROS
    'north_metros': {
      cities: ['Mumbai', 'Delhi', 'Pune', 'Ahmedabad', 'Kolkata'],
      days: 5,
      description: '5 days delivery'
    },

    // 🗺️ REST OF INDIA
    'other_india': {
      days: 6,
      description: '6 days delivery'
    },

    // 🏔️ SPECIAL REGIONS
    'special_regions': {
      states: ['Jammu & Kashmir', 'Himachal Pradesh', 'Uttarakhand', 'Assam', 'Meghalaya'],
      days: 7,
      description: '7 days delivery'
    }
  };

  // ============================
  // 🧾 Fetch Order Details from Firebase
  // ============================
  async function fetchOrderDetails() {
    try {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      
      if (!orderDoc.exists()) {
        showError("Order not found. Please contact support.");
        return null;
      }

      const order = { id: orderDoc.id, ...orderDoc.data() };
      renderOrderDetails(order);
      return order;
    } catch (error) {
      console.error("Error fetching order:", error);
      showError("Unable to load order details. Please try again.");
      return null;
    }
  }

  // ============================
  // 🧱 Render Order Details
  // ============================
  function renderOrderDetails(order) {
    if (!order) return;

    // Calculate delivery date
    const deliveryInfo = calculateDeliveryDate(order.shipping?.city, order.shipping?.state);
    
    // Update delivery information
    document.getElementById("delivery-date").textContent = deliveryInfo.formattedDate;
    document.getElementById("delivery-location").textContent = `to ${order.shipping?.city || 'your location'}`;
    document.getElementById("expected-delivery-date").textContent = deliveryInfo.formattedDate;

    // Update order information
    document.getElementById("order-number").textContent = `#${order.id}`;
    document.getElementById("order-date").textContent = formatDate(order.createdAt);
    document.getElementById("order-total").textContent = `₹${order.total?.toFixed(2) || '0.00'}`;
    document.getElementById("payment-method").textContent = formatPaymentMethod(order.paymentMethod);
    document.getElementById("payment-status").textContent = "Paid";

    // Update shipping address
    document.getElementById("shipping-address").innerHTML = `
      <strong>${order.customer?.name || 'N/A'}</strong><br>
      ${order.shipping?.address || 'N/A'}<br>
      ${order.shipping?.city || ''}, ${order.shipping?.state || ''} - ${order.shipping?.pincode || ''}<br>
      📱 ${order.customer?.phone || 'N/A'}<br>
      📧 ${order.customer?.email || 'N/A'}
    `;

    // Render order items
    const itemsContainer = document.getElementById("confirmation-items");
    if (order.items && order.items.length > 0) {
      itemsContainer.innerHTML = order.items.map(item => `
        <div class="confirmation-item">
          <div class="item-info">
            <strong>${item.name}</strong>
            <div class="item-meta">
              ₹${item.price?.toFixed(2)} × ${item.quantity}
            </div>
          </div>
          <div class="item-total">
            ₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
          </div>
        </div>
      `).join('');
    } else {
      itemsContainer.innerHTML = '<p class="muted">No items found</p>';
    }

    // Update totals
    document.getElementById("confirmation-subtotal").textContent = `₹${order.subtotal?.toFixed(2) || '0.00'}`;
    document.getElementById("confirmation-shipping").textContent = `₹${order.shippingCost?.toFixed(2) || '0.00'}`;
    document.getElementById("confirmation-total").textContent = `₹${order.total?.toFixed(2) || '0.00'}`;

    // Update status timeline
    updateStatusTimeline(deliveryInfo);
  }

  // ============================
  // 🗓️ CALCULATE DELIVERY DATE
  // ============================
  function calculateDeliveryDate(city, state) {
    let deliveryDays = 4; // Default
    
    // Check local delivery
    if (deliveryEstimates.tirunelveli_local.cities.includes(city)) {
      deliveryDays = deliveryEstimates.tirunelveli_local.days;
    }
    // Check nearby cities
    else if (deliveryEstimates.nearby_tamilnadu.cities.includes(city)) {
      deliveryDays = deliveryEstimates.nearby_tamilnadu.days;
    }
    // Check major Tamil Nadu cities
    else if (deliveryEstimates.tamilnadu_major.cities.includes(city)) {
      deliveryDays = deliveryEstimates.tamilnadu_major.days;
    }
    // Check Chennai
    else if (deliveryEstimates.chennai.cities.includes(city)) {
      deliveryDays = deliveryEstimates.chennai.days;
    }
    // Check if in Tamil Nadu
    else if (state === 'Tamil Nadu') {
      deliveryDays = deliveryEstimates.tamilnadu_other.days;
    }
    // Check South Indian metros
    else if (deliveryEstimates.south_metros.cities.includes(city)) {
      deliveryDays = deliveryEstimates.south_metros.days;
    }
    // Check other South Indian states
    else if (deliveryEstimates.south_other.states.includes(state)) {
      deliveryDays = deliveryEstimates.south_other.days;
    }
    // Check North Indian metros
    else if (deliveryEstimates.north_metros.cities.includes(city)) {
      deliveryDays = deliveryEstimates.north_metros.days;
    }
    // Check special regions
    else if (deliveryEstimates.special_regions.states.includes(state)) {
      deliveryDays = deliveryEstimates.special_regions.days;
    }
    // Rest of India
    else if (state) {
      deliveryDays = deliveryEstimates.other_india.days;
    }

    // Calculate actual date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    // Skip weekends (optional)
    if (deliveryDate.getDay() === 0) deliveryDate.setDate(deliveryDate.getDate() + 1); // Sunday -> Monday
    if (deliveryDate.getDay() === 6) deliveryDate.setDate(deliveryDate.getDate() + 2); // Saturday -> Monday

    return {
      days: deliveryDays,
      date: deliveryDate,
      formattedDate: formatDeliveryDate(deliveryDate),
      description: `${deliveryDays} ${deliveryDays === 1 ? 'day' : 'days'} delivery`
    };
  }

  // ============================
  // ⏰ UPDATE STATUS TIMELINE
  // ============================
  function updateStatusTimeline(deliveryInfo) {
    // Set delivered date in timeline
    document.getElementById("status-delivered-time").innerHTML = 
      `Expected: <strong>${deliveryInfo.formattedDate}</strong>`;
    
    // Set shipped date (1 day before delivery)
    const shippedDate = new Date(deliveryInfo.date);
    shippedDate.setDate(shippedDate.getDate() - 1);
    document.getElementById("status-shipped-time").textContent = 
      `Expected: ${formatDate(shippedDate, true)}`;
  }

  // ============================
  // 🎯 FORMATTING FUNCTIONS
  // ============================
  function formatDeliveryDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  function formatDate(date, short = false) {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    
    if (short) {
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPaymentMethod(method) {
    const methods = {
      'gpay': 'Google Pay',
      'cod': 'Cash on Delivery',
      'card': 'Credit/Debit Card',
      'upi': 'UPI Payment'
    };
    return methods[method] || method || 'Unknown';
  }

  // ============================
  // 🖨️ PRINT ORDER FUNCTIONALITY
  // ============================
  document.getElementById('print-order')?.addEventListener('click', () => {
    window.print();
  });

  // ============================
  // 🔔 NOTIFICATION FUNCTIONS
  // ============================
  function showError(message) {
    const confirmationCard = document.querySelector('.confirmation-card');
    if (confirmationCard) {
      confirmationCard.innerHTML = `
        <div class="confirmation-header error">
          <div class="confirmation-icon">❌</div>
          <h2>Order Not Found</h2>
          <p>${message}</p>
        </div>
        <div class="confirmation-actions">
          <a href="products.html" class="btn btn-secondary">Continue Shopping</a>
          <a href="index.html" class="btn btn-primary">Back to Home</a>
        </div>
      `;
    }
  }

  // ============================
  // 🚀 INITIALIZE
  // ============================
  await fetchOrderDetails();
});