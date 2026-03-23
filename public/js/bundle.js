/* ── ALERTS ─────────────────────────────────────────────────────────────── */
const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = (type, msg, time = 7) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time * 1000);
};

/* ── LOGIN ───────────────────────────────────────────────────────────────── */
const login = async (email, password) => {
  try {
    const res = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => location.assign('/'), 1500);
    } else {
      showAlert('error', data.message);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

/* ── SIGNUP ──────────────────────────────────────────────────────────────── */
const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });
    const data = await res.json();
    if (data.status === 'success') {
      showAlert('success', 'Account created! Redirecting...');
      window.setTimeout(() => location.assign('/'), 1500);
    } else {
      showAlert('error', data.message);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

/* ── LOGOUT ──────────────────────────────────────────────────────────────── */
const logout = async () => {
  try {
    const res = await fetch('/api/v1/users/logout');
    const data = await res.json();
    if (data.status === 'success') location.assign('/');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

/* ── UPDATE SETTINGS ─────────────────────────────────────────────────────── */
const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await fetch(url, {
      method: 'PATCH',
      headers: type === 'password' ? { 'Content-Type': 'application/json' } : undefined,
      body: type === 'password' ? JSON.stringify(data) : data,
    });
    const result = await res.json();
    if (result.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    } else {
      showAlert('error', result.message);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

/* ── STRIPE BOOKING ──────────────────────────────────────────────────────── */
const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    const data = await res.json();
    if (data.status !== 'success') return showAlert('error', data.message);

    // 2) Redirect to Stripe checkout
    window.location.href = data.session.url;
  } catch (err) {
    showAlert('error', err.message);
  }
};

/* ── EVENT LISTENERS ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.querySelector('.form--login');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  }

  // Signup form
  const signupForm = document.querySelector('.form--signup');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      signup(name, email, password, passwordConfirm);
    });
  }

  // Logout button
  const logoutBtn = document.querySelector('.nav__el--logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Update user data form
  const userDataForm = document.querySelector('.form-user-data');
  if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);
      updateSettings(form, 'data');
    });
  }

  // Update password form
  const userPasswordForm = document.querySelector('.form-user-password');
  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.querySelector('.btn-save-password');
      if (btn) btn.textContent = 'Updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
      if (btn) btn.textContent = 'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }

  // Book tour button
  const bookBtn = document.getElementById('book-tour');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.target.textContent = 'Processing...';
      const { tourId } = e.target.dataset;
      bookTour(tourId);
    });
  }
});
