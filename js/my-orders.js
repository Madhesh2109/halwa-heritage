// My Orders - Firebase Integration
import { db } from "../firebase/firebase-config.js";
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const auth = getAuth();

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication and load orders
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is logged in - show My Orders link
            document.getElementById('my-orders-link').style.display = 'inline-block';
            await loadUserOrders(user.email);
        } else {
            // User not logged in - redirect to login
            window.location.href = 'auth.html';
        }
    });

    setupEventListeners();
});

let userOrders = [];

async function loadUserOrders(userEmail) {
    const ordersContainer = document.getElementById('ordersContainer');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    
    try {
        ordersContainer.innerHTML = '<div class="loading-spinner">Loading your orders...</div>';
        noOrdersMessage.style.display = 'none';

        // Query orders for this user
        const ordersQuery = query(
            collection(db, "orders"),
            where("customer.email", "==", userEmail),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(ordersQuery);
        userOrders = [];
        
        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            userOrders.push({
                id: doc.id,
                ...orderData,
                createdAt: orderData.createdAt?.toDate() || new Date()
            });
        });

        if (userOrders.length === 0) {
            ordersContainer.style.display = 'none';
            noOrdersMessage.style.display = 'block';
        } else {
            ordersContainer.style.display = 'block';
            noOrdersMessage.style.display = 'none';
            displayOrders(userOrders);
        }

    } catch (error) {
        console.error("Error loading orders:", error);
        ordersContainer.innerHTML = '<div class="error-message">Error loading orders. Please try again.</div>';
    }
}

function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    
    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card" data-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id.substring(0, 8).toUpperCase()}</h3>
                    <div class="order-meta">
                        <span class="order-date">📅 ${formatDate(order.createdAt)}</span>
                        <span class="order-amount">💰 ₹${order.total?.toFixed(2)}</span>
                    </div>
                </div>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>

            <div class="order-items">
                ${order.items?.map(item => `
                    <div class="order-item">
                        <div class="item-info">
                            ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image">` : ''}
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <div class="price">₹${item.price?.toFixed(2)} × ${item.quantity}</div>
                            </div>
                        </div>
                        <div class="item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="order-footer">
                <div class="order-total">Total: ₹${order.total?.toFixed(2)}</div>
                <div class="order-actions">
                    <button class="btn-outline view-order-details" data-id="${order.id}">View Details</button>
                    ${order.status === 'delivered' ? '<button class="btn-outline reorder-btn" data-id="${order.id}">Reorder</button>' : ''}
                </div>
            </div>
        </div>
    `).join('');

    attachOrderEventListeners();
}

function setupEventListeners() {
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    
    // Refresh button
    document.getElementById('refreshOrders').addEventListener('click', async () => {
        const user = auth.currentUser;
        if (user) {
            await loadUserOrders(user.email);
        }
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('orderModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (statusFilter === 'all') {
        displayOrders(userOrders);
    } else {
        const filteredOrders = userOrders.filter(order => order.status === statusFilter);
        displayOrders(filteredOrders);
    }
}

function attachOrderEventListeners() {
    // View order details
    document.querySelectorAll('.view-order-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.id;
            const order = userOrders.find(o => o.id === orderId);
            if (order) {
                showOrderDetails(order);
            }
        });
    });

    // Reorder functionality
    document.querySelectorAll('.reorder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.id;
            const order = userOrders.find(o => o.id === orderId);
            if (order) {
                reorderItems(order);
            }
        });
    });
}

function showOrderDetails(order) {
    const modal = document.getElementById('orderModal');
    const modalBody = document.getElementById('modalBody');
    
    document.getElementById('modalTitle').textContent = `Order #${order.id.substring(0, 8).toUpperCase()}`;
    
    modalBody.innerHTML = `
        <div class="order-detail-section">
            <h4>Order Information</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Order ID</div>
                    <div class="detail-value">${order.id}</div>
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
                    <div class="detail-label">Payment Method</div>
                    <div class="detail-value">${order.paymentMethod || 'N/A'}</div>
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
            <h4>Order Summary</h4>
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
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Subtotal:</td>
                        <td style="font-weight: bold;">₹${order.subtotal?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Shipping:</td>
                        <td style="font-weight: bold;">₹${order.shipping?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Total:</td>
                        <td style="font-weight: bold;">₹${order.total?.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    modal.style.display = "block";
}

function reorderItems(order) {
    if (order.items && order.items.length > 0) {
        // Add items to cart
        const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
        order.items.forEach(item => {
            const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                currentCart.push({
                    id: item.id || Date.now().toString(),
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                });
            }
        });
        
        localStorage.setItem('cart', JSON.stringify(currentCart));
        
        // Show success message and redirect to cart
        alert('Items added to cart! Redirecting to cart...');
        window.location.href = 'cart.html';
    }
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
