const orderList = document.querySelector('#admin-orders');
const enquiryList = document.querySelector('#admin-enquiries');
const orderCount = document.querySelector('#admin-order-count');
const enquiryCount = document.querySelector('#admin-enquiry-count');

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

const renderOrders = (orders) => {
  orderCount.textContent = String(orders.length);

  orderList.innerHTML = orders.length
    ? orders
        .slice(0, 8)
        .map(
          (order) => `
            <li class="data-item">
              <strong>#${order.id}</strong><br />
              <small>${order.customerName} • ${order.phone}</small><br />
              <small>${order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}</small><br />
              <small>${formatDate(order.createdAt)} • ${formatCurrency(order.total)}</small>
            </li>
          `,
        )
        .join('')
    : '<li class="data-item"><small>No orders yet.</small></li>';
};

const renderEnquiries = (enquiries) => {
  enquiryCount.textContent = String(enquiries.length);

  enquiryList.innerHTML = enquiries.length
    ? enquiries
        .slice(0, 8)
        .map(
          (enquiry) => `
            <li class="data-item">
              <strong>${enquiry.name}</strong><br />
              <small>${enquiry.email} • ${enquiry.phone || 'No phone'}</small><br />
              <small>${enquiry.message}</small><br />
              <small>${formatDate(enquiry.createdAt)}</small>
            </li>
          `,
        )
        .join('')
    : '<li class="data-item"><small>No enquiries yet.</small></li>';
};

const boot = async () => {
  try {
    const [ordersRes, enquiriesRes] = await Promise.all([
      getJson('/api/orders'),
      getJson('/api/enquiries'),
    ]);

    renderOrders(ordersRes.orders || []);
    renderEnquiries(enquiriesRes.enquiries || []);
  } catch (error) {
    console.error(error);
    orderList.innerHTML = '<li class="data-item"><small>Authentication required. Use the server credentials to access this dashboard.</small></li>';
    enquiryList.innerHTML = '<li class="data-item"><small>Authentication required. Use the server credentials to access this dashboard.</small></li>';
  }
};

boot();
