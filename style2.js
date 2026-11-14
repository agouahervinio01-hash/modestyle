// =========================================================
// 1. GESTION DES COMPTES UTILISATEURS (Inscription & Connexion)
// =========================================================
function switchAuthTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");

  document.getElementById("loginError").textContent = "";
  document.getElementById("regError").textContent = "";

  if (tab === "login") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

// Créer un compte
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;

  // Récupérer les comptes déjà enregistrés
  let users = JSON.parse(localStorage.getItem("hervinio_users")) || [];

  // Vérifier si l'email ou le téléphone existe déjà
  const exists = users.some(u => u.email === email || u.phone === phone);
  if (exists) {
    document.getElementById("regError").textContent = "Un compte existe déjà avec cet email ou ce numéro.";
    return;
  }

  const newUser = { name, email, phone, password };
  users.push(newUser);
  localStorage.setItem("hervinio_users", JSON.stringify(users));

  // Connecter automatiquement l'utilisateur
  startSession(newUser);
}

// Se connecter avec un compte existant
function handleLogin(event) {
  event.preventDefault();
  const identifier = document.getElementById("loginIdentifier").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("hervinio_users")) || [];
  const validUser = users.find(
    u => (u.email === identifier || u.phone === identifier) && u.password === password
  );

  if (!validUser) {
    document.getElementById("loginError").textContent = "Identifiant ou mot de passe incorrect. Créez un compte si vous êtes nouveau.";
    return;
  }

  startSession(validUser);
}

// Démarrer la session et afficher la boutique
function startSession(user) {
  localStorage.setItem("hervinio_current_user", JSON.stringify(user));
  document.getElementById("authScreen").style.display = "none";
  document.getElementById("shopApp").style.display = "block";
  document.getElementById("userGreeting").textContent = `👤 ${user.name.split(" ")[0]}`;
  displayProducts();
}

// Déconnexion
function logout() {
  localStorage.removeItem("hervinio_current_user");
  document.getElementById("shopApp").style.display = "none";
  document.getElementById("authScreen").style.display = "flex";
}

// Vérifier au chargement si l'utilisateur est déjà connecté
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = JSON.parse(localStorage.getItem("hervinio_current_user"));
  if (savedUser) {
    startSession(savedUser);
  }
});

