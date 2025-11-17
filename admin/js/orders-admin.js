/* orders-admin.js */
import * as FS from "./admin-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadOrders();
    setupEventListeners();
});

let allOrders = [];

async function loadOrders() {
    try {
        allOrders = await FS.getOrders();
        
        // If no orders in Firestore, use sample data for demo
        if (allOrders.length === 0) {
            console.log("No orders found in Firestore, using sample data for demo");
            allOrders = getSampleOrders();
        }
        
        displayOrders(allOrders);
        updateOrderStats(allOrders);
    } catch (error) {
        console.error("Error loading orders:", error);
        document.getElementById("ordersList").innerHTML = 
            "<p class='error'>Error loading orders. Please check console.</p>";
    }
}

function setupEventListeners() {
    // Status filter
    document.getElementById("statusFilter").addEventListener("change", (e) => {
        filterOrders();
    });

    // Search filter
    document.getElementById("searchOrders").addEventListener("input", (e) => {
        filterOrders();
    });

    // Refresh button
    document.getElementById("refreshOrders").addEventListener("click", async () => {
        await loadOrders();
    });

    // Modal close
    document.querySelector(".close").addEventListener("click", () => {
        document.getElementById("orderModal").style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("orderModal");
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

function filterOrders() {
    const statusFilter = document.getElementById("statusFilter").value;
    const searchTerm = document.getElementById("searchOrders").value.toLowerCase();

    let filteredOrders = allOrders;

    // Filter by status
    if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            (order.customer?.name?.toLowerCase().includes(searchTerm) || '') ||
            (order.customer?.email?.toLowerCase().includes(searchTerm) || '')
        );
    }

    displayOrders(filteredOrders);
}

function displayOrders(orders) {
    const ordersList = document.getElementById("ordersList");
    
    if (orders.length === 0) {
        ordersList.innerHTML = "<p class='muted'>No orders found.</p>";
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" data-id="${order.id}">
            <div class="order-header">
                <div>
                    <div class="order-id">#${order.id}</div>
                    <div class="small muted">${formatDate(order.createdAt)}</div>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-customer">
                <div>
                    <strong>${order.customer?.name || 'N/A'}</strong><br>
                    <span class="small muted">${order.customer?.email || 'N/A'}</span>
                </div>
                <div>
                    <div class="small">📱 ${order.customer?.phone || 'N/A'}</div>
                    <div class="small">📍 ${order.shipping?.city || 'N/A'}</div>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items?.map(item => `
                    <div class="order-item-row">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('') || '<div class="small muted">No items</div>'}
            </div>
            
            <div class="order-total">Total: ₹${order.total?.toFixed(2) || '0.00'}</div>
            
            <div class="order-actions">
                <button class="btn small view-order" data-id="${order.id}">View Details</button>
                <select class="status-select" data-id="${order.id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        </div>
    `).join('');

    // Attach event listeners to dynamic elements
    attachOrderEventListeners();
}

function attachOrderEventListeners() {
    // View order details
    document.querySelectorAll(".view-order").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const orderId = e.target.dataset.id;
            const order = allOrders.find(o => o.id === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });

    // Status change
    document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async (e) => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            
            try {
                // Update in Firestore
                await FS.updateOrderStatus(orderId, newStatus);
                
                // Update local data
                const order = allOrders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                }
                
                // Refresh display
                filterOrders();
                updateOrderStats(allOrders);
                
                showNotification(`Order ${orderId} status updated to ${newStatus}`, "success");
                
            } catch (error) {
                console.error("Error updating order status:", error);
                showNotification("Error updating order status. Please try again.", "error");
            }
        });
    });
}

function showOrderDetails(order) {
    const modal = document.getElementById("orderModal");
    const modalBody = document.getElementById("modalBody");
    
    document.getElementById("modalTitle").textContent = `Order #${order.id}`;
    
    modalBody.innerHTML = `
        <div class="order-detail-section">
            <h4>Order Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Order ID</div>
                    <div class="detail-value">#${order.id}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Order Date</div>
                    <div class="detail-value">${formatDate(order.createdAt)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Amount</div>
                    <div class="detail-value">₹${order.total?.toFixed(2) || '0.00'}</div>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h4>Customer Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Name</div>
                    <div class="detail-value">${order.customer?.name || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${order.customer?.email || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${order.customer?.phone || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h4>Shipping Address</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${order.shipping?.address || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">City</div>
                    <div class="detail-value">${order.shipping?.city || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">State</div>
                    <div class="detail-value">${order.shipping?.state || 'N/A'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Pincode</div>
                    <div class="detail-value">${order.shipping?.pincode || 'N/A'}</div>
                </div>
            </div>
        </div>

        <div class="order-detail-section">
            <h4>Order Items</h4>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items?.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price?.toFixed(2)}</td>
                            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="4" class="muted">No items</td></tr>'}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                        <td style="font-weight: bold;">₹${order.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    modal.style.display = "block";
}

function updateOrderStats(orders) {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;

    document.getElementById("totalOrders").textContent = total;
    document.getElementById("pendingOrders").textContent = pending;
    document.getElementById("confirmedOrders").textContent = confirmed;
    document.getElementById("shippedOrders").textContent = shipped;
    document.getElementById("deliveredOrders").textContent = delivered;
}

function formatDate(date) {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Sample data - Only used if no orders in Firestore
function getSampleOrders() {
    return [
        {
            id: "ORD001",
            customer: {
                name: "Ramesh Kumar",
                email: "ramesh@example.com",
                phone: "9876543210"
            },
            shipping: {
                address: "123 Gandhi Street",
                city: "Chennai",
                state: "Tamil Nadu",
                pincode: "600001"
            },
            items: [
                { name: "Tirunelveli Halwa", price: 450, quantity: 2 },
                { name: "Milk Halwa", price: 380, quantity: 1 }
            ],
            total: 1280,
            status: "pending",
            createdAt: new Date("2024-12-20T10:30:00")
        },
        {
            id: "ORD002",
            customer: {
                name: "Priya Sharma",
                email: "priya@example.com",
                phone: "8765432109"
            },
            shipping: {
                address: "456 Nehru Road",
                city: "Madurai",
                state: "Tamil Nadu",
                pincode: "625001"
            },
            items: [
                { name: "Wheat Halwa", price: 320, quantity: 3 }
            ],
            total: 960,
            status: "confirmed",
            createdAt: new Date("2024-12-19T14:20:00")
        },
        {
            id: "ORD003",
            customer: {
                name: "Arun Patel",
                email: "arun@example.com",
                phone: "7654321098"
            },
            shipping: {
                address: "789 Rajaji Street",
                city: "Coimbatore",
                state: "Tamil Nadu",
                pincode: "641001"
            },
            items: [
                { name: "Carrot Halwa", price: 280, quantity: 2 },
                { name: "Milk Halwa", price: 380, quantity: 1 },
                { name: "Special Gift Box", price: 150, quantity: 1 }
            ],
            total: 1190,
            status: "shipped",
            createdAt: new Date("2024-12-18T09:15:00")
        }
    ];
}

// Notification function
function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        z-index: 10000;
        font-weight: bold;
        ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
