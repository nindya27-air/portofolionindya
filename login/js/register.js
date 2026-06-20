/* =====================================================
   register.js — Register via API
   Grafika Studio
   ===================================================== */

// ─── Utility ─────────────────────────────────────────
function showAlertReg(message, type) {
  const el = document.getElementById('registerAlert');
  if (!el) return;
  el.textContent = message;
  el.className = 'auth-alert show ' + (type || 'error');
  if (type !== 'success') {
    setTimeout(() => { el.className = 'auth-alert'; }, 3500);
  }
}

function fieldMsgReg(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = 'field-msg ' + (type || '');
}

// ─── Toggle password visibility ──────────────────────
function setupToggleReg(btnId, inputId, iconId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
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

// ─── Password Strength ────────────────────────────────
function updateStrengthReg(password) {
  var s = 0;
  if (password.length >= 8)           s++;
  if (/[A-Z]/.test(password))         s++;
  if (/[0-9]/.test(password))         s++;
  if (/[^A-Za-z0-9]/.test(password))  s++;
  var labels = ['', 'Lemah 😟', 'Cukup 😐', 'Kuat 💪', 'Sangat Kuat 🔒'];
  var colors = ['', 'weak', 'medium', 'strong', 'strong'];
  ['bar1','bar2','bar3','bar4'].forEach(function(id, i) {
    var bar = document.getElementById(id);
    if (bar) bar.className = 'strength-bar' + (i < s ? ' ' + colors[s] : '');
  });
  var label = document.getElementById('strengthLabel');
  if (label) label.textContent = password.length ? 'Kekuatan: ' + labels[s] : '';
}

// ─── Init setelah DOM siap ────────────────────────────
setupToggleReg('toggleRegPass', 'regPassword', 'eyeIconReg');
setupToggleReg('toggleConfirm', 'regConfirm',  'eyeIconConfirm');

var regPassEl = document.getElementById('regPassword');
if (regPassEl) {
  regPassEl.addEventListener('input', function () {
    updateStrengthReg(this.value);
    var confirm = document.getElementById('regConfirm');
    if (confirm && confirm.value) {
      fieldMsgReg('confirmMsg',
        this.value === confirm.value ? '✓ Password cocok' : 'Password belum cocok',
        this.value === confirm.value ? 'success' : 'error');
    }
  });
}

var regConfirmEl = document.getElementById('regConfirm');
if (regConfirmEl) {
  regConfirmEl.addEventListener('input', function () {
    var pass = document.getElementById('regPassword');
    fieldMsgReg('confirmMsg',
      this.value === (pass ? pass.value : '') ? '✓ Password cocok' : 'Password belum cocok',
      this.value === (pass ? pass.value : '') ? 'success' : 'error');
  });
}

// ══════════════════════════════════════════════════════
// SUBMIT REGISTER
// ══════════════════════════════════════════════════════
var registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Reset semua pesan
    ['nameMsg','emailMsg','passMsg','confirmMsg'].forEach(function(id) {
      fieldMsgReg(id, '');
    });

    var username = (document.getElementById('regName')?.value     || '').trim();
    var email    = (document.getElementById('regEmail')?.value    || '').trim();
    var password = (document.getElementById('regPassword')?.value || '').trim();
    var confirm  = (document.getElementById('regConfirm')?.value  || '').trim();
    var terms    = document.getElementById('agreeTerms')?.checked;
    var btn      = document.getElementById('registerBtn');

    // Validasi client
    var valid = true;
    if (!username) { fieldMsgReg('nameMsg',    'Username tidak boleh kosong.', 'error'); valid = false; }
    if (!email)    { fieldMsgReg('emailMsg',   'Email tidak boleh kosong.',    'error'); valid = false; }
    if (!password) { fieldMsgReg('passMsg',    'Password tidak boleh kosong.', 'error'); valid = false; }
    if (password && confirm && password !== confirm) {
      fieldMsgReg('confirmMsg', 'Password tidak cocok.', 'error'); valid = false;
    }
    if (!terms)    { showAlertReg('⚠️ Kamu harus menyetujui Syarat & Ketentuan.', 'error'); valid = false; }
    if (!valid) return;

    // Loading
    btn.disabled    = true;
    btn.textContent = 'Membuat akun...';

    try {
      var res = await fetch('https://herisusanta.my.id/javalogin/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=register'
          + '&username=' + encodeURIComponent(username)
          + '&email='    + encodeURIComponent(email)
          + '&password=' + encodeURIComponent(password)
      });

      var data = await res.json();

      if (data.status === 'success') {
        showAlertReg('✅ Registrasi berhasil! Mengalihkan ke halaman login...', 'success');
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1800);
      } else {
        showAlertReg(data.message || '❌ Gagal registrasi, coba lagi.', 'error');
        btn.disabled = false;
        btn.textContent = 'Buat Akun';
      }

    } catch (err) {
      console.error('Register error:', err);
      showAlertReg('❌ Gagal terhubung ke server. Periksa koneksi internet kamu.', 'error');
      btn.disabled = false;
      btn.textContent = 'Buat Akun';
    }
  });
}
