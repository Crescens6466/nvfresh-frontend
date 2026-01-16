async function loadCustomer() {
  const area = document.getElementById("customerArea");
  if (!area) return;

  try {
    const res = await fetch("/api/customer/me", { credentials: "include" });
    if (!res.ok) {
      area.innerHTML = `<a href="login.html">Login</a>`;
      return;
    }

    const data = await res.json();
    if (!data.customer) {
      area.innerHTML = `<a href="login.html">Login</a>`;
      return;
    }

    area.innerHTML = `
      <div class="customer-dropdown-wrapper">
        <span class="customer-name" onclick="toggleCustomerMenu()">
          👋 ${data.customer.name} <span class="arrow">▾</span>
        </span>
        <div id="customerMenu" class="customer-menu">
          <a href="orders.html">📦 Order History</a>
          <a href="#" onclick="logout()">🚪 Logout</a>
        </div>
      </div>
    `;
  } catch {
    area.innerHTML = `<a href="login.html">Login</a>`;
  }
}

window.toggleCustomerMenu = function () {
  const wrapper = document.querySelector(".customer-dropdown-wrapper");
  if (wrapper) wrapper.classList.toggle("open");
};

async function logout() {
  await fetch("/api/customer/logout", { method: "POST" });
  localStorage.removeItem("cart");
  window.location.href = "index.html";
};

document.addEventListener("click", (e) => {
  const wrapper = document.querySelector(".customer-dropdown-wrapper");
  if (wrapper && !wrapper.contains(e.target)) {
    wrapper.classList.remove("open");
  }
});
