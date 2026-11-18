// ================================================================
// EcoTrack – app.js  (100% localStorage — no Firebase needed)
// ================================================================

/* ── Storage keys ─────────────────────────────────────── */
const SK = {
  users:      'eco_users',
  current:    'eco_current',
  userData:   uid => `eco_data_${uid}`,
  habitLogs:  uid => `eco_habits_${uid}`,
  carbonLogs: uid => `eco_carbon_${uid}`,
};

/* ── Badge definitions ────────────────────────────────── */
const BADGES = [
  { id:'starter',  label:'Eco Starter',    icon:'🌱', minPts:0    },
  { id:'learner',  label:'Green Learner',   icon:'🌿', minPts:50   },
  { id:'warrior',  label:'Eco Warrior',     icon:'♻️', minPts:200  },
  { id:'champion', label:'Green Champion',  icon:'🌍', minPts:500  },
  { id:'hero',     label:'Eco Hero',        icon:'🦸', minPts:1000 },
  { id:'guardian', label:'Planet Guardian', icon:'🏆', minPts:2000 },
];

function getCurrentBadge(pts) {
  for (let i = BADGES.length - 1; i >= 0; i--)
    if (pts >= BADGES[i].minPts) return BADGES[i];
  return BADGES[0];
}

function getNextBadge(pts) {
  for (let i = 0; i < BADGES.length; i++)
    if (pts < BADGES[i].minPts) return BADGES[i];
  return null;
}

/* ── Auth helpers ─────────────────────────────────────── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SK.current)); } catch { return null; }
}

function requireAuth(callback) {
  const user = getCurrentUser();
  if (!user) { window.location.href = 'login.html'; return; }
  _loadSidebarUser(user);
  _setActiveSidebarLink();
  callback(user);
}

function redirectIfLoggedIn() {
  if (getCurrentUser()) window.location.href = 'dashboard.html';
}

/* ── Register / Login / Logout ───────────────────────── */
function registerUser(name, email, password) {
  const users = _getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    throw new Error('This email is already registered. Please log in.');

  const uid  = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const user = { uid, name, email, password };
  users.push(user);
  localStorage.setItem(SK.users, JSON.stringify(users));

  saveUserData(uid, {
    name, email,
    totalPoints:     0,
    carbonFootprint: 0,
    activitiesToday: 0,
    createdAt:       Date.now(),
  });

  const session = { uid, name, email };
  localStorage.setItem(SK.current, JSON.stringify(session));
  return session;
}

function loginUser(email, password) {
  const users = _getUsers();
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error('Incorrect email or password. Please try again.');
  const session = { uid: found.uid, name: found.name, email: found.email };
  localStorage.setItem(SK.current, JSON.stringify(session));
  return session;
}

function logout() {
  localStorage.removeItem(SK.current);
  window.location.href = 'index.html';
}

function _getUsers() {
  try { return JSON.parse(localStorage.getItem(SK.users)) || []; } catch { return []; }
}

/* ── User Data ────────────────────────────────────────── */
function getUserData(uid) {
  try {
    const d = localStorage.getItem(SK.userData(uid));
    return d ? JSON.parse(d) : _defaultUserData();
  } catch { return _defaultUserData(); }
}

function _defaultUserData() {
  return { totalPoints:0, carbonFootprint:0, activitiesToday:0, createdAt: Date.now() };
}

function saveUserData(uid, data) {
  localStorage.setItem(SK.userData(uid), JSON.stringify(data));
}

function updateUserData(uid, updates) {
  const d = getUserData(uid);
  Object.assign(d, updates);
  saveUserData(uid, d);
}

function incrementUserPoints(uid, pts) {
  const d = getUserData(uid);
  d.totalPoints = (d.totalPoints || 0) + pts;
  saveUserData(uid, d);
}

/* ── Habit Logs ───────────────────────────────────────── */
function getHabitLogs(uid) {
  try { return JSON.parse(localStorage.getItem(SK.habitLogs(uid))) || {}; } catch { return {}; }
}

function saveHabitLog(uid, date, log) {
  const logs = getHabitLogs(uid);
  logs[date]  = log;
  localStorage.setItem(SK.habitLogs(uid), JSON.stringify(logs));
}

function getHabitLogForDate(uid, date) {
  return getHabitLogs(uid)[date] || null;
}

function getHabitLogsForDays(uid, days) {
  const all = getHabitLogs(uid);
  const out = {};
  days.forEach(d => { if (all[d]) out[d] = all[d]; });
  return out;
}

/* ── Carbon Logs ──────────────────────────────────────── */
function getCarbonLogs(uid) {
  try { return JSON.parse(localStorage.getItem(SK.carbonLogs(uid))) || []; } catch { return []; }
}

function addCarbonLog(uid, log) {
  const logs = getCarbonLogs(uid);
  logs.unshift(log);
  if (logs.length > 15) logs.pop();
  localStorage.setItem(SK.carbonLogs(uid), JSON.stringify(logs));
}

/* ── SHOP: Cart Storage ───────────────────────────────── */
function getCart() {
  try { return JSON.parse(localStorage.getItem('eco_cart')) || []; } catch { return []; }
}
function saveCart(cart) { localStorage.setItem('eco_cart', JSON.stringify(cart)); }

function addToCart(product, qty) {
  qty = qty || 1;
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty });
  saveCart(cart);
  updateCartBadge();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  updateCartBadge();
}

function updateCartQty(productId, qty) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === productId);
  if (idx >= 0) { if (qty <= 0) cart.splice(idx, 1); else cart[idx].qty = qty; }
  saveCart(cart);
  updateCartBadge();
}

function getCartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

/* ── Challenges Storage ───────────────────────────────── */
function getChallengeState(uid) {
  try { return JSON.parse(localStorage.getItem(`eco_ch_${uid}`)) || {}; } catch { return {}; }
}
function saveChallengeState(uid, state) {
  localStorage.setItem(`eco_ch_${uid}`, JSON.stringify(state));
}
function getWeekKey() {
  const d = new Date(); const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff); return d.toISOString().slice(0, 10);
}

/* ── Premium Status ───────────────────────────────────── */
function isPremium(uid) {
  try {
    const d = JSON.parse(localStorage.getItem(`eco_premium_${uid}`));
    return d && d.active && d.expiry > Date.now();
  } catch { return false; }
}
function activatePremium(uid) {
  const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  localStorage.setItem(`eco_premium_${uid}`, JSON.stringify({ active: true, expiry, activatedAt: Date.now() }));
}
function getPremiumExpiry(uid) {
  try {
    const d = JSON.parse(localStorage.getItem(`eco_premium_${uid}`));
    return d ? d.expiry : null;
  } catch { return null; }
}

/* ── Date helpers ─────────────────────────────────────── */
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
    weekday:'short', month:'short', day:'numeric',
  });
}

function shortDate(str) {
  return new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
    month:'short', day:'numeric',
  });
}

/* ── Toast Notification ───────────────────────────────── */
function showToast(message, type) {
  type = type || 'success';
  let t = document.getElementById('appToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'appToast';
    document.body.appendChild(t);
  }
  t.className = `app-toast app-toast-${type}`;
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── Button loading state ─────────────────────────────── */
function setLoadingBtn(btn, loading, text) {
  btn.disabled    = loading;
  btn.textContent = loading ? 'Please wait…' : text;
}

/* ── Sidebar helpers ──────────────────────────────────── */
function _loadSidebarUser(user) {
  const el = document.getElementById('sidebarUserName');
  if (el) el.textContent = user.name || user.email.split('@')[0];
}

function _setActiveSidebarLink() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === page);
  });
}

// Mobile sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  }
});
