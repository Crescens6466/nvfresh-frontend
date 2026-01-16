const API = "/api/products";

/* LOAD PRODUCTS */
async function loadProducts() {
  const res = await fetch(API, {
    credentials: "include" // 🔑 REQUIRED
  });

  if (!res.ok) {
    alert("Unauthorized. Please login again.");
    return;
  }

  const products = await res.json();
  console.log("Products from API:", products);

  const table = document.getElementById("productTable");
  table.innerHTML = "";

  products.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>
          <input type="number" value="${p.pricePerKg}"
            onchange="updatePrice('${p._id}', this.value)">
        </td>
        <td>
          ${p.image ? `<img src="${p.image}" width="60">` : "No image"}
        </td>
        <td>${p.isAvailable ? "Enabled" : "Disabled"}</td>
        <td>
          <button onclick="toggle('${p._id}')">
            ${p.isAvailable ? "Disable" : "Enable"}
          </button>
          <button onclick="deleteProduct('${p._id}')"
            style="background:#e63946;color:#fff;margin-left:6px;">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* ADD PRODUCT */
async function addProduct() {
  const formData = new FormData();

  formData.append("name", document.getElementById("name").value);
  formData.append("category", document.getElementById("category").value);
  formData.append("pricePerKg", document.getElementById("price").value);
  formData.append("image", document.getElementById("image").files[0]);

  const res = await fetch(API, {
    method: "POST",
    body: formData,
    credentials: "include" // 🔑 REQUIRED
  });

  if (!res.ok) {
    alert("Failed to add product");
    return;
  }

  loadProducts();
}

/* UPDATE PRICE */
async function updatePrice(id, price) {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pricePerKg: price }),
    credentials: "include" // 🔑 REQUIRED
  });
}

/* ENABLE / DISABLE PRODUCT */
async function toggle(id) {
  await fetch(`${API}/${id}/availability`, {
    method: "PATCH",
    credentials: "include" // 🔑 REQUIRED
  });

  loadProducts();
}

/* DELETE PRODUCT PERMANENTLY */
async function deleteProduct(id) {
  if (!confirm("This product will be permanently deleted. Continue?")) {
    return;
  }

  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    credentials: "include" // 🔑 REQUIRED
  });

  if (res.ok) {
    alert("Product deleted");
    loadProducts();
  } else {
    alert("Delete failed");
  }
}


/* INITIAL LOAD */
loadProducts();
