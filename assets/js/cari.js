/* ECO-WAVE - pencarian kata kunci seluruh situs (Ctrl+K atau "/").
   Mencari di isi semua halaman, fitur, lokasi/desa, dan layer data memakai assets/data/cari_indeks.json
   (dibangun oleh scripts/bangun_indeks_cari.py). Tanpa ketergantungan. */
(function (root) {
  'use strict';
  var SARAN = ['mangrove', 'terumbu karang', 'MCDA', 'BMKG', 'kW/m', 'eksklusi', 'ERA5', 'rumah terlayani', 'bobot', 'login'];
  var JENIS_IKON = { Halaman: 'bi-file-text', Fitur: 'bi-stars', Lokasi: 'bi-geo-alt', Data: 'bi-database' };

  /* huruf tanpa aksen + huruf kecil, panjang string tetap sama (agar posisi sorotan akurat) */
  function norm(s) {
    return String(s).replace(/[^\u0000-\u007f]/g, function (c) { var d = c.normalize('NFD')[0]; return d || c; }).toLowerCase();
  }
  function tokens(q) { return norm(q).split(/\s+/).filter(Boolean).slice(0, 6); }

  function siapkan(indeks) {
    indeks.forEach(function (e) {
      e._t = norm(e.t); e._a = norm((e.a || '').replace(/-/g, ' ')); e._x = norm(e.x); e._p = norm(e.pt + ' ' + e.j);
      if (e._x.length !== e.x.length) e._x = null; /* jaga-jaga: tanpa sorotan bila panjang berubah */
    });
    return indeks;
  }

  function hitung(e, toks, frasa) {
    var skor = 0, teks = e._x || norm(e.x);
    for (var i = 0; i < toks.length; i++) {
      var k = toks[i], inT = e._t.indexOf(k) >= 0, inX = teks.indexOf(k) >= 0, inP = e._p.indexOf(k) >= 0, inA = e._a.indexOf(k) >= 0;
      if (!inT && !inX && !inP && !inA) return 0;                 /* semua kata harus ada (AND) */
      if (inT) skor += 12;
      if (inA) skor += 10;
      if (inP) skor += 3;
      if (inX) { var n = 0, p = -1; while (n < 5 && (p = teks.indexOf(k, p + 1)) >= 0) n++; skor += n; }
    }
    if (toks.length > 1) { if (e._t.indexOf(frasa) >= 0) skor += 20; else if (teks.indexOf(frasa) >= 0) skor += 8; }
    if (e.j === 'Fitur' || e.j === 'Lokasi') skor += 2;
    return skor;
  }

  function cari(indeks, q, batas) {
    var toks = tokens(q); if (!toks.length) return [];
    var frasa = norm(q).replace(/\s+/g, ' ').trim(), hasil = [];
    indeks.forEach(function (e) { var s = hitung(e, toks, frasa); if (s > 0) hasil.push({ e: e, s: s }); });
    hasil.sort(function (a, b) { return b.s - a.s; });
    return hasil.slice(0, batas || 25);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* tandai kata yang cocok; setiap potongan di-escape terpisah supaya aman */
  function tandai(teks, ntks, toks) {
    var rentang = [];
    toks.forEach(function (k) { var p = -1; while ((p = ntks.indexOf(k, p + 1)) >= 0) { rentang.push([p, p + k.length]); } });
    rentang.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', pos = 0;
    rentang.forEach(function (r) { if (r[0] < pos) return; out += esc(teks.slice(pos, r[0])) + '<mark>' + esc(teks.slice(r[0], r[1])) + '</mark>'; pos = r[1]; });
    return out + esc(teks.slice(pos));
  }

  function cuplikan(e, toks) {
    var teks = e.x, nt = e._x;
    if (!nt) return esc(teks.slice(0, 150));
    var first = -1;
    toks.forEach(function (k) { var p = nt.indexOf(k); if (p >= 0 && (first < 0 || p < first)) first = p; });
    if (first < 0) first = 0;
    var a = Math.max(0, first - 50), b = Math.min(teks.length, a + 170);
    if (a > 0) { var sp = teks.indexOf(' ', a); if (sp > 0 && sp < first) a = sp + 1; }
    return (a > 0 ? '… ' : '') + tandai(teks.slice(a, b), nt.slice(a, b), toks) + (b < teks.length ? ' …' : '');
  }

  root.ECOWAVE_CARI = { cari: cari, norm: norm, siapkan: siapkan, tokens: tokens };
  if (typeof document === 'undefined') return;

  /* ---------------- antarmuka ---------------- */
  var indeks = null, memuat = null, kotak, input, daftar, info, aktif = -1, hasil = [], terakhirFokus = null, tunda = null;

  function muatIndeks() {
    if (indeks) return Promise.resolve(indeks);
    if (!memuat) memuat = fetch('assets/data/cari_indeks.json').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { indeks = siapkan(j); return indeks; })
      .catch(function () { memuat = null; throw new Error('gagal'); });
    return memuat;
  }

  function bangun() {
    if (kotak) return;
    kotak = document.createElement('div');
    kotak.id = 'cariModal'; kotak.setAttribute('role', 'dialog'); kotak.setAttribute('aria-modal', 'true'); kotak.setAttribute('aria-label', 'Pencarian');
    kotak.innerHTML = '<div class="cr-box"><div class="cr-bar"><i class="bi bi-search" aria-hidden="true"></i>' +
      '<input id="crInput" type="search" autocomplete="off" spellcheck="false" placeholder="Cari kata kunci: mangrove, rumus daya, MCDA, BMKG, Bayah…" aria-label="Kata kunci">' +
      '<kbd>Esc</kbd><button type="button" class="cr-x" aria-label="Tutup pencarian" title="Tutup (Esc)"><i class="bi bi-x-lg"></i></button></div><div id="crInfo" class="cr-info"></div><ul id="crList" class="cr-list" role="listbox"></ul>' +
      '<div class="cr-foot"><span><kbd>↑</kbd><kbd>↓</kbd> pilih</span><span><kbd>Enter</kbd> buka</span><span>Mencari di seluruh isi halaman, fitur, lokasi, dan data</span></div></div>';
    document.body.appendChild(kotak);
    input = kotak.querySelector('#crInput'); daftar = kotak.querySelector('#crList'); info = kotak.querySelector('#crInfo');
    kotak.querySelector('.cr-x').addEventListener('click', tutup);
    kotak.addEventListener('mousedown', function (e) { if (e.target === kotak) tutup(); });
    input.addEventListener('input', function () { clearTimeout(tunda); tunda = setTimeout(jalankan, 90); });
    daftar.addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) buka(+li.getAttribute('data-i')); });
    daftar.addEventListener('mousemove', function (e) { var li = e.target.closest('li[data-i]'); if (li) sorot(+li.getAttribute('data-i'), false); });
  }

  function awal() {
    aktif = -1; hasil = [];
    daftar.innerHTML = '<li class="cr-saran"><span>Coba kata kunci:</span>' + SARAN.map(function (s) { return '<button type="button" data-s="' + esc(s) + '">' + esc(s) + '</button>'; }).join('') + '</li>';
    info.textContent = '';
    Array.prototype.forEach.call(daftar.querySelectorAll('button[data-s]'), function (b) {
      b.addEventListener('click', function () { input.value = b.getAttribute('data-s'); input.focus(); jalankan(); });
    });
  }

  function jalankan() {
    var q = input.value.trim();
    if (!q) { awal(); return; }
    info.textContent = 'Mencari…';
    muatIndeks().then(function () {
      if (input.value.trim() !== q) return;
      var toks = tokens(q); hasil = cari(indeks, q, 25); aktif = hasil.length ? 0 : -1;
      info.textContent = hasil.length ? hasil.length + ' hasil untuk “' + q + '”' : 'Tidak ada hasil untuk “' + q + '”. Coba kata yang lebih singkat atau ejaan lain.';
      daftar.innerHTML = hasil.map(function (h, i) {
        var e = h.e, tujuan = e.pt + (e.a ? ' › ' + e.a.replace(/-/g, ' ') : '');
        return '<li role="option" data-i="' + i + '" class="' + (i === 0 ? 'on' : '') + '"><i class="bi ' + (JENIS_IKON[e.j] || 'bi-file-text') + '" aria-hidden="true"></i>' +
          '<div><b>' + tandai(e.t, e._t, toks) + '</b><span class="cr-meta">' + esc(e.j) + ' · ' + esc(tujuan) + '</span><p>' + cuplikan(e, toks) + '</p></div></li>';
      }).join('');
    }).catch(function () { info.textContent = 'Indeks pencarian tidak dapat dimuat. Jalankan scripts/bangun_indeks_cari.py lalu muat ulang halaman.'; daftar.innerHTML = ''; });
  }

  function sorot(i, gulir) {
    if (i < 0 || i >= hasil.length) return;
    aktif = i;
    Array.prototype.forEach.call(daftar.querySelectorAll('li[data-i]'), function (li) { li.classList.toggle('on', +li.getAttribute('data-i') === i); });
    if (gulir) { var li = daftar.querySelector('li[data-i="' + i + '"]'); if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' }); }
  }

  function buka(i) {
    var e = hasil[i] && hasil[i].e; if (!e) return;
    var sini = (location.pathname.split('/').pop() || 'index.php') === e.p || (e.p === 'index.php' && /\/$/.test(location.pathname));
    tutup();
    if (sini) { if (e.a) { if (location.hash === '#' + e.a) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = e.a; } else window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else location.href = e.p + (e.a ? '#' + e.a : '');
  }

  function bukaModal(q) {
    bangun(); terakhirFokus = document.activeElement;
    kotak.classList.add('is-open'); document.documentElement.classList.add('cr-kunci');
    input.value = q || ''; q ? jalankan() : awal();
    muatIndeks().catch(function () {});
    setTimeout(function () { input.focus(); input.select(); }, 20);
  }
  function tutup() {
    if (!kotak) return;
    kotak.classList.remove('is-open'); document.documentElement.classList.remove('cr-kunci');
    if (terakhirFokus && terakhirFokus.focus) try { terakhirFokus.focus(); } catch (_) {}
  }
  function terbuka() { return kotak && kotak.classList.contains('is-open'); }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase(), mengetik = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); terbuka() ? tutup() : bukaModal(); return; }
    if (e.key === '/' && !mengetik && !terbuka() && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); bukaModal(); return; }
    if (!terbuka()) return;
    if (e.key === 'Escape') { e.preventDefault(); tutup(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sorot(Math.min(hasil.length - 1, aktif + 1), true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sorot(Math.max(0, aktif - 1), true); }
    else if (e.key === 'Enter' && aktif >= 0) { e.preventDefault(); buka(aktif); }
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cari]');
    if (t) { e.preventDefault(); bukaModal(t.getAttribute('data-cari-q') || ''); }
  });
  root.ECOWAVE_CARI.buka = bukaModal;
})(typeof window !== 'undefined' ? window : globalThis);
