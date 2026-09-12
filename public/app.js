const state = {
  menu: [],
  categories: [],
  cart: [],
  favoriteIds: new Set(),
  visitorId: localStorage.getItem('redchilly-visitor-id') || crypto.randomUUID(),
  activeCategory: 'All',
  activeDiet: 'All',
  restaurant: null,
};

const els = {
  restaurantName: document.querySelector('#restaurant-name'),
  tagline: document.querySelector('#restaurant-tagline'),
  ratingValue: document.querySelector('#rating-value'),
  reviewCount: document.querySelector('#review-count'),
  directionsLink: document.querySelector('#directions-link'),
  restaurantAddress: document.querySelector('#restaurant-address'),
  restaurantPhone: document.querySelector('#restaurant-phone'),
  restaurantHours: document.querySelector('#restaurant-hours'),
  featuredItems: document.querySelector('#featured-items'),
  categoryList: document.querySelector('#menu-categories'),
  menuItems: document.querySelector('#menu-items'),
  cartItems: document.querySelector('#cart-items'),
  cartCount: document.querySelector('#cart-count'),
  cartTotal: document.querySelector('#cart-total'),
  reviewsList: document.querySelector('#reviews-list'),
  menuSearch: document.querySelector('#menu-search'),
  orderForm: document.querySelector('#order-form'),
  contactForm: document.querySelector('#contact-form'),
  clearCart: document.querySelector('#clear-cart'),
  menuDetailDialog: document.querySelector('#menu-detail-dialog'),
  menuDetailContent: document.querySelector('#menu-detail-content'),
  menuDetailClose: document.querySelector('#menu-detail-close'),
  themeToggle: document.querySelector('#theme-toggle'),
  year: document.querySelector('#year'),
  whatsappOrder: document.querySelector('#whatsapp-order'),
  trackingForm: document.querySelector('#tracking-form'),
  trackingResult: document.querySelector('#tracking-result'),
  reservationForm: document.querySelector('#reservation-form'),
};

localStorage.setItem('redchilly-visitor-id', state.visitorId);

const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed.' }));
    throw new Error(errorData.message || 'Request failed.');
  }

  return response.json();
};

const applyTheme = (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);
  if (els.themeToggle) {
    els.themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  }
  localStorage.setItem('redchilly-theme', isDark ? 'dark' : 'light');
};

const renderRestaurant = (restaurant) => {
  state.restaurant = restaurant;

  els.restaurantName.textContent = restaurant.name;
  els.tagline.textContent = restaurant.tagline;
  els.ratingValue.textContent = restaurant.rating;
  els.reviewCount.textContent = restaurant.reviewCount;
  els.restaurantAddress.textContent = restaurant.address;
  els.restaurantPhone.textContent = restaurant.phone;
  els.restaurantPhone.href = restaurant.socialLinks.call;
  els.restaurantHours.textContent = restaurant.hours;
  els.directionsLink.href = restaurant.socialLinks.directions;
  els.year.textContent = new Date().getFullYear();
};

const renderFeaturedItems = () => {
  const featured = state.menu.slice(0, 5);

  els.featuredItems.innerHTML = featured
    .map(
      (item) => `
        <li>
          <div class="name">${item.name}</div>
          <div class="price">${formatCurrency(item.price)}</div>
        </li>
      `,
    )
    .join('');
};

const renderCategories = () => {
  const categories = ['All', ...state.categories];

  els.categoryList.innerHTML = `
    <div class="diet-filters" aria-label="Filter by dietary preference">
      ${['All', 'Veg', 'Non-Veg']
        .map(
          (diet) => `
            <button class="${diet === state.activeDiet ? 'active' : ''}" data-diet="${diet}">
              ${diet}
            </button>
          `,
        )
        .join('')}
    </div>
    <ul class="category-list">
      ${categories
        .map(
          (category) => `
            <li>
              <button class="${category === state.activeCategory ? 'active' : ''}" data-category="${category}">
                ${category}
              </button>
            </li>
          `,
        )
        .join('')}
    </ul>
  `;

  els.categoryList.querySelectorAll('[data-diet]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeDiet = button.dataset.diet;
      renderMenu();
      renderCategories();
    });
  });

  els.categoryList.querySelectorAll('button').forEach((button) => {
    if (!button.dataset.category) return;
    button.addEventListener('click', () => {
      state.activeCategory = button.dataset.category;
      renderMenu();
      renderCategories();
    });
  });
};

const getFilteredMenu = () => {
  const query = els.menuSearch.value.trim().toLowerCase();

  return state.menu.filter((item) => {
    const matchesCategory = state.activeCategory === 'All' || item.category === state.activeCategory;
    const matchesDiet =
      state.activeDiet === 'All' ||
      (state.activeDiet === 'Veg' && item.veg) ||
      (state.activeDiet === 'Non-Veg' && !item.veg);
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesCategory && matchesDiet && matchesSearch;
  });
};

