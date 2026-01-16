const PRODUCT_API = "/api/products/available/list";

/* =========================
   CART (Persisted)
========================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* =========================
   LOAD PRODUCTS
========================= */
async function loadProducts() {
  try {
    const res = await fetch(PRODUCT_API);
    const products = await res.json();

    if (!Array.isArray(products)) return;

    const grid = document.getElementById("productGrid");
    if (!grid) return;

    grid.innerHTML = "";

    products.forEach(p => {
      const imageUrl = p.image && p.image.trim() !== ""
        ? p.image
        : "/uploads/no-image.png";

      grid.innerHTML += `
        <div class="product-card">
          <div class="img-wrap">
            <img src="${imageUrl}" alt="${p.name}">
          </div>

          <div class="product-info">
            <h3>${p.name}</h3>
            <p class="price">₹${p.pricePerKg} / kg</p>

            <div class="qty-row">
              <button class="qty-btn" onclick="changeQty('${p._id}', -0.5)">−</button>
              <input
                type="number"
                value="1"
                min="0.5"
                step="0.5"
                id="qty-${p._id}"
                readonly
              >
              <button class="qty-btn" onclick="changeQty('${p._id}', 0.5)">+</button>
            </div>

            <button class="add-btn" onclick="addToCart(
              '${p._id}',
              '${p.name}',
              ${p.pricePerKg},
              '${imageUrl}'
            )">
              Add to Cart
            </button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
}

/* =========================
   CHANGE QUANTITY
========================= */
function changeQty(id, delta) {
  const input = document.getElementById(`qty-${id}`);
  if (!input) return;

  let value = parseFloat(input.value);
  value = Math.max(0.5, value + delta);
  input.value = value;
}

/* =========================
   LOAD CUSTOMER (NAVBAR)
========================= */
async function loadCustomer() {
  const area = document.getElementById("customerArea");
  if (!area) return;

  try {
    const res = await fetch("/api/customer/me", { credentials: "include" });
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
   LOGOUT
========================= */
async function logout() {
  await fetch("/api/customer/logout", { method: "POST", credentials: "include" });
  localStorage.removeItem("cart");
  location.reload();
}

/* =========================
   ADD TO CART (LOGIN REQUIRED)
========================= */
async function addToCart(id, name, price, image) {
  try {
    const res = await fetch("/api/customer/me", { credentials: "include" });
    const data = await res.json();

    if (!data.customer) {
      localStorage.setItem("redirectAfterLogin", "index.html");
      window.location.href = "login.html";
      return;
    }

    const qty = Number(document.getElementById(`qty-${id}`).value);

    const existing = cart.find(i => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id, name, price, qty, image });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();

    alert("Added to cart");
  } catch {
    window.location.href = "login.html";
  }
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
   CUSTOMER DROPDOWN
========================= */
function toggleCustomerMenu() {
  const menu = document.getElementById("customerMenu");
  if (menu) menu.classList.toggle("show");
}

document.addEventListener("click", (e) => {
  const wrapper = document.querySelector(".customer-dropdown-wrapper");
  const menu = document.getElementById("customerMenu");

  if (!wrapper || !menu) return;
  if (!wrapper.contains(e.target)) {
    menu.classList.remove("show");
  }
});

/* =========================
   INIT
========================= */
loadProducts();
loadCustomer();
updateCartBadge();
