// ======================================
// ORDER-CONFIRMATION.JS – Django API Version
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  const orderSummary = document.getElementById("order-summary");
  const totalElement = document.getElementById("order-total");
  const orderIdElement = document.getElementById("order-id");
  const customerElement = document.getElementById("customer-name");
  const addressElement = document.getElementById("shipping-address");

  // ============================
  // 🔍 Get Order ID from URL
  // ============================
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  if (!orderId) {
    showToast("Missing order information.");
    return;
  }

  // ============================
  // 🧾 Fetch Order Details
  // ============================
  async function fetchOrderDetails() {
    try {
      const res = await fetch(`/api/order/${orderId}/`);
      if (!res.ok) throw new Error("Failed to load order details");

      const order = await res.json();
      renderOrderDetails(order);
    } catch (err) {
      console.error(err);
      showToast("Unable to load order details.");
    }
  }

  // ============================
  // 🧱 Render Order Info
  // ============================
  function renderOrderDetails(order) {
    if (!order || !order.items) {
      showToast("Invalid order data.");
      return;
    }

    // Render items
    orderSummary.innerHTML = order.items
      .map(
        (item) => `
        <div class="summary-item">
          <div>
            <h3>${item.name}</h3>
            <p>₹${item.price} × ${item.quantity}</p>
          </div>
          <p>₹${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      `
      )
      .join("");

    // Update totals
    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalElement.textContent = `₹${total.toFixed(2)}`;

    // Optional order info
    if (orderIdElement) orderIdElement.textContent = `Order #${order.id}`;
    if (customerElement) customerElement.textContent = order.customer_name || "Valued Customer";
    if (addressElement) addressElement.textContent = order.shipping_address || "N/A";
  }

  // ============================
  // 🔔 Toast Helper
  // ============================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  // Fetch details on load
  fetchOrderDetails();
});