const renderMenu = () => {
  const items = getFilteredMenu();

  els.menuItems.innerHTML = items
    .map(
      (item) => `
        <article class="menu-item">
          <button class="menu-image-button" data-detail-id="${item.id}" type="button" aria-label="View details for ${item.name}">
            <img class="menu-item-image" src="${item.image}" alt="${item.name}" loading="lazy" />
          </button>

          <div class="item-top">
            <h4>${item.name}</h4>
            <span class="item-price">${formatCurrency(item.price)}</span>
          </div>

          <div class="item-badges">
            <span class="tag ${item.veg ? 'veg' : 'nonveg'}">${item.veg ? 'Veg' : 'Non-Veg'}</span>
            <span class="tag">${item.category}</span>
          </div>

          <p class="item-description">${item.description}</p>

          <div class="item-footer">
            <span class="item-price">${formatCurrency(item.price)}</span>
            <div class="item-actions">
              <button class="favorite-btn ${state.favoriteIds.has(item.id) ? 'active' : ''}" data-favorite-id="${item.id}" type="button" aria-label="${state.favoriteIds.has(item.id) ? 'Remove from favourites' : 'Add to favourites'}">
                ${state.favoriteIds.has(item.id) ? '♥' : '♡'}
              </button>
              <button class="add-btn" data-item-id="${item.id}">Add</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  els.menuItems.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.itemId));
  });
  els.menuItems.querySelectorAll('.menu-image-button').forEach((button) => {
    button.addEventListener('click', () => openMenuDetails(button.dataset.detailId));
  });
  els.menuItems.querySelectorAll('.favorite-btn').forEach((button) => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.favoriteId));
  });
};

const openMenuDetails = async (itemId) => {
  try {
    const { item } = await fetchJson(`/api/menu/${encodeURIComponent(itemId)}`);
    const isFavorite = state.favoriteIds.has(item.id);
    els.menuDetailContent.innerHTML = `
      <img class="detail-image" src="${item.image}" alt="${item.name}" />
      <div class="detail-copy">
        <div class="item-badges">
          <span class="tag ${item.veg ? 'veg' : 'nonveg'}">${item.veg ? 'Veg' : 'Non-Veg'}</span>
          <span class="tag">${item.category}</span>
        </div>
        <h2>${item.name}</h2>
        <p>${item.description}</p>
        <div class="detail-meta">
          <strong>${formatCurrency(item.price)}</strong>
          <span>Freshly prepared to order</span>
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary detail-add-btn" type="button">Add to order</button>
          <button class="btn btn-secondary detail-favorite-btn" type="button">${isFavorite ? 'Remove favourite' : 'Save favourite'}</button>
        </div>
      </div>
    `;
    els.menuDetailContent.querySelector('.detail-add-btn').addEventListener('click', () => {
      addToCart(item.id);
      els.menuDetailDialog.close();
    });
    els.menuDetailContent.querySelector('.detail-favorite-btn').addEventListener('click', async () => {
      await toggleFavorite(item.id);
      openMenuDetails(item.id);
    });
    els.menuDetailDialog.showModal();
  } catch (error) {
    alert(error.message);
  }
};

const toggleFavorite = async (itemId) => {
  const favorite = !state.favoriteIds.has(itemId);
  try {
    const result = await fetchJson('/api/favorites', {
      method: 'PUT',
      body: JSON.stringify({ visitorId: state.visitorId, itemId, favorite }),
    });
    state.favoriteIds = new Set(result.favoriteIds);
    renderMenu();
  } catch (error) {
    alert(error.message);
  }
};

const loadFavorites = async () => {
  const result = await fetchJson(`/api/favorites?visitorId=${encodeURIComponent(state.visitorId)}`);
  state.favoriteIds = new Set(result.favoriteIds);
};

const addToCart = (itemId) => {
  const item = state.menu.find((menuItem) => menuItem.id === itemId);
  if (!item) return;

  const existing = state.cart.find((cartItem) => cartItem.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...item, quantity: 1 });
  }

  renderCart();
};

const changeQty = (itemId, delta) => {
  const item = state.cart.find((cartItem) => cartItem.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((cartItem) => cartItem.id !== itemId);
  }

  renderCart();
};

const renderCart = () => {
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (state.cart.length === 0) {
    els.cartItems.innerHTML = '<p class="empty-state">Your cart is empty. Add a few favourites to get started.</p>';
  } else {
    els.cartItems.innerHTML = state.cart
      .map(
        (item) => `
          <div class="cart-item">
            <div class="cart-item-row">
              <span class="cart-item-name">${item.name}</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
            <div class="cart-item-row">
              <div class="cart-item-controls">
                <button class="qty-btn" data-action="decrease" data-item-id="${item.id}">−</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-item-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        `,
      )
      .join('');

    els.cartItems.querySelectorAll('.qty-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const { itemId, action } = button.dataset;
        changeQty(itemId, action === 'increase' ? 1 : -1);
      });
    });
  }

  els.cartCount.textContent = totalItems;
  els.cartTotal.textContent = formatCurrency(totalPrice);
  if (els.whatsappOrder) {
    const message = `Hello New Red Chilly! I would like to order: ${state.cart.map((item) => `${item.quantity}x ${item.name}`).join(', ')}. Total: ${formatCurrency(totalPrice)}`;
    els.whatsappOrder.href = `https://wa.me/918828826565?text=${encodeURIComponent(message)}`;
  }
};

