// products.js — Django API Integrated Version for Halwa Delights

document.addEventListener('DOMContentLoaded', () => {
    const categoryFilter = document.querySelector('#categoryFilter');
    const priceFilter = document.querySelector('#priceFilter');
    const resetFilters = document.querySelector('#resetFilters');
    const productGrid = document.querySelector('.product-grid');
    let allProducts = [];

    // Fetch products from Django API
    async function fetchProducts()
    {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) loadingMessage.style.display = 'block';
        
        try
        {
            const response = await fetch('/api/products/');
            if (!response.ok) throw new Error('Failed to load products');
            allProducts = await response.json();
            if (Array.isArray(allProducts) && allProducts.length > 0)
            {
                renderProducts(allProducts);
            }
        }
        catch (err)
        {
            console.warn('Backend not available — showing default HTML products.');
        }
        finally
        {
            if (loadingMessage) loadingMessage.style.display = 'none';
        }
    }

    // Render products into HTML
    function renderProducts(products) {
        productGrid.innerHTML = products.map(p => `
            <div class="product-card" data-id="${p.id}">
                <div class="product-image">
                    <img src="${p.image_url}" alt="${p.name}">
                </div>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <span class="price">Rs.${p.price}/kg</span>
                <button class="add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
            </div>
        `).join('');

        // Rebind add-to-cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => addToCart(btn.dataset.id));
        });
    }

    // Add product to cart
    async function addToCart(productId) {
        try {
            const response = await fetch('/api/cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            if (!response.ok) throw new Error('Add to cart failed');
            showNotification('Product added to cart successfully!', 'success');
        } catch (err) {
            console.error('Error adding to cart:', err);
            showNotification('Failed to add to cart.', 'error');
        }
    }

    // Apply category & price filters
    function applyFilters() {
        const category = categoryFilter.value;
        const price = priceFilter.value;
        let filtered = [...allProducts];

        if (category !== 'all') {
            filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }

        if (price !== 'all') {
            filtered = filtered.filter(p => {
                if (price === 'low') return p.price < 400;
                if (price === 'medium') return p.price >= 400 && p.price <= 600;
                if (price === 'high') return p.price > 600;
                return true;
            });
        }

        renderProducts(filtered);
    }

    // Reset filters
    resetFilters.addEventListener('click', () => {
        categoryFilter.value = 'all';
        priceFilter.value = 'all';
        renderProducts(allProducts);
    });

    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);

    // Auto-refresh products every 30 seconds
    setInterval(fetchProducts, 30000);

    // Initial load
    fetchProducts();
});


// Utility: get CSRF token for Django POST requests
function getCSRFToken() {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let c of cookies) {
        c = c.trim();
        if (c.startsWith(name)) return c.substring(name.length);
    }
    return '';
}

// Popup Notification
function showNotification(message, type) {
    const div = document.createElement('div');
    div.className = `product-notification ${type}`;
    div.textContent = message;
    document.body.appendChild(div);

    setTimeout(() => {
        div.classList.add('hide');
        setTimeout(() => div.remove(), 300);
    }, 4000);
}
