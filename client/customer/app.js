const API = CONFIG.API;
const socket = io(CONFIG.SOCKET);

const urlParams = new URLSearchParams(window.location.search);
const TABLE_NUMBER = parseInt(urlParams.get('table')) || 1;

// Set table labels
document.querySelectorAll('[id$="-table-chip"], [id$="-table-label"]').forEach(el => {
  el.textContent = `Table ${TABLE_NUMBER}`;
});
document.getElementById('home-table-label').textContent = `Table ${TABLE_NUMBER}`;

// Greeting
const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
document.getElementById('home-greeting').textContent = greeting;

let cart = {};
let menuData = [];
let currentCategory = 'All';
let feedbackRatings = {};

// ===== SCREEN NAV =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const navMap = {
    'screen-home': 'nav-home',
    'screen-order': 'nav-order',
    'screen-cart': 'nav-order',
    'screen-waiter': 'nav-waiter',
    'screen-bill': 'nav-bill',
    'screen-feedback': 'nav-feedback',
    'screen-complaints': 'nav-feedback'
  };
  if (navMap[id]) document.getElementById(navMap[id]).classList.add('active');
  window.scrollTo(0, 0);

  if (id === 'screen-order') {
    loadMenu();
    if (!sessionStorage.getItem('menuPopupShown')) {
      setTimeout(() => {
        document.getElementById('physical-menu-popup').classList.add('show');
        sessionStorage.setItem('menuPopupShown', 'true');
      }, 1000);
    }
  }
  if (id === 'screen-bill') loadBill();
  if (id === 'screen-feedback') loadFeedbackItems();
  if (id === 'screen-home') loadHomeOrders();
  if (id === 'screen-cart') renderCart();
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function updateCharCount(el, id) {
  document.getElementById(id).textContent = el.value.length;
}

// ===== MENU =====
async function loadMenu() {
  const res = await fetch(`${API}/menu`);
  menuData = await res.json();
  renderCategories();
  renderMenuItems();
}

function renderCategories() {
  const cats = ['All', ...new Set(menuData.map(i => i.category).filter(Boolean))];
  document.getElementById('category-tabs').innerHTML = cats.map(c =>
    `<button class="cat-pill ${c === currentCategory ? 'active' : ''}" onclick="filterCategory('${c}')">${c}</button>`
  ).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderMenuItems();
}

function searchMenu(query) {
  const filtered = menuData.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(query.toLowerCase())
  );
  renderMenuItemsFiltered(filtered);
}

function renderMenuItems() {
  const filtered = currentCategory === 'All'
    ? menuData
    : menuData.filter(i => i.category === currentCategory);
  renderMenuItemsFiltered(filtered);
}

