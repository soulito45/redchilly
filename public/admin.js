const orderList = document.querySelector('#admin-orders');
const enquiryList = document.querySelector('#admin-enquiries');
const orderCount = document.querySelector('#admin-order-count');
const enquiryCount = document.querySelector('#admin-enquiry-count');
const revenueValue = document.querySelector('#admin-revenue');
const averageOrderValue = document.querySelector('#admin-average-order');
const refreshButton = document.querySelector('#refresh-dashboard');
const reservationList = document.querySelector('#admin-reservations');
const statusSummary = document.querySelector('#admin-status-summary');

const formatCurrency = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

const getJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${btoa('admin:redchilly123')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to load dashboard data' }));
    throw new Error(errorData.message || 'Failed to load dashboard data');
  }
  return response.json();
};

const formatDate = (value) => new Date(value).toLocaleString('en-IN');
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character]));

const renderOrders = (orders) => {
  orderCount.textContent = String(orders.length);
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  revenueValue.textContent = formatCurrency(revenue);
  averageOrderValue.textContent = formatCurrency(orders.length ? revenue / orders.length : 0);

  orderList.innerHTML = orders.length
    ? orders
        .slice(0, 8)
        .map(
          (order) => `
            <li class="data-item">
              <div class="data-item-head">
                <strong>#${escapeHtml(order.id)}</strong>
                <span><span class="status-badge">${escapeHtml(order.status || 'Received')}</span>
                <select class="status-select" data-order-id="${escapeHtml(order.id)}"><option>Received</option><option>Preparing</option><option>Ready</option><option>Out for delivery</option><option>Delivered</option><option>Cancelled</option></select></span>
              </div>
              <div class="data-item-content">${escapeHtml(order.customerName)} · ${escapeHtml(order.phone)}</div>
              <div class="data-item-content">${order.items.map((item) => `${escapeHtml(item.quantity)}x ${escapeHtml(item.name)}`).join(', ')}</div>
              <div class="data-item-meta">
                <span>${escapeHtml(formatDate(order.createdAt))}</span>
                <strong>${formatCurrency(order.total)}</strong>
              </div>
            </li>
          `,
        )
        .join('')
    : '<li class="empty-dashboard">No orders yet.</li>';
  orderList.querySelectorAll('.status-select').forEach((select) => {
    const order = orders.find((entry) => entry.id === select.dataset.orderId); if (order) select.value = order.status || 'Received';
    select.addEventListener('change', async () => {
      await fetch('/api/orders/' + encodeURIComponent(select.dataset.orderId) + '/status', { method: 'PATCH', headers: { Authorization: `Basic ${btoa('admin:redchilly123')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value }) });
      boot();
    });
  });
};

const renderReservations = (reservations) => {
  reservationList.innerHTML = reservations.length ? reservations.slice(0, 8).map((entry) => `<li class="data-item"><strong>${escapeHtml(entry.name)}</strong><div class="data-item-meta">${escapeHtml(entry.date)} at ${escapeHtml(entry.time)} · ${escapeHtml(entry.guests)} guests</div><small>${escapeHtml(entry.phone)}</small></li>`).join('') : '<li class="empty-dashboard">No reservations yet.</li>';
};

const renderEnquiries = (enquiries) => {
  enquiryCount.textContent = String(enquiries.length);

  enquiryList.innerHTML = enquiries.length
    ? enquiries
        .slice(0, 8)
        .map(
          (enquiry) => `
            <li class="data-item">
              <div class="data-item-head">
                <strong>${escapeHtml(enquiry.name)}</strong>
                <small>${escapeHtml(formatDate(enquiry.createdAt))}</small>
              </div>
              <div class="data-item-meta">
                <span>${escapeHtml(enquiry.email)}</span>
                <span>${escapeHtml(enquiry.phone || 'No phone')}</span>
              </div>
              <p class="data-item-content">${escapeHtml(enquiry.message)}</p>
            </li>
          `,
        )
        .join('')
    : '<li class="empty-dashboard">No enquiries yet.</li>';
};

const boot = async () => {
  refreshButton.disabled = true;
  refreshButton.textContent = 'Refreshing...';
  try {
    const [ordersRes, enquiriesRes, analyticsRes, reservationsRes] = await Promise.all([
      getJson('/api/orders'),
      getJson('/api/enquiries'),
      getJson('/api/analytics'),
      getJson('/api/reservations'),
    ]);

    renderOrders(ordersRes.orders || []);
    renderEnquiries(enquiriesRes.enquiries || []);
    renderReservations(reservationsRes.reservations || []);
    statusSummary.textContent = Object.entries(analyticsRes.byStatus || {}).map(([status, count]) => `${status}: ${count}`).join(' · ') || 'No sales yet.';
  } catch (error) {
    console.error(error);
    orderList.innerHTML = '<li class="empty-dashboard">Authentication required. Use the server credentials to access this dashboard.</li>';
    enquiryList.innerHTML = '<li class="empty-dashboard">Authentication required. Use the server credentials to access this dashboard.</li>';
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Refresh data';
  }
};

refreshButton.addEventListener('click', boot);
boot();
