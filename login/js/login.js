/* =====================================================
   login.js — Login via API + Forgot Password Logic
   Grafika Studio
   ===================================================== */

// ─── Utility ─────────────────────────────────────────
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `auth-alert show ${type}`;
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'auth-alert';
}

function fieldMsg(id, message, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `field-msg ${type}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Toggle password visibility ──────────────────────
function setupTogglePassword(btnId, inputId, iconId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const shown = input.type === 'text';
    input.type  = shown ? 'password' : 'text';
    if (icon) {
      icon.innerHTML = shown
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
  });
}

// ══════════════════════════════════════════════════════
// LOGIN FORM — pakai API
// ══════════════════════════════════════════════════════
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  setupTogglePassword('toggleLoginPass', 'loginPassword', 'eyeIconLogin');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlert('loginAlert');
    fieldMsg('emailMsg', '');
    fieldMsg('passMsg', '');

    // Ambil nilai dari field (id di login.html: loginEmail & loginPassword)
    const username = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();
    const remember = document.getElementById('rememberMe')?.checked;
    const btn      = document.getElementById('loginBtn');

    if (!username) { fieldMsg('emailMsg', 'Username tidak boleh kosong.', 'error'); return; }
    if (!password) { fieldMsg('passMsg',  'Password tidak boleh kosong.',  'error'); return; }

    // Loading state
    btn.disabled    = true;
    btn.textContent = 'Memproses...';

    try {
      const res = await fetch('https://herisusanta.my.id/javalogin/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Simpan username (dan sesi lengkap) ke storage
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('username', data.username);
        storage.setItem('gs_session', JSON.stringify({
          name:    data.username,
          email:   data.email || '',
          loginAt: new Date().toLocaleString('id-ID'),
        }));

        // Redirect langsung ke beranda
        window.location.href = '../index.html';

      } else {
        const alertBox = document.getElementById('loginAlert');
        if (alertBox) {
          alertBox.textContent     = 'Username atau Password salah, silahkan coba lagi';
          alertBox.className       = 'auth-alert show error';
          setTimeout(() => { alertBox.className = 'auth-alert'; }, 3000);
        }
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Masuk`;
      }

    } catch (err) {
      showAlert('loginAlert', '❌ Gagal terhubung ke server. Periksa koneksi internet kamu.', 'error');
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}

// ══════════════════════════════════════════════════════
// FORGOT PASSWORD — MULTI STEP (tetap pakai localStorage)
// ══════════════════════════════════════════════════════
let forgotEmail  = '';
let generatedOTP = '';

const forgotEmailForm = document.getElementById('forgotEmailForm');
if (forgotEmailForm) {
  forgotEmailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('emailAlert');
    fieldMsg('forgotEmailMsg', '');

    const emailVal = document.getElementById('forgotEmail')?.value.trim();

    if (!emailVal) { fieldMsg('forgotEmailMsg', 'Email tidak boleh kosong.', 'error'); return; }
    if (!isValidEmail(emailVal)) { fieldMsg('forgotEmailMsg', 'Format email tidak valid.', 'error'); return; }

    const accounts = JSON.parse(localStorage.getItem('gs_accounts') || '[]');
    const found    = accounts.find(acc => acc.email === emailVal);
    if (!found) { showAlert('emailAlert', '❌ Email tidak ditemukan.', 'error'); return; }

    forgotEmail  = emailVal;
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`%c[Demo] OTP untuk ${emailVal}: ${generatedOTP}`, 'color:#556b2f;font-weight:bold;font-size:14px;');

    document.getElementById('stepEmail').style.display = 'none';
    document.getElementById('stepOTP').style.display   = '';
    document.getElementById('otpDesc').textContent =
      `Kode 6 digit telah "dikirim" ke ${emailVal}. (Demo: cek browser console / F12)`;

    startCountdown();
  });
}

const forgotOTPForm = document.getElementById('forgotOTPForm');
if (forgotOTPForm) {
  forgotOTPForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('otpAlert');
    fieldMsg('otpMsg', '');

    const otp = document.getElementById('otpInput')?.value.trim();
    if (!otp || otp.length !== 6) { fieldMsg('otpMsg', 'Kode harus 6 digit.', 'error'); return; }
    if (otp !== generatedOTP)     { showAlert('otpAlert', '❌ Kode verifikasi salah.', 'error'); return; }

    document.getElementById('stepOTP').style.display     = 'none';
    document.getElementById('stepNewPass').style.display = '';
  });
}

const resetPassForm = document.getElementById('resetPassForm');
if (resetPassForm) {
  setupTogglePassword('toggleNew', 'newPass', null);
  setupTogglePassword('toggleConfirmNew', 'confirmNewPass', null);

  document.getElementById('newPass')?.addEventListener('input', function () {
    updateStrengthMeter(this.value, ['rbar1','rbar2','rbar3','rbar4'], 'rStrengthLabel');
  });

  resetPassForm.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert('resetAlert');
    fieldMsg('newPassMsg', '');
    fieldMsg('confirmNewMsg', '');

    const newPass     = document.getElementById('newPass')?.value;
    const confirmPass = document.getElementById('confirmNewPass')?.value;
    let valid = true;

    if (!newPass)              { fieldMsg('newPassMsg',     'Password tidak boleh kosong.', 'error'); valid = false; }
    if (newPass !== confirmPass) { fieldMsg('confirmNewMsg', 'Password tidak cocok.', 'error');        valid = false; }
    if (!valid) return;

    const accounts = JSON.parse(localStorage.getItem('gs_accounts') || '[]');
    const idx = accounts.findIndex(acc => acc.email === forgotEmail);
    if (idx !== -1) { accounts[idx].password = newPass; localStorage.setItem('gs_accounts', JSON.stringify(accounts)); }

    document.getElementById('stepNewPass').style.display = 'none';
    document.getElementById('stepDone').style.display    = '';
    document.getElementById('backToLogin').style.display = 'none';
  });
}

function startCountdown() {
  let seconds = 60;
  const btn  = document.getElementById('resendBtn');
  const span = document.getElementById('countdown');
  if (!btn || !span) return;

  btn.disabled = true;
  const timer  = setInterval(() => {
    seconds--;
    span.textContent = seconds;
    if (seconds <= 0) { clearInterval(timer); btn.disabled = false; btn.innerHTML = 'Kirim ulang'; }
  }, 1000);

  btn.onclick = () => {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`%c[Demo] OTP baru: ${generatedOTP}`, 'color:#556b2f;font-weight:bold;font-size:14px;');
    showAlert('otpAlert', '✅ Kode baru dikirim. Cek console.', 'success');
    seconds = 60; btn.disabled = true;
    btn.innerHTML = `Kirim ulang (<span id="countdown">60</span>s)`;
    startCountdown();
  };
}

function updateStrengthMeter(password, barIds, labelId) {
  let strength = 0;
  if (password.length >= 8)           strength++;
  if (/[A-Z]/.test(password))         strength++;
  if (/[0-9]/.test(password))         strength++;
  if (/[^A-Za-z0-9]/.test(password))  strength++;

  const labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const colors = ['', 'weak', 'medium', 'strong', 'strong'];

  barIds.forEach((id, i) => {
    const bar = document.getElementById(id);
    if (bar) bar.className = 'strength-bar' + (i < strength ? ` ${colors[strength]}` : '');
  });

  const label = document.getElementById(labelId);
  if (label) label.textContent = password.length ? `Kekuatan: ${labels[strength]}` : '';
       }