function renderMenuItemsFiltered(items) {
  if (!items.length) {
    document.getElementById('menu-items-list').innerHTML =
      `<div class="empty">
        <i data-lucide="search-x"></i>
        <p>No items found</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  const grouped = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  let html = '';
  Object.entries(grouped).forEach(([cat, catItems]) => {
    if (currentCategory === 'All') html += `<div class="menu-section-title">${cat}</div>`;
    
    catItems.forEach(item => {
      const qty = cart[item._id]?.qty || 0;
      const isOut = item.available === false;

      html += `
        <div class="menu-card ${isOut ? 'is-sold-out' : ''}">
          <div class="menu-img placeholder" id="img-${item._id}">
            ${isOut ? `<div class="sold-out-badge">Sold Out</div>` : ''}
            ${item.image
              ? `<img src="${item.image}" alt="${item.name}">`
              : `<i data-lucide="image"></i>`
            }
          </div>
          <div class="menu-info">
            <h4>${item.name}</h4>
            <p>${item.description || item.category || ''}</p>
            <div class="menu-card-bottom">
              <div class="item-price">₹${item.price}</div>
              ${isOut 
                ? `<button class="add-btn" disabled style="background:#f1f5f9; color:#94a3b8; cursor:not-allowed;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>`
                : (qty === 0
                    ? `<button class="add-btn" onclick="addToCart('${item._id}','${item.name.replace(/'/g,"\\'")}',${item.price},'${item.image || ''}')"><i data-lucide="plus" style="width:18px;height:18px;"></i></button>`
                    : `<div class="qty-control">
                        <button class="qty-btn" onclick="changeQty('${item._id}',-1)"><i data-lucide="minus" style="width:14px;height:14px;"></i></button>
                        <span class="qty-num">${qty}</span>
                        <button class="qty-btn" onclick="changeQty('${item._id}',1)"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>
                      </div>`
                  )
              }
            </div>
          </div>
        </div>`;
    });
  });

  document.getElementById('menu-items-list').innerHTML = html;
  lucide.createIcons();
}

function addToCart(id, name, price, image) {
  cart[id] = { name, price, image, qty: 1 }; 
  updateCartBar();
  renderMenuItems();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartBar();
  renderMenuItems();
}

function updateCartBar() {
  const items = Object.values(cart);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.qty * i.price, 0);
  const bar = document.getElementById('cart-bar');
  const dot = document.getElementById('cart-nav-dot');

  if (totalQty === 0) {
    bar.classList.remove('show');
    dot.classList.remove('show');
    return;
  }
  bar.classList.add('show');
  dot.classList.add('show');
  document.getElementById('cart-badge').textContent = totalQty;
  document.getElementById('cart-bar-label').textContent = `${totalQty} item${totalQty > 1 ? 's' : ''}`;
  document.getElementById('cart-bar-price').textContent = `₹${totalPrice}`;
}

function renderCart() {
  const items = Object.values(cart);
  const container = document.getElementById('cart-items-list');
  if (!items.length) {
    container.innerHTML = `<div class="empty">
      <i data-lucide="shopping-cart"></i>
      <p>Your cart is empty</p><span>Go back and add items</span>
    </div>`;
    lucide.createIcons();
    return;
  }
  container.innerHTML = items.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${i.image 
          ? `<img src="${i.image}">`
          : `<i data-lucide="image"></i>`
        }
      </div>
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <p>Qty: ${i.qty}</p>
      </div>
      <div class="cart-item-price">₹${i.qty * i.price}</div>
    </div>`).join('');

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = Math.round(subtotal * 0.05);
  document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('cart-tax').textContent = `₹${tax}`;
  document.getElementById('cart-total-amount').textContent = `₹${subtotal + tax}`;
  lucide.createIcons();
}

async function placeOrder() {
  const items = Object.values(cart).map(i => ({ name: i.name, qty: i.qty, price: i.price }));
  if (!items.length) { showToast('Your cart is empty'); return; }

  const res = await fetch(`${API}/orders/place`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, items })
  });
  const data = await res.json();

  cart = {};
  updateCartBar();
  showToast('Order placed successfully ✓');

  startModifyCountdown(data.order._id);
  setTimeout(() => showScreen('screen-home'), 1200);
}

function startModifyCountdown(orderId) {
  let secondsLeft = 90;

  const banner = document.createElement('div');
  banner.id = 'modify-banner';
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0;
    background: #0f172a; color: white;
    padding: 16px 20px;
    display: flex; justify-content: space-between; align-items: center;
    z-index: 999; font-size: 14px; font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  banner.innerHTML = `
    <span>Modify order? <strong id="countdown-timer" style="color:#f59e0b;">1:30</strong> left</span>
    <button onclick="requestModification('${orderId}')" style="
      background: white; color: #0f172a; border: none; border-radius: 10px;
      padding: 8px 16px; font-size: 13px; font-weight: 800; cursor: pointer; font-family: inherit;
    ">Modify</button>
  `;
  document.body.appendChild(banner);

  const interval = setInterval(() => {
    secondsLeft--;
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    const timerEl = document.getElementById('countdown-timer');
    if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (secondsLeft <= 0) {
      clearInterval(interval);
      const b = document.getElementById('modify-banner');
      if (b) {
        b.innerHTML = `<span style="width:100%;text-align:center;color:rgba(255,255,255,0.7);">Order locked — modification window closed</span>`;
        setTimeout(() => b.remove(), 2000);
      }
    }
  }, 1000);

  socket.on('order-locked', (data) => {
    if (data.tableNumber === TABLE_NUMBER) {
      clearInterval(interval);
      const b = document.getElementById('modify-banner');
      if (b) b.remove();
    }
  });
}

