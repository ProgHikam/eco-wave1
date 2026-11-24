/* ECO-WAVE - pilihan bahasa (Indonesia / English).
   Teks asli situs adalah bahasa Indonesia. Bila English dipilih, kamus terjemahan (assets/js/kamus/*.js, dimuat hanya saat itu)
   dipakai untuk mengganti teks di halaman. Tiga jenis kecocokan, semuanya persis (spasi dirapikan):
     1) teks utuh satu elemen biasa (judul, tombol, label, sel tabel, ...);
     2) isi satu blok yang memuat tag inline (<b>, <a>, <code>, ...) -> dicocokkan sebagai HTML-nya, jadi paragraf dengan tebal/tautan
        ikut diterjemahkan dengan tag yang sama;
     3) pola ("__pola") untuk teks bentukan skrip yang memuat angka/nama, mis. "Daya: 25,4 kW".
   Teks yang tidak ada di kamus dibiarkan berbahasa Indonesia (tidak ada terjemahan mesin).
   Pilihan disimpan di localStorage ("ecowave_lang"). Tidak menyentuh data, hitungan, atau ID/class yang dipakai skrip lain. */
(function (root) {
  'use strict';
  var KUNCI = 'ecowave_lang';
  var BERKAS = ['ui', 'beranda', 'peta', 'kalkulator', 'terbaik', 'tentang_web', 'tentang', 'teknologi', 'tambahan', 'dinamis', 'admin'];

  var lang = 'id', pengamat = null, tunda = null, antrian = [], kamusSiap = false, memuat = false;
  var KAMUS = {}, POLA = [];
  var asliTeks = new WeakMap(), asliBlok = new WeakMap(), asliAttr = new WeakMap();
  var ATTR = ['title', 'aria-label', 'placeholder', 'alt'];
  var LEWATI = /^(SCRIPT|STYLE|NOSCRIPT|CODE|KBD|PRE|TEXTAREA|SVG|CANVAS|SELECT|INPUT)$/;
  var INLINE = 'a,b,strong,i,em,code,kbd,span,small,sub,sup,br,mark,abbr,u,wbr,s,var';
  var ADA_HURUF = /[A-Za-zÀ-ɏ]{2}/;
  function rapi(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function punya(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  function baca() { try { return localStorage.getItem(KUNCI) === 'en' ? 'en' : 'id'; } catch (_) { return 'id'; } }

  /* ---------- kamus ---------- */
  function gabung() {
    var arr = root.ECOWAVE_KAMUS || [];
    arr.forEach(function (o) {
      Object.keys(o).forEach(function (k) { if (k === '__pola') return; KAMUS[rapi(k)] = o[k]; });
      if (o.__pola) o.__pola.forEach(function (p) { POLA.push([new RegExp(p[0]), p[1]]); });
    });
    root.ECOWAVE_KAMUS = [];
  }
  function cariTeks(teks) {
    var k = rapi(teks);
    if (punya(KAMUS, k)) return KAMUS[k];
    for (var i = 0; i < POLA.length; i++) { if (POLA[i][0].test(k)) return k.replace(POLA[i][0], POLA[i][1]); }
    /* kalimat berangka: angka diganti {n} lalu dicari di kamus, angkanya dipasang lagi dengan format English (25,4 -> 25.4; 8.760 -> 8,760) */
    var angka = [], tpl = k.replace(ANGKA, function (a) { angka.push(a); return '{n}'; });
    if (angka.length && punya(KAMUS, tpl)) {
      var j = 0;
      return KAMUS[tpl].replace(/\{n\}/g, function () { return j < angka.length ? angkaEn(angka[j++]) : ''; });
    }
    return null;
  }
  var ANGKA = /\d+(?:\.\d{3})*(?:,\d+)?|\d+(?:[.:]\d+)*/g;
  function angkaEn(a) {
    if (/^\d+(\.\d{3})+(,\d+)?$/.test(a)) return a.replace(/\./g, '\u0001').replace(',', '.').replace(/\u0001/g, ',');
    return a.replace(',', '.');
  }
  function t(teks) { var h = lang === 'en' ? cariTeks(teks) : null; return h == null ? teks : h; }

  /* ---------- penelusuran DOM ---------- */
  function adaTeks(e) { for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && ADA_HURUF.test(c.nodeValue)) return true; return false; }
  function adaAnak(e) { for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 1) return true; return false; }
  function aman(e) { return !e.querySelector('[id],input,select,textarea,button,canvas,svg,video,iframe,[data-no-i18n]'); }
  function kandidatBlok(e) { return adaTeks(e) && adaAnak(e) && !e.querySelector(':not(' + INLINE + ')') && aman(e); }

  function ubahTeks(n) {
    var p = n.parentNode; if (!p || LEWATI.test(p.nodeName)) return;
    var cur = n.nodeValue, rec = asliTeks.get(n);
    if (rec && cur !== rec.id && cur !== rec.en) { asliTeks.delete(n); rec = null; }       /* skrip halaman mengganti teksnya */
    if (!rec) {
      if (lang !== 'en' || !ADA_HURUF.test(cur)) return;
      var h = cariTeks(cur); if (h == null) return;
      rec = { id: cur, en: null, h: h }; asliTeks.set(n, rec);
    }
    if (lang === 'en') {
      var lead = rec.id.match(/^\s*/)[0], trail = rec.id.match(/\s*$/)[0];
      var baru = lead + rec.h + trail;
      rec.en = baru; if (cur !== baru) n.nodeValue = baru;
    } else if (cur !== rec.id) n.nodeValue = rec.id;
  }
  function ubahBlok(e) {                                   /* true bila elemen ini ditangani sebagai satu blok */
    var rec = asliBlok.get(e), sekarang = rapi(e.innerHTML);
    if (rec) {
      if (sekarang !== rapi(rec.id) && sekarang !== rapi(rec.en)) { asliBlok.delete(e); e.removeAttribute('data-i18n-b'); rec = null; }   /* isi diganti skrip */
      else {
        if (lang === 'en') { if (sekarang !== rapi(rec.en)) e.innerHTML = rec.en; }
        else { e.innerHTML = rec.id; asliBlok.delete(e); e.removeAttribute('data-i18n-b'); }
        return true;
      }
    }
    if (lang !== 'en' || !kandidatBlok(e)) return false;
    var h = cariTeks(sekarang); if (h == null) return false;
    asliBlok.set(e, { id: e.innerHTML, en: h }); e.setAttribute('data-i18n-b', '1'); e.innerHTML = h;
    return true;
  }
  function ubahAttr(e) {
    ATTR.forEach(function (a) {
      if (!e.hasAttribute || !e.hasAttribute(a)) return;
      var m = asliAttr.get(e) || {}, v = e.getAttribute(a);
      if (!(a in m) || (v !== m[a] && v !== m[a + '#en'])) {
        if (lang !== 'en') return;
        var h = cariTeks(v); if (h == null) return;
        m[a] = v; m[a + '#en'] = h; asliAttr.set(e, m);
      }
      var tujuan = lang === 'en' ? m[a + '#en'] : m[a];
      if (tujuan != null && v !== tujuan) e.setAttribute(a, tujuan);
    });
  }
  function telusur(e, kumpulan) {
    if (e.nodeType === 3) {
      if (kumpulan) { var kt = rapi(e.nodeValue); if (ADA_HURUF.test(kt) && cariTeks(kt) == null && !(e.parentNode && LEWATI.test(e.parentNode.nodeName))) kumpulan.push(kt); }
      else ubahTeks(e);
      return;
    }
    if (e.nodeType !== 1 || LEWATI.test(e.nodeName) || e.hasAttribute('data-no-i18n')) return;
    if (kumpulan) {
      if (kandidatBlok(e)) { var kb = rapi(e.innerHTML); if (cariTeks(kb) != null) return; kumpulan.push('<<' + kb); return; }
      ATTR.forEach(function (a) { if (e.hasAttribute(a)) { var v = rapi(e.getAttribute(a)); if (ADA_HURUF.test(v) && cariTeks(v) == null) kumpulan.push('@@' + v); } });
    } else {
      ubahAttr(e);
      if (e.hasAttribute('data-i18n-b') || asliBlok.has(e) || lang === 'en') { if (ubahBlok(e)) return; }
    }
    var c = e.firstChild;
    while (c) { var nx = c.nextSibling; telusur(c, kumpulan); c = nx; }
  }
  function jalan(akar) { if (akar) { try { telusur(akar, null); } catch (_) {} } }
  function kumpul(akar) { var h = []; telusur(akar || document.body, h); return h.filter(function (x, i) { return h.indexOf(x) === i; }); }

  function judul() {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'id');
    if (!judul.asli) judul.asli = document.title;
    var bag = judul.asli.split(/\s+[|–—-]\s+/);
    document.title = lang === 'en' ? bag.map(function (b) { return t(b); }).join(' | ') : judul.asli;
  }
  function arah() { if (pengamat && document.body) pengamat.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); }
  function pantau() {
    if (pengamat || !root.MutationObserver) return;
    pengamat = new MutationObserver(function (ms) {
      if (lang !== 'en') return;
      antrian = antrian.concat(ms);                          /* kumpulkan semua catatan; yang lama jangan hilang saat timer diulang */
      clearTimeout(tunda);
      tunda = setTimeout(function () {
        var ds = antrian; antrian = [];
        pengamat.disconnect();
        try {
          ds.forEach(function (m) {
            if (m.type === 'characterData') ubahTeks(m.target);
            else if (m.type === 'attributes') ubahAttr(m.target);
            else {
              if (m.target.nodeType === 1 && m.target.hasAttribute('data-i18n-b')) ubahBlok(m.target);
              else if (m.target.nodeType === 1) jalan(m.target);
              Array.prototype.forEach.call(m.addedNodes, function (a) { jalan(a); });
            }
          });
        } finally { arah(); }
      }, 60);
    });
  }

  function terapkan() {
    if (typeof document === 'undefined' || !document.body) return;
    if (pengamat) pengamat.disconnect();
    jalan(document.body); judul();
    if (lang === 'en') { pantau(); arah(); }
  }

  /* ---------- memuat kamus (hanya bila English) ---------- */
  function muatKamus(sesudah) {
    if (kamusSiap || typeof document === 'undefined') { sesudah(); return; }
    if (memuat) { muatKamus.antri.push(sesudah); return; }
    memuat = true; muatKamus.antri = [sesudah];
    var me = document.currentScript || document.querySelector('script[src*="bahasa.js"]'), v = '';
    if (me && me.src) { var q = me.src.split('?')[1]; if (q) v = '?' + q; }
    var sisa = BERKAS.length;
    BERKAS.forEach(function (b) {
      var s = document.createElement('script'); s.async = false; s.src = 'assets/js/kamus/' + b + '.js' + v;
      var selesai = function () { if (--sisa === 0) { gabung(); kamusSiap = true; memuat = false; muatKamus.antri.forEach(function (f) { f(); }); } };
      s.onload = selesai; s.onerror = selesai;           /* berkas yang tidak ada dilewati, bukan menggagalkan semuanya */
      document.head.appendChild(s);
    });
  }
  function set(b) {
    b = b === 'en' ? 'en' : 'id'; lang = b;
    try { localStorage.setItem(KUNCI, b); } catch (_) {}
    var selesai = function () {
      if (lang !== b) return;
      terapkan();
      if (b !== 'en' && pengamat) { pengamat.disconnect(); pengamat = null; }
      try { document.dispatchEvent(new CustomEvent('ecowave:lang', { detail: { lang: b } })); } catch (_) {}
    };
    if (b === 'en') muatKamus(selesai); else selesai();
  }

  try { Object.defineProperty(root, 'ECOWAVE_LOC', { get: function () { return lang === 'en' ? 'en-US' : 'id-ID'; }, configurable: true }); } catch (_) {}
  root.ECOWAVE_LANG = {
    get: function () { return lang; }, set: set, t: t, cari: cariTeks, kumpul: kumpul,
    KAMUS: KAMUS, POLA: POLA, gabung: gabung, siap: function () { return kamusSiap; },
    daftar: function () { return Object.keys(KAMUS); }
  };
  if (typeof document === 'undefined') { lang = 'id'; return; }
  lang = baca();
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'id');
  function mulai() { if (lang === 'en') muatKamus(terapkan); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
  window.addEventListener('storage', function (e) { if (e.key === KUNCI) { var b = baca(); if (b !== lang) set(b); } });
})(typeof window !== 'undefined' ? window : globalThis);
