"use strict";

// DATA MENU
const foods = [
  { id: 1, name: "Nasi Ayam Geprek", category: "Makanan Berat", price: 15000, emoji: "🍗", color: "#FFE4CF", description: "Ayam crispy dengan sambal pedas.", badge: "Best Seller" },
  { id: 2, name: "Nasi Goreng", category: "Makanan Berat", price: 12000, emoji: "🍛", color: "#FBE8C8", description: "Nasi goreng gurih dengan telur.", badge: "Favorit" },
  { id: 3, name: "Mie Ayam", category: "Makanan Berat", price: 13000, emoji: "🍜", color: "#FFF0D9", description: "Mie kenyal dengan ayam berbumbu.", badge: "" },
  { id: 4, name: "Nasi Rendang", category: "Makanan Berat", price: 18000, emoji: "🍲", color: "#F5E0D5", description: "Rendang kaya rempah dan nasi hangat.", badge: "Spesial" },
  { id: 5, name: "Kentang Goreng", category: "Makanan Ringan", price: 8000, emoji: "🍟", color: "#FFF0BC", description: "Kentang renyah dengan saus.", badge: "" },
  { id: 6, name: "Roti Bakar", category: "Makanan Ringan", price: 7000, emoji: "🍞", color: "#F6DFC4", description: "Roti bakar manis dan lembut.", badge: "Favorit" },
  { id: 7, name: "Pisang Goreng", category: "Makanan Ringan", price: 6000, emoji: "🍌", color: "#FFF1BD", description: "Pisang goreng hangat dan renyah.", badge: "" },
  { id: 8, name: "Es Teh Manis", category: "Minuman", price: 4000, emoji: "🧋", color: "#E5F1DF", description: "Teh manis segar dengan es.", badge: "Hemat" },
  { id: 9, name: "Jus Jeruk", category: "Minuman", price: 7000, emoji: "🍊", color: "#FFE5C4", description: "Jus jeruk segar setiap hari.", badge: "" },
  { id: 10, name: "Air Mineral", category: "Minuman", price: 3000, emoji: "💧", color: "#E0F0FF", description: "Air mineral untuk menemani makan.", badge: "" },
  { id: 11, name: "Dimsum", category: "Makanan Ringan", price: 10000, emoji: "🥟", color: "#F7E5D8", description: "Dimsum hangat dengan saus spesial.", badge: "Baru" },
  { id: 12, name: "Es Cokelat", category: "Minuman", price: 8000, emoji: "🥤", color: "#EBD9CD", description: "Minuman cokelat dingin dan creamy.", badge: "" },
];

// STATE
let cart = {};
let selectedCategory = "Semua";
let searchTerm = "";
let currentPage = "home";
let customerName = "";
let queueNumber = 1;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const rupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);

const escapeHTML = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

// NOTIFIKASI
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// NAVIGASI
function navigateTo(page) {
  const target = document.getElementById(`${page}-page`);
  if (!target) return;

  currentPage = page;

  $$(".page").forEach((section) => {
    section.classList.toggle(
      "active",
      section.id === `${page}-page`
    );
  });

  $$(".nav-link").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.page === page
    );
  });

  const labels = {
    home: "Home / Beranda",
    menu: "Home / Menu Makanan",
    order: "Home / Pesanan Saya"
  };

  $("#breadcrumb").textContent = labels[page];

  if (page === "menu") renderMenu();
  if (page === "order") renderOrder();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");

  if (button) {
    event.preventDefault();
    navigateTo(button.dataset.page);
  }
});

// KARTU MAKANAN
function createFoodCard(food) {
  return `
    <article class="food-card">
      <div class="food-visual" style="background:${food.color}">
        ${food.badge ? `<span class="food-badge">${escapeHTML(food.badge)}</span>` : ""}
        <span class="food-emoji">${food.emoji}</span>
      </div>

      <div class="food-details">
        <p class="food-category">${escapeHTML(food.category)}</p>
        <h3>${escapeHTML(food.name)}</h3>
        <p class="food-description">${escapeHTML(food.description)}</p>

        <div class="food-bottom">
          <span class="food-price">${rupiah(food.price)}</span>
          <button class="add-button" data-add="${food.id}" aria-label="Tambah ${escapeHTML(food.name)}">+</button>
        </div>
      </div>
    </article>
  `;
}