async function requestModification(orderId) {
  await fetch(`${API}/requests/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, type: 'Order Modification Requested' })
  });
  showToast('Waiter notified to modify your order ✓');
  const b = document.getElementById('modify-banner');
  if (b) b.remove();
}

// Physical menu
function closePopup() { document.getElementById('physical-menu-popup').classList.remove('show'); }
async function requestPhysicalMenu() {
  await fetch(`${API}/requests/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, type: 'Physical Menu' })
  });
  closePopup();
  showToast('Physical menu requested ✓');
}

// Waiter requests
async function sendRequest(type) {
  await fetch(`${API}/requests/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, type })
  });
  showToast(`${type} requested ✓`);
}

// Bill
async function loadBill() {
  const res = await fetch(`${API}/orders/table/${TABLE_NUMBER}`);
  let orders = await res.json();
  orders = orders.filter(o => o.status !== 'paid');

  const container = document.getElementById('bill-items-list');
  if (!orders.length) {
    container.innerHTML = '<p style="color:var(--grey-text);font-size:14px;font-weight:600;text-align:center;padding:20px 0;">No orders yet.</p>';
    document.getElementById('bill-total').textContent = `₹0`;
    return;
  }
  
  let total = 0, html = '';
  orders.forEach(order => {
    order.items.forEach(item => {
      total += item.price * item.qty;
      html += `<div class="bill-row"><span>${item.name} × ${item.qty}</span><span style="font-weight:700;color:var(--black);">₹${item.price * item.qty}</span></div>`;
    });
  });
  container.innerHTML = html;
  document.getElementById('bill-total').textContent = `₹${total}`;
}

async function confirmBill() {
  await fetch(`${API}/requests/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, type: 'Bill Request' })
  });
  showToast('Bill requested — waiter on the way ✓');
  setTimeout(() => showScreen('screen-feedback'), 1500);
}

async function incorrectBill() {
  await fetch(`${API}/requests/new`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, type: 'Bill Incorrect — Please Check' })
  });
  showToast('Waiter notified about bill issue ✓');
}

// Feedback
async function loadFeedbackItems() {
  const res = await fetch(`${API}/orders/table/${TABLE_NUMBER}`);
  let orders = await res.json();
  orders = orders.filter(o => o.status !== 'paid');

  const container = document.getElementById('feedback-items-list');
  if (!orders.length) {
    container.innerHTML = '<p style="color:var(--grey-text);font-size:14px;font-weight:500;">No orders to rate yet.</p>';
    return;
  }
  
  let items = [];
  orders.forEach(o => o.items.forEach(i => { if (!items.find(x => x.name === i.name)) items.push(i); }));
  feedbackRatings = {};
  container.innerHTML = items.map(item => `
    <div class="feedback-item">
      <h4>${item.name}</h4>
      <div class="stars" id="stars-${item.name.replace(/\s/g,'_')}">
        ${[1,2,3,4,5].map(n => `<span class="star" onclick="rateStar('${item.name}',${n})">★</span>`).join('')}
      </div>
    </div>`).join('');
}

function rateStar(itemName, stars) {
  feedbackRatings[itemName] = stars;
  const key = itemName.replace(/\s/g,'_');
  document.querySelectorAll(`#stars-${key} .star`).forEach((s,i) => s.classList.toggle('active', i < stars));
}

async function submitFeedback() {
  const comment = document.getElementById('feedback-comment').value;
  const ratings = Object.entries(feedbackRatings).map(([itemName, stars]) => ({ itemName, stars }));
  await fetch(`${API}/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, ratings, comment })
  });
  showToast('Thank you for your feedback ✓');
  setTimeout(() => showScreen('screen-home'), 1500);
}

async function submitComplaint() {
  const message = document.getElementById('complaint-text').value.trim();
  if (!message) { showToast('Please write your complaint first'); return; }
  await fetch(`${API}/complaints/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, message })
  });
  document.getElementById('complaint-text').value = '';
  showToast('Complaint sent to manager ✓');
  setTimeout(() => showScreen('screen-home'), 1500);
}

