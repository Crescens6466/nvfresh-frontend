async function loadOrders() {
  const res = await fetch("/api/orders", {
    credentials: "include" // 🔥 REQUIRED
  });

  if (!res.ok) {
    alert("Admin login required");
    window.location.href = "/admin/login.html";
    return;
  }

  const orders = await res.json();

  const table = document.getElementById("ordersTable");
  table.innerHTML = "";

  orders.forEach(o => {
    table.innerHTML += `
      <tr>
        <td>
          <strong>${o.customerName}</strong><br>
          ${o.address}
        </td>
        <td>
          <a href="tel:${o.phone}">${o.phone}</a>
        </td>
        <td>
          ${o.items.map(i => `
            ${i.name} (${i.qty}kg)
          `).join("<br>")}
        </td>
        <td>₹${o.totalAmount}</td>
        <td>${o.status}</td>
        <td>
          <select onchange="updateStatus('${o._id}', this.value)">
            <option ${o.status==="Pending"?"selected":""}>Pending</option>
            <option ${o.status==="Out for Delivery"?"selected":""}>Out for Delivery</option>
            <option ${o.status==="Delivered"?"selected":""}>Delivered</option>
            <option ${o.status==="Cancelled"?"selected":""}>Cancelled</option>
          </select>
        </td>
      </tr>
    `;
  });
}

async function updateStatus(id, status) {
  await fetch(`/api/orders/${id}/status`, {
    method: "PUT",
    credentials: "include", // 🔥 REQUIRED
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
}

loadOrders();