// FILTER MENU
function getFilteredFoods() {
  return foods.filter((food) => {
    const matchCategory =
      selectedCategory === "Semua" ||
      food.category === selectedCategory;

    const term = searchTerm.toLocaleLowerCase("id-ID");

    const matchSearch =
      food.name.toLocaleLowerCase("id-ID").includes(term) ||
      food.category.toLocaleLowerCase("id-ID").includes(term) ||
      food.description.toLocaleLowerCase("id-ID").includes(term);

    return matchCategory && matchSearch;
  });
}

function renderFeatured() {
  $("#featured-menu").innerHTML =
    foods.slice(0, 3).map(createFoodCard).join("");
}

function renderMenu() {
  const filtered = getFilteredFoods();

  $("#menu-result-info").textContent =
    `Menampilkan ${filtered.length} menu`;

  if (filtered.length === 0) {
    $("#all-menu").innerHTML = `
      <div class="no-results">
        <div style="font-size:38px">🔎</div>
        <strong>Menu tidak ditemukan</strong>
        <p>Coba kata kunci atau kategori yang lain, ya.</p>
      </div>
    `;
    return;
  }

  $("#all-menu").innerHTML =
    filtered.map(createFoodCard).join("");
}

$$(".category-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    $$(".category-btn").forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.category === selectedCategory
      );
    });

    renderMenu();
  });
});

// PENCARIAN
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();

  searchTerm = $("#search-input").value.trim();
  selectedCategory = "Semua";

  $$(".category-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.category === "Semua"
    );
  });

  navigateTo("menu");

  if (searchTerm) {
    showToast(`Mencari menu: ${searchTerm}`);
  }
});

$("#search-input").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();

  if (currentPage === "menu") renderMenu();
});

// KERANJANG
function addToCart(id) {
  const food = foods.find((item) => item.id === id);
  if (!food) return;

  cart[id] = (cart[id] || 0) + 1;

  updateCartCount();
  showToast(`${food.name} ditambahkan ke pesanan!`);
}

function changeQuantity(id, change) {
  if (!cart[id]) return;

  cart[id] += change;

  if (cart[id] <= 0) delete cart[id];

  updateCartCount();
  renderOrder();
}

function removeFromCart(id) {
  const food = foods.find((item) => item.id === id);

  delete cart[id];

  updateCartCount();
  renderOrder();

  if (food) showToast(`${food.name} dihapus dari pesanan.`);
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.id),
      Number(quantityButton.dataset.quantity)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

function getCartItems() {
  return Object.entries(cart)
    .map(([id, quantity]) => {
      const food = foods.find(
        (item) => item.id === Number(id)
      );

      if (!food || quantity <= 0) return null;

      return {
        ...food,
        quantity,
        subtotal: food.price * quantity
      };
    })
    .filter(Boolean);
}

function updateCartCount() {
  const totalItems = getCartItems().reduce(
    (total, item) => total + item.quantity,
    0
  );

  $("#cart-count").textContent = totalItems;
  $("#order-item-count").textContent = `${totalItems} item`;
  $("#summary-qty").textContent = totalItems;

  $("#queue-info").textContent =
    `A-${String(queueNumber).padStart(3, "0")}`;
}

