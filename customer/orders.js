/* =========================
   LOAD MY ORDERS
========================= */
async function loadOrders() {
  try {
    const res = await fetch("/api/orders/my", {
      credentials: "include"
    });

    // 🔒 Not logged in
    if (!res.ok) {
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();
    const container = document.getElementById("orders");

    if (!container) return;

    // 🟡 No orders
    if (!data.orders || data.orders.length === 0) {
      container.innerHTML = `
        <p class="empty-orders">
          You have not placed any orders yet 📦
        </p>
      `;
      return;
    }

    // ✅ Render orders
    container.innerHTML = data.orders.map(order => {
      const statusClass =
        order.status === "Delivered" ? "delivered" :
        order.status === "Out for Delivery" ? "out" :
        "pending";

      return `
        <div class="order-card">

          <!-- HEADER -->
          <div class="order-header">
            <div>
              <div class="order-id">📦 Order ID: ${order._id}</div>
              <div class="order-date">
                🕒 ${new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <span class="order-status ${statusClass}">
              ${order.status}
            </span>
          </div>

          <!-- ITEMS -->
          <div class="order-items">
            <div class="order-items-header">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
            </div>

            ${order.items.map(item => `
              <div class="order-item">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">${item.qty} kg</span>
                <span class="item-price">
                  ₹${item.qty * item.price}
                </span>
              </div>
            `).join("")}
          </div>

          <!-- TOTAL -->
          <div class="order-footer">
            Total: <strong>₹${order.totalAmount}</strong>
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Failed to load orders:", err);
    alert("Something went wrong. Please try again.");
  }
}

/* =========================
   INIT
========================= */
loadOrders();
