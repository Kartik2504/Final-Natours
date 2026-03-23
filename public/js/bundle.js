/* ── MAP (Leaflet.js - no API key needed) ───────────────────────────────── */
const initMap = () => {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const locations = JSON.parse(mapEl.dataset.locations);

  const map = L.map('map', { zoomControl: true, scrollWheelZoom: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  const greenIcon = L.divIcon({
    className: '',
    html: `<div style="background:linear-gradient(to right bottom,#7ed56f,#28b485);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3)"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });

  const bounds = [];
  locations.forEach((loc) => {
    const latLng = [loc.coordinates[1], loc.coordinates[0]];
    bounds.push(latLng);
    L.marker(latLng, { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<div style="font-family:Lato,sans-serif;font-size:13px;font-weight:700;color:#333"><span style="color:#55c57a">Day ${loc.day}:</span> ${loc.description}</div>`, { autoClose: false, closeOnClick: false })
      .openPopup();
  });

  if (bounds.length > 0) map.fitBounds(bounds, { padding: [80, 80] });
};

/* ── ALERTS ── */
const hideAlert = () => { const el = document.querySelector('.alert'); if (el) el.parentElement.removeChild(el); };
const showAlert = (type, msg, time = 7) => {
  hideAlert();
  document.querySelector('body').insertAdjacentHTML('afterbegin', `<div class="alert alert--${type}">${msg}</div>`);
  window.setTimeout(hideAlert, time * 1000);
};

/* ── AUTH ── */
const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (data.status === 'success') { showAlert('success', 'Logged in successfully!'); window.setTimeout(() => location.assign('/'), 1500); }
    else showAlert('error', data.message);
  } catch (err) { showAlert('error', err.message); }
};

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, passwordConfirm }) });
    const data = await res.json();
    if (data.status === 'success') { showAlert('success', 'Account created!'); window.setTimeout(() => location.assign('/'), 1500); }
    else showAlert('error', data.message);
  } catch (err) { showAlert('error', err.message); }
};

const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout');
    const data = await res.json();
    if (data.status === 'success') location.assign('/');
  } catch (err) { showAlert('error', 'Error logging out!'); }
};

const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
    const res = await fetch(url, { method: 'PATCH', headers: type === 'password' ? { 'Content-Type': 'application/json' } : undefined, body: type === 'password' ? JSON.stringify(data) : data });
    const result = await res.json();
    if (result.status === 'success') { showAlert('success', `${type.toUpperCase()} updated!`); if (type === 'data') window.setTimeout(() => location.reload(), 1500); }
    else showAlert('error', result.message);
  } catch (err) { showAlert('error', err.message); }
};

const bookTour = async (tourId) => {
  try {
    showAlert('success', 'Redirecting to payment...');
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    const data = await res.json();
    if (data.status !== 'success') return showAlert('error', data.message);
    window.location.href = data.session.url;
  } catch (err) { showAlert('error', err.message); }
};

/* ── EVENT LISTENERS ── */
document.addEventListener('DOMContentLoaded', () => {
  initMap();

  const loginForm = document.querySelector('.form--login');
  if (loginForm) loginForm.addEventListener('submit', (e) => { e.preventDefault(); login(document.getElementById('email').value, document.getElementById('password').value); });

  const signupForm = document.querySelector('.form--signup');
  if (signupForm) signupForm.addEventListener('submit', (e) => { e.preventDefault(); signup(document.getElementById('name').value, document.getElementById('email').value, document.getElementById('password').value, document.getElementById('passwordConfirm').value); });

  const logoutBtn = document.querySelector('.nav__el--logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const userDataForm = document.querySelector('.form-user-data');
  if (userDataForm) userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    if (document.getElementById('photo').files[0]) form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });

  const userPasswordForm = document.querySelector('.form-user-password');
  if (userPasswordForm) userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = userPasswordForm.querySelector('button[type="submit"]');
    btn.textContent = 'Updating...';
    await updateSettings({ passwordCurrent: document.getElementById('password-current').value, password: document.getElementById('password').value, passwordConfirm: document.getElementById('password-confirm').value }, 'password');
    btn.textContent = 'Save password';
    ['password-current','password','password-confirm'].forEach(id => document.getElementById(id).value = '');
  });

  const bookBtn = document.getElementById('book-tour');
  if (bookBtn) bookBtn.addEventListener('click', (e) => { e.target.textContent = 'Processing...'; bookTour(e.target.dataset.tourId); });
});