const renderReviews = (reviews) => {
  els.reviewsList.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-head">
            <h4>${review.name}</h4>
            <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
          </div>
          <p>“${review.text}”</p>
        </article>
      `,
    )
    .join('');
};

const boot = async () => {
  const savedTheme = localStorage.getItem('redchilly-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'dark' : true);

  if (els.themeToggle) {
    els.themeToggle.addEventListener('click', () => {
      applyTheme(!document.body.classList.contains('dark-mode'));
    });
  }

  try {
    const [restaurant, menuResponse, reviews] = await Promise.all([
      fetchJson('/api/restaurant'),
      fetchJson('/api/menu'),
      fetchJson('/api/reviews'),
      loadFavorites(),
    ]);

    renderRestaurant(restaurant);
    state.menu = menuResponse.items;
    state.categories = menuResponse.categories;
    renderFeaturedItems();
    renderCategories();
    renderMenu();
    renderReviews(reviews);
    renderCart();
  } catch (error) {
    console.error(error);
    els.menuItems.innerHTML = '<p class="empty-state">Unable to load menu right now.</p>';
  }
};

els.menuSearch.addEventListener('input', () => {
  renderMenu();
});

els.clearCart.addEventListener('click', () => {
  state.cart = [];
  renderCart();
});

els.menuDetailClose.addEventListener('click', () => {
  els.menuDetailDialog.close();
});

els.menuDetailDialog.addEventListener('click', (event) => {
  if (event.target === els.menuDetailDialog) {
    els.menuDetailDialog.close();
  }
});

els.orderForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (state.cart.length === 0) {
    alert('Add at least one item before placing the order.');
    return;
  }

  const formData = new FormData(els.orderForm);
  const payload = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    pincode: formData.get('pincode'),
    paymentMethod: formData.get('paymentMethod') || 'cod',
    visitorId: state.visitorId,
    items: state.cart.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
    total: state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };

  try {
    if (payload.pincode) {
      const delivery = await fetchJson(`/api/delivery/validate?pincode=${encodeURIComponent(payload.pincode)}`);
      if (!delivery.valid) throw new Error('We do not deliver to this pincode yet.');
    }
    if (payload.paymentMethod === 'razorpay') {
      const payment = await fetchJson('/api/payments/razorpay/order', { method: 'POST', body: JSON.stringify({ amount: payload.total }) });
      if (!payment.configured) throw new Error(payment.message);
      await new Promise((resolve, reject) => {
        const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve; script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
        document.head.appendChild(script);
      });
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({ key: payment.keyId, amount: payment.order.amount, currency: 'INR', name: state.restaurant?.name || 'New Red Chilly', order_id: payment.order.id,
          handler: async (response) => { try { await fetchJson('/api/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(response) }); payload.paymentId = response.razorpay_payment_id; resolve(); } catch (error) { reject(error); } },
          modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) } });
        checkout.open();
      });
    }
    const result = await fetchJson('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    alert(`${result.message} Your order ID is ${result.order.id}.`);
    state.cart = [];
    renderCart();
    els.orderForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

els.trackingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = new FormData(els.trackingForm).get('orderId');
  try { const result = await fetchJson(`/api/orders/${encodeURIComponent(id)}`); els.trackingResult.textContent = `${result.order.id}: ${result.order.status} (${new Date(result.order.updatedAt || result.order.createdAt).toLocaleString('en-IN')})`; }
  catch (error) { els.trackingResult.textContent = error.message; }
});

els.reservationForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try { const result = await fetchJson('/api/reservations', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(els.reservationForm))) }); alert(result.message); els.reservationForm.reset(); }
  catch (error) { alert(error.message); }
});

els.contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(els.contactForm);

  try {
    const result = await fetchJson('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
      }),
    });

    alert(result.message);
    els.contactForm.reset();
  } catch (error) {
    alert(error.message);
  }
});

boot();