// HALAMAN ORDER
function renderOrder() {
  const items = getCartItems();

  updateCartCount();

  const subtotal = items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  $("#subtotal").textContent = rupiah(subtotal);
  $("#total-price").textContent = rupiah(subtotal);
  $("#checkout-btn").disabled = items.length === 0;

  if (items.length === 0) {
    $("#order-list").innerHTML = `
      <div class="empty-state">
        <div class="empty-emoji">🛍️</div>
        <h3>Keranjangmu masih kosong</h3>
        <p>Yuk, pilih makanan dan minuman favoritmu!</p>
        <button class="btn btn-primary" data-page="menu">Pilih Menu →</button>
      </div>
    `;
    return;
  }

  $("#order-list").innerHTML = items.map((item) => `
    <article class="order-item">
      <div class="order-emoji" style="background:${item.color}">
        ${item.emoji}
      </div>

      <div class="order-item-info">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${rupiah(item.subtotal)}</p>
      </div>

      <div class="quantity-control">
        <button data-id="${item.id}" data-quantity="-1">−</button>
        <span>${item.quantity}</span>
        <button data-id="${item.id}" data-quantity="1">+</button>
      </div>

      <button class="remove-item" data-remove="${item.id}" aria-label="Hapus item">×</button>
    </article>
  `).join("");
}

// LOGIN SIMULASI
const loginModal = $("#login-modal");

$("#login-btn").addEventListener("click", () => {
  $("#login-name").value = customerName;
  loginModal.classList.add("show");
  $("#login-name").focus();
});

$("#close-login").addEventListener("click", () => {
  loginModal.classList.remove("show");
});

loginModal.addEventListener("click", (event) => {
  if (event.target === loginModal) {
    loginModal.classList.remove("show");
  }
});

$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#login-name").value.trim();

  if (!name) {
    showToast("Masukkan namamu terlebih dahulu.");
    return;
  }

  customerName = name;
  $("#customer-name").value = name;
  loginModal.classList.remove("show");

  showToast(`Halo, ${name}! Selamat datang di KantinKu.`);
});

// CHECKOUT DAN RIWAYAT
const orderHistory = [];

function renderHistory() {
  const container = $("#order-history");

  if (orderHistory.length === 0) {
    container.innerHTML = `
      <h2>Pesanan Terakhir</h2>
      <p>Belum ada pesanan yang dibuat.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h2>Pesanan Terakhir</h2>
    ${orderHistory.map((order) => `
      <article class="history-entry">
        <strong>Antrean ${escapeHTML(order.queue)} · ${escapeHTML(order.name)}</strong>
        <p>${escapeHTML(order.items)}</p>
        <p>Total: <strong>${rupiah(order.total)}</strong></p>
        <p>Pengambilan: ${escapeHTML(order.pickup)}</p>
      </article>
    `).join("")}
  `;
}

$("#checkout-btn").addEventListener("click", () => {
  const items = getCartItems();

  if (items.length === 0) {
    showToast("Keranjang masih kosong.");
    return;
  }

  const name = $("#customer-name").value.trim();

  if (!name) {
    $("#customer-name").focus();
    showToast("Isi nama pemesan terlebih dahulu, ya.");
    return;
  }

  const total = items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const queue = `A-${String(queueNumber).padStart(3, "0")}`;
  const pickup = $("#pickup-time").value;

  const itemDescription = items.map(
    (item) => `${item.name} x${item.quantity}`
  ).join(", ");

  const confirmed = window.confirm(
    `Konfirmasi Pesanan KantinKu\n\n` +
    `Nama: ${name}\n` +
    `Antrean: ${queue}\n` +
    `Pesanan: ${itemDescription}\n` +
    `Total: ${rupiah(total)}\n` +
    `Pengambilan: ${pickup}\n\n` +
    `Buat pesanan sekarang?`
  );

  if (!confirmed) return;

  orderHistory.unshift({
    queue,
    name,
    items: itemDescription,
    total,
    pickup
  });

  queueNumber++;
  cart = {};

  updateCartCount();
  renderOrder();
  renderHistory();

  $("#customer-name").value = name;

  showToast(`Pesanan berhasil dibuat! Nomor antrean: ${queue}`);
  navigateTo("order");
});

// JALANKAN SAAT HALAMAN DIBUKA
renderFeatured();
renderMenu();
renderOrder();
renderHistory();
updateCartCount();