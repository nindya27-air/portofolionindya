/* =====================================================
   login.js — Login via API + Forgot Password Logic
   Grafika Studio
   ===================================================== */

// ─── Utility ─────────────────────────────────────────
function showAlertLogin(id, message, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-alert show ' + (type || 'error');
  if (type !== 'success') {
    setTimeout(function () { el.className = 'auth-alert'; }, 3000);
  }
}

function fieldMsgLogin(id, message, type) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = 'field-msg ' + (type || '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Toggle password ──────────────────────────────────
function setupToggleLogin(btnId, inputId, iconId) {
  var btn   = document.getElementById(btnId);
  var input = document.getElementById(inputId);
  var icon  = document.getElementById(iconId);
  if (!btn || !input) return;
  btn.addEventListener('click', function () {
    var shown = input.type === 'text';
    input.type = shown ? 'password' : 'text';
    if (icon) {
      icon.innerHTML = shown
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
  });
}

// ══════════════════════════════════════════════════════
// LOGIN FORM
// ══════════════════════════════════════════════════════
var loginForm = document.getElementById('loginForm');
if (loginForm) {
  setupToggleLogin('toggleLoginPass', 'loginPassword', 'eyeIconLogin');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    fieldMsgLogin('emailMsg', '');
    fieldMsgLogin('passMsg', '');

    var usernameEl = document.getElementById('loginEmail');
    var passwordEl = document.getElementById('loginPassword');
    var rememberEl = document.getElementById('rememberMe');
    var btn        = document.getElementById('loginBtn');

    var username = usernameEl ? usernameEl.value.trim() : '';
    var password = passwordEl ? passwordEl.value.trim() : '';
    var remember = rememberEl ? rememberEl.checked : false;

    if (!username) { fieldMsgLogin('emailMsg', 'Username tidak boleh kosong.', 'error'); return; }
    if (!password) { fieldMsgLogin('passMsg',  'Password tidak boleh kosong.',  'error'); return; }

    btn.disabled    = true;
    btn.textContent = 'Memproses...';

    try {
      var res = await fetch('https://herisusanta.my.id/javalogin/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=login'
          + '&username=' + encodeURIComponent(username)
          + '&password=' + encodeURIComponent(password)
      });

      var data = await res.json();

      if (data.status === 'success') {
        var storage = remember ? localStorage : sessionStorage;
        storage.setItem('username', data.username);
        storage.setItem('gs_session', JSON.stringify({
          name:    data.username,
          email:   data.email || '',
          loginAt: new Date().toLocaleString('id-ID'),
        }));
        window.location.href = '../index.html';

      } else {
        showAlertLogin('loginAlert', 'Username atau Password salah, silahkan coba lagi', 'error');
        btn.disabled = false;
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Masuk';
      }

    } catch (err) {
      console.error('Login error:', err);
      showAlertLogin('loginAlert', '❌ Gagal terhubung ke server. Periksa koneksi internet.', 'error');
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}

// ══════════════════════════════════════════════════════
// FORGOT PASSWORD — STEP 1: Email
// ══════════════════════════════════════════════════════
var forgotEmail  = '';
var generatedOTP = '';

var forgotEmailForm = document.getElementById('forgotEmailForm');
if (forgotEmailForm) {
  forgotEmailForm.addEventListener('submit', function (e) {
    e.preventDefault();
    fieldMsgLogin('forgotEmailMsg', '');

    var emailVal = document.getElementById('forgotEmail') ? document.getElementById('forgotEmail').value.trim() : '';
    if (!emailVal)              { fieldMsgLogin('forgotEmailMsg', 'Email tidak boleh kosong.', 'error'); return; }
    if (!isValidEmail(emailVal)) { fieldMsgLogin('forgotEmailMsg', 'Format email tidak valid.', 'error'); return; }

    var accounts = JSON.parse(localStorage.getItem('gs_accounts') || '[]');
    var found    = accounts.find(function(acc) { return acc.email === emailVal; });
    if (!found) { showAlertLogin('emailAlert', '❌ Email tidak ditemukan.', 'error'); return; }

    forgotEmail  = emailVal;
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('%c[Demo] OTP: ' + generatedOTP, 'color:#556b2f;font-weight:bold;font-size:14px;');

    document.getElementById('stepEmail').style.display = 'none';
    document.getElementById('stepOTP').style.display   = '';
    var otpDesc = document.getElementById('otpDesc');
    if (otpDesc) otpDesc.textContent = 'Kode 6 digit telah "dikirim" ke ' + emailVal + '. (Demo: cek console / F12)';

    startCountdown();
  });
}

// STEP 2: OTP
var forgotOTPForm = document.getElementById('forgotOTPForm');
if (forgotOTPForm) {
  forgotOTPForm.addEventListener('submit', function (e) {
    e.preventDefault();
    fieldMsgLogin('otpMsg', '');

    var otp = document.getElementById('otpInput') ? document.getElementById('otpInput').value.trim() : '';
    if (!otp || otp.length !== 6) { fieldMsgLogin('otpMsg', 'Kode harus 6 digit.', 'error'); return; }
    if (otp !== generatedOTP)      { showAlertLogin('otpAlert', '❌ Kode verifikasi salah.', 'error'); return; }

    document.getElementById('stepOTP').style.display     = 'none';
    document.getElementById('stepNewPass').style.display = '';
  });
}

// STEP 3: Reset Password
var resetPassForm = document.getElementById('resetPassForm');
if (resetPassForm) {
  setupToggleLogin('toggleNew', 'newPass', null);
  setupToggleLogin('toggleConfirmNew', 'confirmNewPass', null);

  var newPassEl = document.getElementById('newPass');
  if (newPassEl) {
    newPassEl.addEventListener('input', function () {
      updateStrengthMeter(this.value, ['rbar1','rbar2','rbar3','rbar4'], 'rStrengthLabel');
    });
  }

  resetPassForm.addEventListener('submit', function (e) {
    e.preventDefault();
    fieldMsgLogin('newPassMsg', '');
    fieldMsgLogin('confirmNewMsg', '');

    var newPass     = document.getElementById('newPass')?.value || '';
    var confirmPass = document.getElementById('confirmNewPass')?.value || '';
    var valid = true;

    if (!newPass)                { fieldMsgLogin('newPassMsg',     'Password tidak boleh kosong.', 'error'); valid = false; }
    if (newPass !== confirmPass) { fieldMsgLogin('confirmNewMsg',  'Password tidak cocok.', 'error');        valid = false; }
    if (!valid) return;

    var accounts = JSON.parse(localStorage.getItem('gs_accounts') || '[]');
    var idx = accounts.findIndex(function(acc) { return acc.email === forgotEmail; });
    if (idx !== -1) {
      accounts[idx].password = newPass;
      localStorage.setItem('gs_accounts', JSON.stringify(accounts));
    }

    document.getElementById('stepNewPass').style.display = 'none';
    document.getElementById('stepDone').style.display    = '';
    var backBtn = document.getElementById('backToLogin');
    if (backBtn) backBtn.style.display = 'none';
  });
}

// ─── Countdown resend OTP ─────────────────────────────
function startCountdown() {
  var seconds = 60;
  var btn  = document.getElementById('resendBtn');
  var span = document.getElementById('countdown');
  if (!btn) return;

  btn.disabled = true;
  var timer = setInterval(function () {
    seconds--;
    if (span) span.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(timer);
      btn.disabled = false;
      btn.textContent = 'Kirim ulang';
    }
  }, 1000);

  btn.onclick = function () {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('%c[Demo] OTP baru: ' + generatedOTP, 'color:#556b2f;font-weight:bold;');
    showAlertLogin('otpAlert', '✅ Kode baru dikirim. Cek console.', 'success');
    seconds = 60;
    btn.disabled = true;
    btn.innerHTML = 'Kirim ulang (<span id="countdown">60</span>s)';
    startCountdown();
  };
}

// ─── Strength meter ───────────────────────────────────
function updateStrengthMeter(password, barIds, labelId) {
  var strength = 0;
  if (password.length >= 8)            strength++;
  if (/[A-Z]/.test(password))          strength++;
  if (/[0-9]/.test(password))          strength++;
  if (/[^A-Za-z0-9]/.test(password))   strength++;

  var labels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  var colors = ['', 'weak', 'medium', 'strong', 'strong'];

  barIds.forEach(function (id, i) {
    var bar = document.getElementById(id);
    if (bar) bar.className = 'strength-bar' + (i < strength ? ' ' + colors[strength] : '');
  });

  var label = document.getElementById(labelId);
  if (label) label.textContent = password.length ? 'Kekuatan: ' + labels[strength] : '';
                                             }