async function submitOther() {
  const message = document.getElementById('other-text').value.trim();
  if (!message) { showToast('Please describe what you need'); return; }
  await fetch(`${API}/complaints/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableNumber: TABLE_NUMBER, message: '[OTHER] ' + message })
  });
  document.getElementById('other-text').value = '';
  showToast('Manager notified ✓');
}

// Home orders
async function loadHomeOrders() {
  const res = await fetch(`${API}/orders/table/${TABLE_NUMBER}`);
  let orders = await res.json();
  
  const section = document.getElementById('active-orders-section');
  const list = document.getElementById('home-orders-list');
  
  const active = orders.filter(o => o.status !== 'served' && o.status !== 'paid');
  
  if (!active.length) { section.style.display = 'none'; return; }
  
  section.style.display = 'block';
  list.innerHTML = active.map(o => `
    <div class="order-card">
      <div class="order-card-top">
        <span>${o.items.length} item${o.items.length > 1 ? 's' : ''}</span>
        <span class="status-pill pill-${o.status}">${o.status}</span>
      </div>
      <div class="order-items-text">${o.items.map(i => `${i.name} × ${i.qty}`).join(' · ')}</div>
    </div>`).join('');
}

socket.on('order-updated', (order) => {
  if (order.tableNumber === TABLE_NUMBER) {
    loadHomeOrders();
    showToast(`Your order is now ${order.status} ✓`);
  }
});

// Chatbot
function toggleChat() {
  const w = document.getElementById('chat-window');
  w.classList.toggle('open');
  if (w.classList.contains('open') && !document.getElementById('chat-messages').children.length) {
    addBotMsg("Hi! I'm DineBot. How can I help you today?");
  }
}

function addBotMsg(msg) {
  const c = document.getElementById('chat-messages');
  c.innerHTML += `<div class="msg bot">${msg}</div>`;
  c.scrollTop = c.scrollHeight;
}

function addUserMsg(msg) {
  const c = document.getElementById('chat-messages');
  c.innerHTML += `<div class="msg user">${msg}</div>`;
  c.scrollTop = c.scrollHeight;
}

function askBot(q) {
  addUserMsg(q);
  setTimeout(() => {
    const ql = q.toLowerCase();
    if (ql.includes('order') && !ql.includes('status')) addBotMsg("Tap Menu in the bottom bar, add items and tap the cart button to place your order!");
    else if (ql.includes('waiter') || ql.includes('call')) addBotMsg("Tap Waiter in the bottom bar to call for assistance. Your waiter is notified instantly!");
    else if (ql.includes('bill')) addBotMsg("Tap Bill in the bottom bar. Review your order and tap Correct to request your bill!");
    else if (ql.includes('status') || ql.includes('where')) addBotMsg("Check the Home screen — your active orders and their status are shown there in real time!");
    else if (ql.includes('timing')) addBotMsg("We're open every day from 10:00 AM to 11:00 PM. Enjoy your meal!");
    else addBotMsg("I'm not sure about that. Please ask your waiter for help!");
  }, 400);
}

socket.on('table-cleared', (data) => {
  if (data.tableNumber === TABLE_NUMBER) {
    cart = {};
    updateCartBar();
    alert('Your bill has been settled and the table is cleared. Thank you for dining with us!');
    window.location.reload();
  }
});

// Cart bar HTML
document.body.insertAdjacentHTML('beforeend', `
  <div class="cart-bar" id="cart-bar" onclick="showScreen('screen-cart')">
    <div class="cart-bar-left">
      <div class="cart-badge" id="cart-badge">0</div>
      <span class="cart-bar-label" id="cart-bar-label">items</span>
    </div>
    <span class="cart-bar-price" id="cart-bar-price">₹0</span>
  </div>
`);

// Initialization
lucide.createIcons();
loadHomeOrders();