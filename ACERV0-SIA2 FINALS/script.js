document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = localStorage.getItem('plashdrive_user');
    
    if (userData) {
        updateNavForLoggedInUser(JSON.parse(userData));
    }

    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('plashdrive_cart')) || [];
    updateCartCount();

    // Add to Cart Button Click Event
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Check if user is logged in
            if (!localStorage.getItem('plashdrive_user')) {
                showNotification('Please login to add items to cart');
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                return;
            }

            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productImage = this.closest('.card').querySelector('img').src;
            
            // Check if product already exists in cart
            const existingProductIndex = cart.findIndex(item => item.id === productId);
            
            if (existingProductIndex !== -1) {
                // Product already in cart, increase quantity
                cart[existingProductIndex].quantity += 1;
            } else {
                // Add new product to cart
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            
            // Save cart to localStorage
            localStorage.setItem('plashdrive_cart', JSON.stringify(cart));
            
            // Update cart count
            updateCartCount();
            
            // Show notification
            showNotification(`${productName} added to cart!`);
        });
    });

    // Login form submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const error = document.getElementById('loginError');
            
            // Simple validation (in a real app, validate against server)
            if (username && password) {
                // For demo, store basic user data
                const userData = {
                    username,
                    firstName: username // Default to username if no first name
                };
                localStorage.setItem('plashdrive_user', JSON.stringify(userData));
                
                // Update UI
                updateNavForLoggedInUser(userData);
                
                // Hide modal
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                loginModal.hide();
                
                // Show welcome message
                showNotification(`Welcome back, ${username}!`);
            } else {
                error.classList.remove('d-none');
            }
        });
    }

    // Signup form submit
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const error = document.getElementById('signupError');
            const success = document.getElementById('signupSuccess');
            
            if (password !== confirmPassword) {
                error.classList.remove('d-none');
                success.classList.add('d-none');
                return;
            }
            
            // Save complete user data
            const userData = {
                firstName,
                lastName,
                email,
                username
            };
            localStorage.setItem('plashdrive_user', JSON.stringify(userData));
            
            // Update UI
            updateNavForLoggedInUser(userData);
            
            // Show success message
            error.classList.add('d-none');
            success.classList.remove('d-none');
            
            // Clear form
            signupForm.reset();
            
            // Hide modal after delay
            setTimeout(() => {
                const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                signupModal.hide();
                showNotification(`Welcome, ${firstName}! Your account has been created.`);
            }, 1500);
        });
    }

    // Logout functionality
    document.addEventListener('click', function(e) {
        if (e.target.id === 'logoutLink') {
            e.preventDefault();
            localStorage.removeItem('plashdrive_user');
            updateNavForLoggedOutUser();
            showNotification('You have been logged out.');
        }
    });

    // Auto-fill checkout form with user data
    function autoFillCheckoutForm() {
        const userData = JSON.parse(localStorage.getItem('plashdrive_user'));
        if (userData) {
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = userData.email || '';
        }
    }

    // Update navbar for logged in user
    function updateNavForLoggedInUser(userData) {
        const user = typeof userData === 'string' ? { username: userData } : userData;
        document.getElementById('loginNavItem').classList.add('d-none');
        document.getElementById('signupNavItem').classList.add('d-none');
        document.getElementById('welcomeNavItem').classList.remove('d-none');
        document.getElementById('logoutNavItem').classList.remove('d-none');
        document.getElementById('usernameDisplay').textContent = user.username || user.firstName || userData;
    }

    // Update navbar for logged out user
    function updateNavForLoggedOutUser() {
        document.getElementById('loginNavItem').classList.remove('d-none');
        document.getElementById('signupNavItem').classList.remove('d-none');
        document.getElementById('welcomeNavItem').classList.add('d-none');
        document.getElementById('logoutNavItem').classList.add('d-none');
    }

    // Update cart count in navbar
    function updateCartCount() {
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        const cartLink = document.querySelector('.nav-link[href="cart.html"]');
        
        if (cartLink) {
            if (cartCount > 0) {
                cartLink.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart (${cartCount})`;
            } else {
                cartLink.innerHTML = `<i class="fas fa-shopping-cart"></i> Cart`;
            }
        }
    }

    // Show notification
    function showNotification(message) {
        let notificationContainer = document.getElementById('notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Cart Page Functionality
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
        setupCartEvents();
    }

    // Render cart items
    function renderCart() {
        const cartTable = document.getElementById('cartTable');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const cartItemsList = document.getElementById('cartItemsList');
        
        if (!cartItemsList) return;
        
        cartItemsList.innerHTML = '';
        
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
            if (cartTable) cartTable.classList.add('d-none');
        } else {
            if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
            if (cartTable) cartTable.classList.remove('d-none');
            
            cart.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3">
                            <div>
                                <h6 class="cart-item-title mb-0">${item.name}</h6>
                                <small class="text-muted">ID: ${item.id}</small>
                            </div>
                        </div>
                    </td>
                    <td>₱${item.price.toFixed(2)}</td>
                    <td>
                        <div class="input-group input-group-sm quantity-control">
                            <button class="btn btn-outline-secondary quantity-btn decrease" data-id="${item.id}">-</button>
                            <input type="text" class="form-control quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="btn btn-outline-secondary quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td>₱${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                cartItemsList.appendChild(row);
            });
        }
        
        updateOrderSummary();
    }

    // Setup cart events
    function setupCartEvents() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('increase') || e.target.closest('.increase')) {
                const btn = e.target.classList.contains('increase') ? e.target : e.target.closest('.increase');
                const productId = btn.getAttribute('data-id');
                changeQuantity(productId, 1);
            } else if (e.target.classList.contains('decrease') || e.target.closest('.decrease')) {
                const btn = e.target.classList.contains('decrease') ? e.target : e.target.closest('.decrease');
                const productId = btn.getAttribute('data-id');
                changeQuantity(productId, -1);
            } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
                const btn = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
                const productId = btn.getAttribute('data-id');
                removeItem(productId);
            }
        });

        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('quantity-input')) {
                const productId = e.target.getAttribute('data-id');
                const newQuantity = parseInt(e.target.value);
                
                if (isNaN(newQuantity) || newQuantity < 1) {
                    e.target.value = 1;
                    updateItemQuantity(productId, 1);
                } else {
                    updateItemQuantity(productId, newQuantity);
                }
            }
        });

        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', function() {
                clearCart();
            });
        }

        const applyPromoBtn = document.getElementById('applyPromoBtn');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', function() {
                const promoCode = document.getElementById('promoCode').value.trim();
                
                if (promoCode) {
                    if (promoCode.toUpperCase() === 'PINOY10') {
                        localStorage.setItem('plashdrive_promo', JSON.stringify({
                            code: promoCode,
                            discount: 0.1
                        }));
                        showNotification('Promo code applied successfully!');
                        updateOrderSummary();
                    } else {
                        showNotification('Invalid promo code!');
                    }
                }
            });
        }

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                // Check if user is logged in
                if (!localStorage.getItem('plashdrive_user')) {
                    showNotification('Please login to proceed to checkout');
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                    return;
                }

                if (cart.length === 0) {
                    showNotification('Your cart is empty!');
                    return;
                }
                
                document.querySelector('.cart-section').classList.add('d-none');
                document.getElementById('checkoutSection').classList.remove('d-none');
                
                // Auto-fill user information
                autoFillCheckoutForm();
                
                renderCheckoutSummary();
            });
        }

        const backToCartBtn = document.getElementById('backToCartBtn');
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', function() {
                document.querySelector('.cart-section').classList.remove('d-none');
                document.getElementById('checkoutSection').classList.add('d-none');
            });
        }

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', function() {
                const form = document.getElementById('checkoutForm');
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                placeOrderBtn.disabled = true;
                placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
                
                setTimeout(() => {
                    const orderNumber = Math.floor(100000 + Math.random() * 900000);
                    document.getElementById('orderNumber').textContent = orderNumber;
                    
                    const orderConfirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
                    orderConfirmationModal.show();
                    
                    clearCart();
                    
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerHTML = 'Place Order';
                }, 2000);
            });
        }
    }

    // Cart quantity functions
    function changeQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const newQuantity = cart[itemIndex].quantity + change;
            
            if (newQuantity < 1) return;
            
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('plashdrive_cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    }

    function updateItemQuantity(productId, quantity) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('plashdrive_cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    }

    function removeItem(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('plashdrive_cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }

    function clearCart() {
        cart = [];
        localStorage.removeItem('plashdrive_cart');
        localStorage.removeItem('plashdrive_promo');
        renderCart();
        updateCartCount();
    }

    // Update order summary
    function updateOrderSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('totalAmount');
        
        if (!subtotalElement) return;
        
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        subtotalElement.textContent = `₱${subtotal.toFixed(2)}`;
        
        const shipping = subtotal > 0 ? 150 : 0;
        shippingElement.textContent = `₱${shipping.toFixed(2)}`;
        
        const tax = subtotal * 0.12;
        taxElement.textContent = `₱${tax.toFixed(2)}`;
        
        const promo = JSON.parse(localStorage.getItem('plashdrive_promo')) || null;
        let discount = 0;
        
        if (promo) {
            discount = subtotal * promo.discount;
        }
        
        const total = subtotal + shipping + tax - discount;
        totalElement.textContent = `₱${total.toFixed(2)}`;
    }

    // Render checkout summary
    function renderCheckoutSummary() {
        const checkoutItemsList = document.getElementById('checkoutItemsList');
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutShipping = document.getElementById('checkoutShipping');
        const checkoutTax = document.getElementById('checkoutTax');
        const checkoutTotal = document.getElementById('checkoutTotal');
        
        if (!checkoutItemsList) return;
        
        checkoutItemsList.innerHTML = '';
        
        cart.forEach(item => {
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-details">
                    <h6>${item.name}</h6>
                    <span class="item-quantity">Qty: ${item.quantity}</span>
                </div>
                <div class="checkout-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
            `;
            checkoutItemsList.appendChild(checkoutItem);
        });
        
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        checkoutSubtotal.textContent = `₱${subtotal.toFixed(2)}`;
        
        const shipping = 150;
        checkoutShipping.textContent = `₱${shipping.toFixed(2)}`;
        
        const tax = subtotal * 0.12;
        checkoutTax.textContent = `₱${tax.toFixed(2)}`;
        
        const promo = JSON.parse(localStorage.getItem('plashdrive_promo')) || null;
        let discount = 0;
        
        if (promo) {
            discount = subtotal * promo.discount;
            
            const discountLine = document.createElement('div');
            discountLine.className = 'd-flex justify-content-between mb-3 text-success';
            discountLine.innerHTML = `
                <span>Discount (${promo.code})</span>
                <span>-₱${discount.toFixed(2)}</span>
            `;
            checkoutTotal.parentNode.insertBefore(discountLine, checkoutTotal.parentNode.querySelector('hr:last-of-type'));
        }
        
        const total = subtotal + shipping + tax - discount;
        checkoutTotal.textContent = `₱${total.toFixed(2)}`;
    }

    // Product filter functionality
    if (window.location.pathname.includes('products.html')) {
        setupProductFilters();
    }

    function setupProductFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                filterProducts();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                filterProducts();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    filterProducts();
                }
            });
        }
    }

    function filterProducts() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const productItems = document.querySelectorAll('.product-item');
        
        if (!categoryFilter || !searchInput) return;
        
        const selectedCategory = categoryFilter.value;
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        productItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const title = item.querySelector('.card-title').textContent.toLowerCase();
            const description = item.querySelector('.card-text').textContent.toLowerCase();
            
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
            const matchesSearch = searchTerm === '' || title.includes(searchTerm) || description.includes(searchTerm);
            
            if (matchesCategory && matchesSearch) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
});