/* =====================================================
   register.js — Register via API
   Grafika Studio
   ===================================================== */

// ─── Utility ─────────────────────────────────────────
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `auth-alert show ${type}`;
  setTimeout(() => { el.className = 'auth-alert'; }, 3500);
}

function fieldMsg(id, message, type = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `field-msg ${type}`;
}

// ─── Toggle password visibility ──────────────────────
function setupToggle(btnId, inputId, iconId) {
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

// ─── Password Strength (info saja, tidak menghalangi) ─
function updateStrength(password) {
  let s = 0;
  if (password.length >= 8)            s++;
  if (/[A-Z]/.test(password))          s++;
  if (/[0-9]/.test(password))          s++;
  if (/[^A-Za-z0-9]/.test(password))   s++;

  const labels = ['', 'Lemah 😟', 'Cukup 😐', 'Kuat 💪', 'Sangat Kuat 🔒'];
  const colors = ['', 'weak', 'medium', 'strong', 'strong'];

  ['bar1','bar2','bar3','bar4'].forEach((id, i) => {
    const bar = document.getElementById(id);
    if (bar) bar.className = 'strength-bar' + (i < s ? ` ${colors[s]}` : '');
  });

  const label = document.getElementById('strengthLabel');
  if (label) label.textContent = password.length ? `Kekuatan: ${labels[s]}` : '';
}

// ══════════════════════════════════════════════════════
// REGISTER FORM — pakai API
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setupToggle('toggleRegPass',  'regPassword', 'eyeIconReg');
  setupToggle('toggleConfirm',  'regConfirm',  'eyeIconConfirm');

  document.getElementById('regPassword')?.addEventListener('input', function () {
    updateStrength(this.value);
    const confirm = document.getElementById('regConfirm')?.value;
    if (confirm) {
      fieldMsg('confirmMsg', this.value === confirm ? '✓ Password cocok' : 'Password belum cocok', this.value === confirm ? 'success' : 'error');
    }
  });

  document.getElementById('regConfirm')?.addEventListener('input', function () {
    const pass = document.getElementById('regPassword')?.value;
    fieldMsg('confirmMsg', this.value === pass ? '✓ Password cocok' : 'Password belum cocok', this.value === pass ? 'success' : 'error');
  });

  const form = document.getElementById('registerForm');
  form?.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Reset pesan
    ['nameMsg','emailMsg','passMsg','confirmMsg'].forEach(id => fieldMsg(id, ''));

    // Ambil nilai — sesuai id di register.html
    const username = document.getElementById('regName')?.value.trim();
    const email    = document.getElementById('regEmail')?.value.trim();
    const password = document.getElementById('regPassword')?.value.trim();
    const confirm  = document.getElementById('regConfirm')?.value.trim();
    const terms    = document.getElementById('agreeTerms')?.checked;
    const btn      = document.getElementById('registerBtn');

    // Validasi sederhana sisi client
    let valid = true;
    if (!username) { fieldMsg('nameMsg', 'Username tidak boleh kosong.', 'error'); valid = false; }
    if (!email)    { fieldMsg('emailMsg', 'Email tidak boleh kosong.', 'error');   valid = false; }
    if (!password) { fieldMsg('passMsg', 'Password tidak boleh kosong.', 'error'); valid = false; }
    if (password !== confirm) { fieldMsg('confirmMsg', 'Password tidak cocok.', 'error'); valid = false; }
    if (!terms) { showAlert('registerAlert', '⚠️ Kamu harus menyetujui Syarat & Ketentuan.', 'error'); valid = false; }
    if (!valid) return;

    // Loading
    btn.disabled    = true;
    btn.textContent = 'Membuat akun...';

    try {
      const res = await fetch('https://herisusanta.my.id/javalogin/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=register&username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      const data = await res.json();

      if (data.status === 'success') {
        showAlert('registerAlert', '✅ Registrasi berhasil! Mengalihkan ke halaman login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1800);
      } else {
        showAlert('registerAlert', data.message || '❌ Gagal registrasi, coba lagi.', 'error');
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Buat Akun`;
      }

    } catch (err) {
      showAlert('registerAlert', '❌ Gagal terhubung ke server. Periksa koneksi internet kamu.', 'error');
      btn.disabled = false;
      btn.textContent = 'Buat Akun';
    }
  });
});
