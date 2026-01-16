
/* =========================
   LOGIN GUARD (IMPORTANT)
========================= */
async function ensureLoggedIn() {
  try {
    const res = await fetch("/api/customer/me", { credentials: "include" });

    // Not logged in
    if (!res.ok) {
      localStorage.setItem("redirectAfterLogin", "cart.html");
      window.location.href = "login.html";
      return false;
    }

    const data = await res.json();

    if (!data.customer) {
      localStorage.setItem("redirectAfterLogin", "cart.html");
      window.location.href = "login.html";
      return false;
    }

    return true;

  } catch (err) {
    localStorage.setItem("redirectAfterLogin", "cart.html");
    window.location.href = "login.html";
    return false;
  }
}


/* =========================
   CART STATE
========================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   LOAD CUSTOMER (NAVBAR)
========================= */
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

/* =========================
   DROPDOWN TOGGLE
========================= */
function toggleCustomerMenu() {
  const wrapper = document.querySelector(".customer-dropdown-wrapper");
  if (wrapper) wrapper.classList.toggle("open");
}


document.addEventListener("click", (e) => {
  const wrapper = document.querySelector(".customer-dropdown-wrapper");
  const menu = document.getElementById("customerMenu");

  if (!wrapper || !menu) return;
  if (!wrapper.contains(e.target)) menu.classList.remove("show");
});

/* =========================
   LOGOUT
========================= */
async function logout() {
  await fetch("/api/customer/logout", { method: "POST" });
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

/* =========================
   CART BADGE
========================= */
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  badge.innerText = cart.length;
  badge.style.display = cart.length > 0 ? "inline-block" : "none";
}

/* =========================
   TOGGLE CHECKOUT BUTTON
========================= */
function toggleCheckoutButton() {
  const btn = document.getElementById("placeOrderBtn");
  if (!btn) return;

  const disabled = cart.length === 0;
  btn.disabled = disabled;
  btn.style.opacity = disabled ? "0.6" : "1";
  btn.style.cursor = disabled ? "not-allowed" : "pointer";
}

/* =========================
   CHANGE QUANTITY
========================= */
function changeCartQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty < 0.5) cart.splice(index, 1);

  saveCart();
  renderCart();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

/* =========================
   RENDER CART
========================= */
function renderCart() {
  const cartDiv = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  if (!cartDiv || !totalEl) return;

  cartDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartDiv.innerHTML = `<p class="empty-cart">Your cart is empty 🛒</p>`;
    totalEl.innerText = "0";
    updateCartBadge();
    toggleCheckoutButton();
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.qty * item.price;
    total += itemTotal;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <div class="cart-left-info">
          <img src="${item.image}" class="cart-thumb">
          <div class="cart-info">
            <strong>${item.name}</strong>
            <div class="cart-meta">${item.qty} kg × ₹${item.price}</div>
            <div class="qty-row">
              <button class="qty-btn" onclick="changeCartQty(${index}, -0.5)">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeCartQty(${index}, 0.5)">+</button>
            </div>
          </div>
        </div>

        <div class="cart-right-info">
          <div class="item-price">₹${itemTotal}</div>
          <button class="remove-btn" onclick="removeItem(${index})">✖</button>
        </div>
      </div>
    `;
  });

  totalEl.innerText = total;
  updateCartBadge();
  toggleCheckoutButton();
}

/* =========================
   PLACE ORDER
========================= */
async function placeOrder() {
  if (cart.length === 0) return;

  const address = document.getElementById("address").value.trim();
  if (!address) {
    alert("Please enter delivery address");
    return;
  }

  // 🔥 FIX: map cart → order items correctly
  const items = cart.map(item => ({
    productId: item.id,   // ✅ THIS WAS MISSING
    name: item.name,
    qty: item.qty,
    price: item.price
  }));

  const totalAmount = Number(
    document.getElementById("total").innerText.replace("₹", "")
  );

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        items,
        address,
        totalAmount
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Order failed");
      return;
    }

    alert("Order placed successfully 🎉");
    localStorage.removeItem("cart");
    window.location.href = "orders.html";

  } catch (err) {
    console.error("Order error:", err);
    alert("Something went wrong");
  }
}


/* =========================
   SAVE CART
========================= */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   INIT
========================= */
(async function initCart() {
  const ok = await ensureLoggedIn();
  if (!ok) return;
 
loadCustomer();       // ✅ THIS WAS MISSING
renderCart();
updateCartBadge();
toggleCheckoutButton();
})();