// =========================================================
// 2. CATALOGUE DE 12 ARTICLES HERVINIO SHOP
// =========================================================
const products = [
  { id: 1, name: "Veste en Jean Premium", category: "vetements", price: 15000, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80" },
  { id: 2, name: "Baskets Urbaines Blanches", category: "chaussures", price: 15000, sizes: ["39", "40", "41", "42", "43"], image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80" },
  { id: 3, name: "T-Shirt Coton Bio Noir", category: "vetements", price: 8000, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80" },
  { id: 4, name: "Montre Classique Cuir", category: "accessoires", price: 15000, sizes: ["Taille Unique"], image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80" },
  { id: 5, name: "Sneakers Rouge Sport", category: "chaussures", price: 12000, sizes: ["38", "40", "41", "42", "44"], image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80" },
  { id: 6, name: "Sac à Dos Urbain", category: "accessoires", price: 11000, sizes: ["Taille Unique"], image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80" },
  { id: 7, name: "Chemise Lin Élégante", category: "vetements", price: 6000, sizes: ["S", "M", "L", "XL"], image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80" },
  { id: 8, name: "Mocassins Cuir Marron", category: "chaussures", price: 8000, sizes: ["40", "41", "42", "43", "44"], image: "https://images.unsplash.com/photo-1614252369475-531eba835eb6?w=500&q=80" },
  { id: 9, name: "Robe d'Été Fleurie", category: "vetements", price: 13000, sizes: ["S", "M", "L"], image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80" },
  { id: 10, name: "Lunettes de Soleil Aviator", category: "accessoires", price: 12000, sizes: ["Taille Unique"], image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80" },
  { id: 11, name: "Sweat à Capuche Gris", category: "vetements", price: 9000, sizes: ["M", "L", "XL"], image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80" },
  { id: 12, name: "Talons Élégants Noirs", category: "chaussures", price: 7000, sizes: ["37", "38", "39", "40"], image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80" }
];

let cart = [];
let currentCategory = "tout";

function displayProducts() {
  const grid = document.getElementById("productsGrid");
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  grid.innerHTML = "";

  const filtered = products.filter(p => {
    const matchCat = currentCategory === "tout" || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(searchText);
    return matchCat && matchSearch;
  });

  filtered.forEach(product => {
    const sizeOptions = product.sizes.map(s => `<option value="${s}">${s}</option>`).join("");
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">${product.price.toLocaleString()} FCFA</p>
        <select id="size-${product.id}" class="size-select">${sizeOptions}</select>
        <button class="add-btn" onclick="addToCart(${product.id})">Ajouter au panier</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterCategory(category, btn) {
  currentCategory = category;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  displayProducts();
}

document.getElementById("searchInput").addEventListener("input", displayProducts);

// =========================================================
// 3. GESTION DU PANIER
// =========================================================
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const size = document.getElementById(`size-${productId}`).value;
  const existing = cart.find(item => item.id === productId && item.size === size);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, size, quantity: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById("cartItems");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById("cartCount").textContent = totalItems;
  document.getElementById("mobileCartCount").textContent = totalItems;

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-msg">Votre panier est vide.</p>`;
    document.getElementById("cartTotal").textContent = "0 FCFA";
    return;
  }

  container.innerHTML = "";
  let totalPrice = 0;

  cart.forEach((item, index) => {
    totalPrice += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p style="font-size:0.85rem; color:#6b7280;">Taille: ${item.size} | ${item.price.toLocaleString()} FCFA</p>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
      </div>
    `;
    container.appendChild(div);
  });

  document.getElementById("cartTotal").textContent = `${totalPrice.toLocaleString()} FCFA`;
}

function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  document.getElementById("cartDrawer").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("open");
}

// =========================================================
// 4. PAIEMENT (Wave, Orange, MTN, Moov, Carte de Crédit)
// =========================================================
function openPaymentModal() {
  if (cart.length === 0) {
    alert("Votre panier est vide !");
    return;
  }
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("modalTotal").textContent = `${totalPrice.toLocaleString()} FCFA`;
  toggleCart();
  document.getElementById("paymentModal").classList.add("open");
}

function closePayment() {
  document.getElementById("paymentModal").classList.remove("open");
}

function togglePaymentFields() {
  const method = document.querySelector('input[name="payMethod"]:checked').value;
  const mobileFields = document.getElementById("mobileMoneyFields");
  const cardFields = document.getElementById("creditCardFields");

  if (method === "Carte de Crédit") {
    mobileFields.style.display = "none";
    cardFields.style.display = "block";
  } else {
    mobileFields.style.display = "block";
    cardFields.style.display = "none";
    document.getElementById("mobileLabel").textContent = `Numéro ${method} :`;
  }
}

function confirmOrder(event) {
  event.preventDefault();
  const method = document.querySelector('input[name="payMethod"]:checked').value;
  const address = document.getElementById("deliveryAddress").value.trim();
  const currentUser = JSON.parse(localStorage.getItem("hervinio_current_user"));

  if (method === "Carte de Crédit") {
    const cardNum = document.getElementById("cardNumber").value.trim();
    if (cardNum.length < 16) {
      alert("Veuillez entrer les 16 chiffres de votre carte de crédit.");
      return;
    }
  } else {
    const phone = document.getElementById("mobilePhone").value.trim();
    if (phone.length < 8) {
      alert(`Veuillez entrer un numéro ${method} valide.`);
      return;
    }
  }

  alert(
    `Félicitations ${currentUser.name} !\n` +
    `Votre paiement via ${method} a été validé.\n` +
    `Livraison prévue à : ${address}.`
  );

  cart = [];
  updateCartUI();
  document.getElementById("paymentForm").reset();
  togglePaymentFields();
  closePayment();
}