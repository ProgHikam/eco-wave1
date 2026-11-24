/* ECO-WAVE - mode aksesibilitas (disabilitas): ukuran teks, kontras tinggi, font mudah dibaca, jarak teks, sorot tautan,
   fokus keyboard, kursor besar, hentikan animasi/video, skala abu-abu, dan baca nyaring. Pengaturan disimpan di browser (localStorage).
   Buka panel: tombol di navbar atau Alt+A. Tanpa ketergantungan. */
(function (root) {
  'use strict';
  var KUNCI = 'ecowave_a11y';
  var SKALA = [100, 115, 130, 150, 175, 200];                 /* persen, indeks = state.ukuran */
  var AWAL = { ukuran: 0, kontras: '', palet: '', font: '', abu: 0, baris: 0, huruf: 0, tautan: 0, gerak: 0, fokus: 0, kursor: 0, suara: 0 };
  /* pilihan jenis font (satu saja): 'mudah' memakai kelas lama a11y-font agar pengaturan tersimpan tetap berlaku */
  var FONT = {
    mudah:    { nama: 'Mudah dibaca (Verdana)', ket: 'Verdana/Tahoma, cocok untuk low vision', css: 'Verdana,Tahoma,\'Segoe UI\',Arial,sans-serif' },
    lexend:   { nama: 'Lexend', ket: 'Dirancang agar teks lebih lancar dibaca', css: '\'Lexend\',Verdana,sans-serif', muat: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap' },
    atkinson: { nama: 'Atkinson Hyperlegible', ket: 'Huruf dibedakan tegas untuk low vision', css: '\'Atkinson Hyperlegible\',Verdana,sans-serif', muat: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap' },
    disleksia:{ nama: 'OpenDyslexic', ket: 'Huruf berdasar berat untuk disleksia', css: '\'OpenDyslexic\',\'Comic Sans MS\',Verdana,sans-serif', muat: 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/index.css' },
    serif:    { nama: 'Serif (Georgia)', ket: 'Huruf berkaki, nyaman untuk teks panjang', css: 'Georgia,\'Times New Roman\',serif' }
  };
  /* palet warna pilihan (satu saja). Nilai warna ada di aksesibilitas.css; di sini hanya nama dan pratinjau. */
  var PALET = {
    ubur:     { nama: 'Ubur-ubur biru', ket: 'Biru laut dalam dengan aksen kuning pucat', sw: ['#043473', '#476998', '#B2B39D', '#ECEDE0', '#E4D076'] },
    pistasio: { nama: 'Pistachio & Iced Denim', ket: 'Biru denim sejuk dengan aksen hijau pistachio', sw: ['#1E4D7B', '#5798D7', '#B9C255', '#E6F1FA'] },
    galaksi:  { nama: 'Galaksi', ket: 'Ungu nebula dan merah muda di atas langit malam', sw: ['#0D0B2B', '#4B3A9E', '#7A2DB5', '#B79CFF', '#FF7AC8', '#F3EEFF'] },
    pantone:  { nama: 'Pantone Cerulean', ket: 'Cokelat gelap hangat dengan biru cerulean dan krem', sw: ['#231815', '#4A2E27', '#4D0E12', '#A5BCD6', '#F5EFC6'] }
  };
  function kelasFont(n) { return n === 'mudah' ? 'a11y-font' : 'a11y-font-' + n; }
  var KELAS = { abu: 'a11y-abu', baris: 'a11y-baris', huruf: 'a11y-huruf', tautan: 'a11y-tautan', gerak: 'a11y-gerak', fokus: 'a11y-fokus', kursor: 'a11y-kursor' };

  function normalisasi(o) {
    var s = {}, k; o = o && typeof o === 'object' ? o : {};
    for (k in AWAL) s[k] = AWAL[k];
    s.ukuran = Math.max(0, Math.min(SKALA.length - 1, parseInt(o.ukuran, 10) || 0));
    s.kontras = (o.kontras === 'gelap' || o.kontras === 'terang') ? o.kontras : '';
    s.palet = Object.prototype.hasOwnProperty.call(PALET, o.palet) ? o.palet : '';
    s.font = Object.prototype.hasOwnProperty.call(FONT, o.font) ? o.font : (o.font === true || o.font === 1 || o.font === '1') ? 'mudah' : '';
    Object.keys(KELAS).concat(['suara']).forEach(function (n) { s[n] = o[n] ? 1 : 0; });
    return s;
  }
  function daftarKelas(s) {
    var c = [];
    Object.keys(KELAS).forEach(function (n) { if (s[n]) c.push(KELAS[n]); });
    if (s.font) c.push(kelasFont(s.font));
    if (s.palet) c.push('a11y-pal-' + s.palet);
    if (s.kontras === 'gelap') c.push('a11y-kg'); else if (s.kontras === 'terang') c.push('a11y-kt');
    return c;
  }
  root.ECOWAVE_AKS = { normalisasi: normalisasi, daftarKelas: daftarKelas, SKALA: SKALA, AWAL: AWAL, FONT: FONT, PALET: PALET };
  if (typeof document === 'undefined') return;

  var S = AWAL, panel, scrim, terakhir = null, skalaTunda = null, pengamat = null, asli = new WeakMap(), tersentuh = [];

  function baca() { try { return JSON.parse(localStorage.getItem(KUNCI) || 'null'); } catch (_) { return null; } }
  function simpan() { try { localStorage.setItem(KUNCI, JSON.stringify(S)); } catch (_) {} }

  /* ---------- penerapan ---------- */
  function terapkanKelas() {
    var h = document.documentElement;
    ['a11y-kg', 'a11y-kt'].concat(Object.keys(KELAS).map(function (n) { return KELAS[n]; }), Object.keys(FONT).map(kelasFont), Object.keys(PALET).map(function (n) { return 'a11y-pal-' + n; })).forEach(function (c) { h.classList.remove(c); });
    daftarKelas(S).forEach(function (c) { h.classList.add(c); });
    muatFont(S.font);
  }

  /* font web dimuat hanya bila dipilih (butuh internet; tanpa internet jatuh ke font sistem di daftar cadangan) */
  function muatFont(n) {
    var f = FONT[n]; if (!f || !f.muat || document.querySelector('link[data-ax-font="' + n + '"]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f.muat; l.setAttribute('data-ax-font', n); document.head.appendChild(l);
  }

  /* Ukuran teks: CSS situs memakai px, jadi ukuran dihitung ulang per elemen teks (dibaca semua dulu, baru ditulis, agar tidak berlipat). */
  function pengecualian(el) { return el.closest('#a11yPanel,.nv,#pageLoader,svg,script,style,noscript'); }
  function elemenTeks() {
    var set = [], seen = new Set(), w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var el = n.parentElement; if (!el || seen.has(el) || pengecualian(el)) continue;
      seen.add(el); set.push(el);
    }
    return set;
  }
  function pulihkanUkuran() {
    tersentuh.forEach(function (el) {
      var o = asli.get(el); if (!o) return;
      if (o.v) el.style.setProperty('font-size', o.v, o.p); else el.style.removeProperty('font-size');
    });
    tersentuh = [];
  }
  function terapkanUkuran() {
    if (pengamat) pengamat.disconnect();
    pulihkanUkuran();
    var f = SKALA[S.ukuran] / 100;
    if (f !== 1) {
      var els = elemenTeks(), dasar = els.map(function (el) { return parseFloat(getComputedStyle(el).fontSize) || 16; });
      els.forEach(function (el, i) {
        asli.set(el, { v: el.style.getPropertyValue('font-size'), p: el.style.getPropertyPriority('font-size') });
        el.style.setProperty('font-size', (dasar[i] * f).toFixed(2) + 'px', 'important'); tersentuh.push(el);
      });
    }
    document.documentElement.setAttribute('data-a11y-ukuran', String(SKALA[S.ukuran]));
    if (f !== 1) pantau();
  }
  function pantau() {                       /* konten yang digambar JS belakangan (kartu, tabel, hasil pencarian) ikut diperbesar */
    if (!root.MutationObserver) return;
    pengamat = pengamat || new MutationObserver(function (m) {
      if (!m.some(function (r) { return r.target.closest && !r.target.closest('#a11yPanel') && r.addedNodes.length; })) return;
      clearTimeout(skalaTunda); skalaTunda = setTimeout(terapkanUkuran, 350);
    });
    pengamat.observe(document.body, { childList: true, subtree: true });
  }


  /* Kontras tinggi: hanya elemen yang MEMANG punya latar (kartu, panel, tombol, navbar) yang dibuat solid. Elemen tanpa latar
     dibiarkan transparan sehingga video latar tetap terlihat. Elemen ditandai dengan kelas .ax-bg. */
  var pengamatLatar = null, latarTunda = null;
  var LEWATI = 'script,style,noscript,video,canvas,img,svg,#bgVideo,#a11yScrim,#pageLoader,.hero-shade,.hero-waves,.hero-art,.leaflet-tile-pane';
  function tandaiLatar() {
    if (pengamatLatar) pengamatLatar.disconnect();
    var semua = document.body.querySelectorAll('*'), tandai = [], lepas = [], i, el, cs, bc, bi;
    for (i = 0; i < semua.length; i++) {
      el = semua[i];
      if (!S.kontras) { if (el.classList.contains('ax-bg')) lepas.push(el); continue; }
      if (el.closest(LEWATI)) continue;
      cs = getComputedStyle(el); bc = cs.backgroundColor; bi = cs.backgroundImage;
      var punya = (bc && bc !== 'transparent' && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(bc)) || /gradient/.test(bi);
      if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') punya = false;   /* teks bergradasi: biarkan */
      if (punya) tandai.push(el); else if (el.classList.contains('ax-bg')) lepas.push(el);
    }
    tandai.forEach(function (e) { e.classList.add('ax-bg'); });
    lepas.forEach(function (e) { e.classList.remove('ax-bg'); });
    if (S.kontras && root.MutationObserver) {
      pengamatLatar = pengamatLatar || new MutationObserver(function (m) {
        if (!m.some(function (r) { return r.addedNodes.length; })) return;
        clearTimeout(latarTunda); latarTunda = setTimeout(tandaiLatar, 350);
      });
      pengamatLatar.observe(document.body, { childList: true, subtree: true });
    }
  }

  function atur(videoJalan) {
    Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
      try { if (videoJalan) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); } catch (_) {}
    });
  }

  function terapkan(umumkan) {
    terapkanKelas(); tandaiLatar(); terapkanUkuran(); atur(!S.gerak); segarkanPanel();
    simpan();
    if (umumkan) { var l = document.getElementById('axLive'); if (l) l.textContent = umumkan; }
  }

  /* ---------- baca nyaring ---------- */
  var tts = root.speechSynthesis && root.SpeechSynthesisUtterance ? root.speechSynthesis : null;
  function potong(teks) {
    var kal = teks.replace(/\s+/g, ' ').match(/[^.!?;:]+[.!?;:]?\s*/g) || [teks], out = [], cur = '';
    kal.forEach(function (k) { if ((cur + k).length > 180) { if (cur) out.push(cur); cur = k; } else cur += k; });
    if (cur) out.push(cur);
    return out;
  }
  function bacakan(teks) {
    if (!tts || !teks || !teks.trim()) return;
    tts.cancel();
    var en = root.ECOWAVE_LANG && root.ECOWAVE_LANG.get() === 'en', suara = (tts.getVoices() || []).filter(function (v) { return (en ? /^en/i : /^id/i).test(v.lang); })[0];
    potong(teks.slice(0, 20000)).forEach(function (bag) {
      var u = new SpeechSynthesisUtterance(bag); u.lang = (root.ECOWAVE_LANG && root.ECOWAVE_LANG.get() === 'en') ? 'en-US' : 'id-ID'; u.rate = 0.95; if (suara) u.voice = suara; tts.speak(u);
    });
  }
  function berhenti() { if (tts) tts.cancel(); }
  function teksBlok(t) {
    var el = t.closest && t.closest('p,li,h1,h2,h3,h4,h5,h6,td,th,dd,dt,figcaption,label,button,a,summary,.lead');
    return el && !el.closest('#a11yPanel') ? (el.innerText || el.textContent || '').trim().slice(0, 700) : '';
  }
  document.addEventListener('click', function (e) {
    if (!S.suara || !tts || (e.target.closest && e.target.closest('#a11yPanel'))) return;
    var sel = String(root.getSelection ? root.getSelection() : '').trim();
    bacakan(sel || teksBlok(e.target));
  }, true);

  /* ---------- panel ---------- */
  var SAKLAR = [
    ['kontras:gelap', 'bi-circle-half', 'Kontras tinggi: gelap', 'Latar hitam, teks putih, tautan kuning'],
    ['kontras:terang', 'bi-brightness-high', 'Kontras tinggi: terang', 'Latar putih, teks hitam, tautan biru'],
    ['abu', 'bi-palette', 'Skala abu-abu', 'Hilangkan warna (membantu sensitivitas warna)'],
    ['font:mudah', 'bi-fonts', FONT.mudah.nama, FONT.mudah.ket],
    ['font:lexend', 'bi-fonts', FONT.lexend.nama, FONT.lexend.ket],
    ['font:atkinson', 'bi-fonts', FONT.atkinson.nama, FONT.atkinson.ket],
    ['font:disleksia', 'bi-fonts', FONT.disleksia.nama, FONT.disleksia.ket],
    ['font:serif', 'bi-fonts', FONT.serif.nama, FONT.serif.ket],
    ['baris', 'bi-text-paragraph', 'Jarak baris lebih lega', 'Spasi antarbaris 1,85'],
    ['huruf', 'bi-arrows-expand', 'Jarak huruf & kata', 'Spasi antarhuruf dan antarkata lebih renggang'],
    ['tautan', 'bi-link-45deg', 'Garis bawah & tebalkan tautan', 'Tautan mudah dikenali tanpa bergantung warna'],
    ['fokus', 'bi-bounding-box', 'Penanda fokus keyboard tebal', 'Kotak kuning tebal saat memakai Tab'],
    ['kursor', 'bi-cursor', 'Kursor besar', 'Penunjuk mouse diperbesar'],
    ['gerak', 'bi-pause-circle', 'Hentikan animasi & video latar', 'Matikan gerak, ombak, dan video'],
    ['suara', 'bi-volume-up', 'Baca nyaring saat teks diklik', 'Klik paragraf/judul atau blok teks untuk dibacakan'],
    ['palet:ubur', 'bi-palette2', PALET.ubur.nama, PALET.ubur.ket],
    ['palet:pistasio', 'bi-palette2', PALET.pistasio.nama, PALET.pistasio.ket],
    ['palet:pantone', 'bi-palette2', PALET.pantone.nama, PALET.pantone.ket],
    ['palet:galaksi', 'bi-stars', PALET.galaksi.nama, PALET.galaksi.ket]
  ];
  function nilai(k) { var p = k.split(':'); return p.length > 1 ? S[p[0]] === p[1] : !!S[k]; }

  function bangun() {
    if (panel) return;
    scrim = document.createElement('div'); scrim.id = 'a11yScrim'; scrim.addEventListener('click', tutup);
    panel = document.createElement('aside');
    panel.id = 'a11yPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'axJudul');
    var rows = SAKLAR.map(function (r) {
      var ff = r[0].indexOf('font:') === 0 ? ' style="font-family:' + FONT[r[0].slice(5)].css.replace(/"/g, '&quot;') + '"' : '';
      return '<button type="button" class="ax-row" role="switch" aria-checked="false" data-k="' + r[0] + '"' + ff + '><i class="bi ' + r[1] + '" aria-hidden="true"></i><span class="ax-t">' + r[2] + '<small>' + r[3] + '</small></span>' + (r[0].indexOf('palet:') === 0 ? '<span class="ax-sw" aria-hidden="true">' + PALET[r[0].slice(6)].sw.map(function (c) { return '<b style="background:' + c + '"></b>'; }).join('') + '</span>' : '') + '<span class="ax-s">Mati</span></button>';
    });
    function grup(judul, dari, sampai, extra) { return '<div class="ax-grp"><h3>' + judul + '</h3>' + (extra || '') + rows.slice(dari, sampai).join('') + '</div>'; }
    panel.innerHTML =
      '<div class="ax-head"><svg class="ax-ico" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="6.9" r="1.7" fill="currentColor"/><path d="M6.6 10.1c3.6 1 7.2 1 10.8 0M12 10.6v3.4m0 0-2.6 4.4m2.6-4.4 2.6 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><h2 id="axJudul">Mode Aksesibilitas</h2><button type="button" class="ax-x" aria-label="Tutup pengaturan aksesibilitas" title="Tutup (Esc)"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
      '<div class="ax-tabs" role="tablist" aria-label="Kelompok pengaturan"><button type="button" role="tab" id="axTabA" data-tab="a11y" aria-selected="true" aria-controls="axPaneA">Aksesibilitas</button><button type="button" role="tab" id="axTabT" data-tab="tampil" aria-selected="false" aria-controls="axPaneT" tabindex="-1">Tampilan</button></div>' +
      '<div class="ax-body">' +
      '<div class="ax-pane" id="axPaneA" role="tabpanel" aria-labelledby="axTabA">' +
      '<div class="ax-grp"><h3>Ukuran teks</h3><div class="ax-uk"><button type="button" data-u="-1" aria-label="Perkecil teks">A&minus;</button><output id="axUk" aria-live="polite">100%</output><button type="button" data-u="1" aria-label="Perbesar teks">A+</button></div></div>' +
      grup('Kontras & warna', 0, 3) + grup('Jenis font', 3, 8) + grup('Keterbacaan teks', 8, 11) + grup('Gerak, fokus, dan kursor', 11, 14) +
      (tts ? '<div class="ax-grp"><h3>Bantuan suara</h3>' + rows[14] + '<div class="ax-suara"><button type="button" data-a="halaman"><i class="bi bi-play-fill" aria-hidden="true"></i> Bacakan halaman</button><button type="button" data-a="stop"><i class="bi bi-stop-fill" aria-hidden="true"></i> Berhenti</button></div></div>' : '') +
      '</div>' +
      '<div class="ax-pane" id="axPaneT" role="tabpanel" aria-labelledby="axTabT" hidden>' +
      '<div class="ax-grp"><h3>Bahasa</h3><p class="ax-ket">Pilih bahasa tampilan. Teks yang belum punya terjemahan tetap berbahasa Indonesia.</p><div class="ax-lang" role="group" aria-label="Bahasa"><button type="button" data-lang="id" lang="id">Indonesia</button><button type="button" data-lang="en" lang="en" data-no-i18n>English</button></div></div>' +
      grup('Palet warna', 15, 19, '<p class="ax-ket">Palet bawaan tetap dipakai bila tidak ada yang dipilih. Tidak berlaku saat kontras tinggi hidup.</p>') +
      '</div>' +
      '</div><div class="ax-foot"><button type="button" class="ax-reset">Setel ulang semua</button><p>Pengaturan tersimpan di browser ini dan berlaku di semua halaman. Pintasan: Alt+A membuka panel, Ctrl+K mencari.</p></div><div id="axLive" class="ax-live" role="status" aria-live="polite"></div>';
    document.body.appendChild(scrim); document.body.appendChild(panel);

    panel.querySelector('.ax-x').addEventListener('click', tutup);
    panel.querySelector('.ax-reset').addEventListener('click', function () { S = normalisasi(null); berhenti(); terapkan('Semua pengaturan aksesibilitas disetel ulang'); });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-tab')) { pilihTab(b.getAttribute('data-tab')); }
      else if (b.hasAttribute('data-lang')) { if (root.ECOWAVE_LANG) root.ECOWAVE_LANG.set(b.getAttribute('data-lang')); segarkanPanel(); }
      else if (b.hasAttribute('data-u')) { S.ukuran = Math.max(0, Math.min(SKALA.length - 1, S.ukuran + parseInt(b.getAttribute('data-u'), 10))); terapkan('Ukuran teks ' + SKALA[S.ukuran] + ' persen'); }
      else if (b.hasAttribute('data-k')) {
        var k = b.getAttribute('data-k'), p = k.split(':');
        if (p.length > 1) { S[p[0]] = S[p[0]] === p[1] ? '' : p[1]; if (p[0] === 'font') muatFont(S.font); } else S[k] = S[k] ? 0 : 1;
        if (k === 'suara' && !S.suara) berhenti();
        terapkan(b.querySelector('.ax-t').firstChild.nodeValue + (nilai(k) ? ' hidup' : ' mati'));
      } else if (b.getAttribute('data-a') === 'halaman') { var m = document.querySelector('main'); bacakan(m ? m.innerText : document.body.innerText); }
      else if (b.getAttribute('data-a') === 'stop') berhenti();
    });
    panel.addEventListener('keydown', function (e) {       /* panah kiri/kanan berpindah antar tab */
      var t = e.target.closest && e.target.closest('[role=tab]');
      if (t && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End')) {
        e.preventDefault(); var n = t.getAttribute('data-tab') === 'a11y' ? 'tampil' : 'a11y'; pilihTab(n);
        var nt = panel.querySelector('[data-tab="' + n + '"]'); if (nt) nt.focus();
      }
    });
    panel.addEventListener('keydown', function (e) {       /* fokus tidak keluar dari panel */
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(panel.querySelectorAll('button:not(:disabled)'), function (x) { return x.offsetParent !== null; }); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    segarkanPanel();
  }

  function pilihTab(n) {
    if (!panel) return;
    Array.prototype.forEach.call(panel.querySelectorAll('[role=tab]'), function (t) { var on = t.getAttribute('data-tab') === n; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
    panel.querySelector('#axPaneA').hidden = n !== 'a11y'; panel.querySelector('#axPaneT').hidden = n !== 'tampil';
    var bd = panel.querySelector('.ax-body'); if (bd) bd.scrollTop = 0;
  }
  function segarkanPanel() {
    if (!panel) return;
    Array.prototype.forEach.call(panel.querySelectorAll('.ax-row'), function (b) {
      var on = nilai(b.getAttribute('data-k'));
      b.setAttribute('aria-checked', on ? 'true' : 'false'); b.querySelector('.ax-s').textContent = on ? 'Hidup' : 'Mati';
    });
    var bhs = root.ECOWAVE_LANG ? root.ECOWAVE_LANG.get() : 'id';
    Array.prototype.forEach.call(panel.querySelectorAll('[data-lang]'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === bhs ? 'true' : 'false'); });
    panel.querySelector('#axUk').textContent = SKALA[S.ukuran] + '%';
    panel.querySelector('[data-u="-1"]').disabled = S.ukuran === 0;
    panel.querySelector('[data-u="1"]').disabled = S.ukuran === SKALA.length - 1;
    var t = document.querySelector('[data-aks]'); if (t) t.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
  }

  function buka() {
    bangun(); terakhir = document.activeElement;
    panel.classList.add('is-open'); scrim.classList.add('is-open'); segarkanPanel();
    setTimeout(function () { var x = panel.querySelector('.ax-x'); if (x) x.focus(); }, 20);
  }
  function tutup() {
    if (!panel) return;
    panel.classList.remove('is-open'); scrim.classList.remove('is-open'); segarkanPanel();
    if (terakhir && terakhir.focus) try { terakhir.focus(); } catch (_) {}
  }
  function terbuka() { return panel && panel.classList.contains('is-open'); }

  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-aks]'); if (t) { e.preventDefault(); terbuka() ? tutup() : buka(); } });
  document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 'a' || e.key === 'A') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); terbuka() ? tutup() : buka(); }
    else if (e.key === 'Escape' && terbuka()) { e.preventDefault(); tutup(); }
  });

  /* ---------- mulai ---------- */
  function mulai() {
    var simpanan = baca();
    S = normalisasi(simpanan);
    if (!simpanan && root.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) S.gerak = 1;   /* hormati pengaturan sistem */
    terapkanKelas(); atur(!S.gerak);
    if (S.kontras) tandaiLatar();
    if (S.ukuran) terapkanUkuran();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai); else mulai();
  window.addEventListener('load', function () { if (S.kontras) tandaiLatar(); if (S.ukuran) terapkanUkuran(); if (S.gerak) atur(false); });
  root.ECOWAVE_AKS.buka = buka;
})(typeof window !== 'undefined' ? window : globalThis);
