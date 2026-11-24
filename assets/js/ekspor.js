/* ECO-WAVE: Export PNG & PDF laporan analisis. Tanpa pustaka luar: laporan digambar sendiri di <canvas>.
   PNG  = satu gambar panjang beresolusi tinggi (skala 2x), tidak terpotong.
   PDF  = laporan A4 beberapa halaman (tiap halaman JPEG), penulis PDF ditulis sendiri.
   Dipakai Peta & Kalkulator: ECOWAVE_EKSPOR.pasang({png, pdf, ambil}) dengan ambil() -> sumber analisis terkini (atau null). */
(function () {
  'use strict';
  const E = window.ECOWAVE;
  const LEBAR = 1200, MARGIN = 56, ISI = LEBAR - 2 * MARGIN, SKALA = 2, A4 = 297 / 210, HAL_T = Math.round(LEBAR * A4);
  const FONT = '"Helvetica Neue",Helvetica,Arial,sans-serif';
  const WARNA = { teks: '#25344F', mut: '#617891', garis: '#D5B893', latar: '#F5EFE6', kartu: '#F5EFE6', aksen: '#6F4D38', gelap: '#25344F' };
  const n2 = (x, d = 2) => (x == null || !isFinite(x)) ? '-' : Number(x).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
  const hariIni = () => new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  // ------------------------------------------------------------------ notifikasi
  function toast(pesan, jenis) {
    let w = document.getElementById('ekspor-toast');
    if (!w) {
      w = document.createElement('div'); w.id = 'ekspor-toast'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite');
      document.body.appendChild(w);
    }
    const t = document.createElement('div'); t.className = 'ekspor-toast ' + (jenis || 'info'); t.textContent = pesan; w.appendChild(t);
    setTimeout(() => { t.classList.add('hilang'); setTimeout(() => t.remove(), 400); }, jenis === 'galat' ? 7000 : 4000);
    return t;
  }

  // ------------------------------------------------------------------ mesin tata letak (daftar blok)
  const ukur = document.createElement('canvas').getContext('2d');
  function bungkus(ctx, teks, lebar) {
    const baris = [];
    String(teks).split('\n').forEach(par => {
      let cur = '';
      par.split(/\s+/).forEach(k => {
        if (!k) return;
        const uji = cur ? cur + ' ' + k : k;
        if (ctx.measureText(uji).width <= lebar || !cur) cur = uji; else { baris.push(cur); cur = k; }
      });
      baris.push(cur);
    });
    return baris;
  }
  function Tata() {
    const blok = [];
    const T = {
      blok,
      judul(t, no) {
        blok.push({ h: 58, tahan: true, gambar(c, y) {
          c.fillStyle = WARNA.aksen; c.fillRect(MARGIN, y + 14, 6, 30);
          c.fillStyle = WARNA.teks; c.font = '700 26px ' + FONT; c.textBaseline = 'middle';
          c.fillText((no ? no + '. ' : '') + t, MARGIN + 18, y + 30);
        } });
      },
      para(t, o) {
        o = o || {}; const f = (o.tebal ? '700 ' : '') + (o.ukuran || 18) + 'px ' + FONT, lh = Math.round((o.ukuran || 18) * 1.5);
        ukur.font = f; const w = o.lebar || ISI, br = bungkus(ukur, t, w - (o.pad || 0) * 2);
        const h = br.length * lh + (o.pad || 0) * 2 + 10;
        blok.push({ h, gambar(c, y) {
          if (o.latar) { c.fillStyle = o.latar; c.fillRect(MARGIN, y, w, h - 8); if (o.garis) { c.fillStyle = o.garis; c.fillRect(MARGIN, y, 5, h - 8); } }
          c.fillStyle = o.warna || WARNA.teks; c.font = f; c.textBaseline = 'alphabetic';
          br.forEach((b, i) => c.fillText(b, MARGIN + (o.pad || 0) + (o.garis ? 6 : 0), y + (o.pad || 0) + (i + 1) * lh - 6));
        } });
      },
      jarak(h) { blok.push({ h: h || 14, gambar() {} }); },
      kv(baris, kolom) {
        kolom = kolom || 2; const lebarK = ISI / kolom, rh = 34, n = Math.ceil(baris.length / kolom);
        blok.push({ h: n * rh + 8, gambar(c, y) {
          c.textBaseline = 'alphabetic';
          baris.forEach((r, i) => {
            const x = MARGIN + (i % kolom) * lebarK, yy = y + Math.floor(i / kolom) * rh;
            c.fillStyle = (Math.floor(i / kolom) % 2) ? '#F5EFE6' : WARNA.kartu; c.fillRect(x, yy, lebarK - 8, rh - 2);
            c.fillStyle = WARNA.mut; c.font = '15px ' + FONT; c.fillText(r[0], x + 12, yy + 22);
            c.fillStyle = WARNA.teks; c.font = '700 16px ' + FONT; c.textAlign = 'right'; c.fillText(String(r[1]), x + lebarK - 20, yy + 22); c.textAlign = 'left';
          });
        } });
      },
      tabel(kepala, baris, lebarKol, o) {
        o = o || {}; const rh = 36, tot = lebarKol.reduce((a, b) => a + b, 0), kol = lebarKol.map(v => v / tot * ISI);
        blok.push({ h: (baris.length + 1) * rh + 10, gambar(c, y) {
          c.textBaseline = 'alphabetic'; c.fillStyle = WARNA.gelap; c.fillRect(MARGIN, y, ISI, rh);
          let x = MARGIN; c.fillStyle = '#F5EFE6'; c.font = '700 15px ' + FONT;
          kepala.forEach((k, i) => { c.textAlign = i === 0 ? 'left' : 'right'; c.fillText(k, i === 0 ? x + 12 : x + kol[i] - 12, y + 24); x += kol[i]; });
          baris.forEach((r, j) => {
            const yy = y + (j + 1) * rh; c.fillStyle = j % 2 ? '#F5EFE6' : WARNA.kartu; c.fillRect(MARGIN, yy, ISI, rh);
            let xx = MARGIN;
            r.forEach((v, i) => {
              c.fillStyle = WARNA.teks; c.font = (i === 0 || (o.tebalKol === i) ? '700 ' : '') + '15px ' + FONT; c.textAlign = i === 0 ? 'left' : 'right';
              let s = String(v); const maks = kol[i] - 20; while (c.measureText(s).width > maks && s.length > 3) s = s.slice(0, -2);
              if (s !== String(v)) s = s.slice(0, -1) + '…';
              c.fillText(s, i === 0 ? xx + 12 : xx + kol[i] - 12, yy + 24); xx += kol[i];
            });
          });
          c.strokeStyle = WARNA.garis; c.strokeRect(MARGIN + .5, y + .5, ISI - 1, (baris.length + 1) * rh - 1); c.textAlign = 'left';
        } });
      },
      gambar(cv, lebar, tinggi, keterangan) {
        const kap = keterangan ? 26 : 0;
        blok.push({ h: tinggi + kap + 12, gambar(c, y) {
          c.drawImage(cv, MARGIN + (ISI - lebar) / 2, y, lebar, tinggi); c.strokeStyle = WARNA.garis; c.strokeRect(MARGIN + (ISI - lebar) / 2 + .5, y + .5, lebar - 1, tinggi - 1);
          if (keterangan) { c.fillStyle = WARNA.mut; c.font = 'italic 14px ' + FONT; c.textAlign = 'center'; c.fillText(keterangan, MARGIN + ISI / 2, y + tinggi + 20); c.textAlign = 'left'; }
        } });
      },
      kustom(h, fn) { blok.push({ h, gambar: fn }); }
    };
    return T;
  }
  function gambarBlok(c, daftar, y0) { let y = y0; daftar.forEach(b => { b.gambar(c, y); y += b.h; }); return y; }
  const tinggiBlok = d => d.reduce((a, b) => a + b.h, 0);

  // ------------------------------------------------------------------ gambar kecil: bar skor & garis bulanan
  function barSkor(items, lebar, tinggi) {
    const cv = document.createElement('canvas'); cv.width = lebar * SKALA; cv.height = tinggi * SKALA; const c = cv.getContext('2d'); c.scale(SKALA, SKALA);
    c.fillStyle = '#F5EFE6'; c.fillRect(0, 0, lebar, tinggi);
    const kiri = 150, kanan = 40, top = 34, bar = (tinggi - top - 20) / items.length;
    c.fillStyle = WARNA.teks; c.font = '700 16px ' + FONT; c.fillText('Skor tiap indikator (skala 1–5)', 12, 22);
    for (let v = 0; v <= 5; v++) {
      const x = kiri + (lebar - kiri - kanan) * v / 5; c.strokeStyle = '#F5EFE6'; c.beginPath(); c.moveTo(x, top - 4); c.lineTo(x, tinggi - 18); c.stroke();
      c.fillStyle = WARNA.mut; c.font = '12px ' + FONT; c.textAlign = 'center'; c.fillText(v, x, tinggi - 4);
    }
    c.textAlign = 'left';
    items.forEach((it, i) => {
      const y = top + i * bar + 6, w = (lebar - kiri - kanan) * it.nilai / 5;
      c.fillStyle = WARNA.teks; c.font = '14px ' + FONT; c.fillText(it.nama, 12, y + bar / 2 - 2);
      c.fillStyle = it.warna; c.fillRect(kiri, y, Math.max(2, w), bar - 14);
      c.fillStyle = WARNA.teks; c.font = '700 13px ' + FONT; c.fillText(n2(it.nilai, 1), kiri + w + 6, y + bar / 2 - 2);
    });
    return cv;
  }
  function garisBulanan(label, nilai, lebar, tinggi, judul, satuan) {
    const cv = document.createElement('canvas'); cv.width = lebar * SKALA; cv.height = tinggi * SKALA; const c = cv.getContext('2d'); c.scale(SKALA, SKALA);
    c.fillStyle = '#F5EFE6'; c.fillRect(0, 0, lebar, tinggi);
    const kiri = 52, kanan = 18, top = 40, bwh = 30, mx = Math.max(...nilai) * 1.1, W = lebar - kiri - kanan, H = tinggi - top - bwh;
    c.fillStyle = WARNA.teks; c.font = '700 16px ' + FONT; c.fillText(judul, 12, 22);
    c.font = '12px ' + FONT; c.fillStyle = WARNA.mut;
    for (let i = 0; i <= 4; i++) { const v = mx * i / 4, y = top + H - H * i / 4; c.strokeStyle = '#F5EFE6'; c.beginPath(); c.moveTo(kiri, y); c.lineTo(kiri + W, y); c.stroke(); c.textAlign = 'right'; c.fillText(n2(v, 0), kiri - 6, y + 4); }
    c.textAlign = 'center';
    const px = i => kiri + W * (i + .5) / nilai.length, py = v => top + H - H * v / mx;
    label.forEach((l, i) => c.fillText(l, px(i), tinggi - 10));
    c.strokeStyle = WARNA.aksen; c.lineWidth = 2.5; c.beginPath(); nilai.forEach((v, i) => i ? c.lineTo(px(i), py(v)) : c.moveTo(px(i), py(v))); c.stroke();
    c.fillStyle = WARNA.aksen; nilai.forEach((v, i) => { c.beginPath(); c.arc(px(i), py(v), 4, 0, 7); c.fill(); });
    c.textAlign = 'left'; c.fillStyle = WARNA.mut; c.fillText(satuan, kiri + W - 60, 22);
    return cv;
  }

  // ------------------------------------------------------------------ snapshot peta (tile + overlay + marker)
  function muatGambar(src) { return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  async function snapshotPeta(map, titik, lebar, tinggi, denganTile) {
    const cont = map.getContainer(), R = cont.getBoundingClientRect(), sx = lebar / R.width, sy = tinggi / R.height;
    const cv = document.createElement('canvas'); cv.width = lebar * SKALA; cv.height = tinggi * SKALA; const c = cv.getContext('2d'); c.scale(SKALA, SKALA);
    c.fillStyle = '#F5EFE6'; c.fillRect(0, 0, lebar, tinggi);
    c.save(); c.beginPath(); c.rect(0, 0, lebar, tinggi); c.clip();
    const rel = el => { const r = el.getBoundingClientRect(); return [(r.left - R.left) * sx, (r.top - R.top) * sy, r.width * sx, r.height * sy]; };
    if (denganTile) cont.querySelectorAll('.leaflet-tile-pane img.leaflet-tile').forEach(im => {
      if (!im.complete || !im.naturalWidth) return; const [x, y, w, h] = rel(im); const op = parseFloat(getComputedStyle(im.parentElement).opacity) || 1;
      c.globalAlpha = op; try { c.drawImage(im, x, y, w + .6, h + .6); } catch (e) { } c.globalAlpha = 1;
    });
    const sv = [...cont.querySelectorAll('.leaflet-overlay-pane svg')];
    for (const s of sv) {
      try {
        const r = s.getBoundingClientRect(); if (!r.width) continue;
        const kl = s.cloneNode(true); kl.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); kl.setAttribute('width', r.width); kl.setAttribute('height', r.height);
        kl.removeAttribute('style'); const vb = s.getAttribute('viewBox'); if (!vb) kl.setAttribute('viewBox', '0 0 ' + r.width + ' ' + r.height);
        const im = await muatGambar('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(kl)));
        if (im) { const [x, y, w, h] = rel(s); c.drawImage(im, x, y, w, h); }
      } catch (e) { }
    }
    cont.querySelectorAll('.leaflet-overlay-pane canvas').forEach(cn => { try { const [x, y, w, h] = rel(cn); c.drawImage(cn, x, y, w, h); } catch (e) { } });
    cont.querySelectorAll('.leaflet-marker-pane img').forEach(im => { try { if (im.complete && im.naturalWidth) { const [x, y, w, h] = rel(im); c.drawImage(im, x, y, w, h); } } catch (e) { } });
    if (titik) {
      const p = map.latLngToContainerPoint([titik.lat, titik.lng]), x = p.x * sx, y = p.y * sy;
      c.strokeStyle = '#F5EFE6'; c.lineWidth = 5; c.fillStyle = '#632024'; c.beginPath(); c.arc(x, y, 9, 0, 7); c.stroke(); c.fill();
      c.strokeStyle = '#632024'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 18, 0, 7); c.stroke();
    }
    // skala (km) dari lebar piksel ~120
    try {
      const y = map.getSize().y / 2, a = map.containerPointToLatLng([10, y]), b = map.containerPointToLatLng([130, y]), km = a.distanceTo(b) / 1000;
      const pil = [100, 50, 25, 20, 10, 5, 2, 1, .5].find(v => v <= km) || .5, pxw = 120 * pil / km * sx;
      c.fillStyle = 'rgba(245,239,230,.85)'; c.fillRect(10, tinggi - 40, pxw + 20, 30); c.fillStyle = '#25344F'; c.fillRect(20, tinggi - 22, pxw, 4);
      c.fillRect(20, tinggi - 28, 2, 10); c.fillRect(20 + pxw - 2, tinggi - 28, 2, 10); c.font = '700 13px ' + FONT; c.fillText(pil + ' km', 20, tinggi - 30);
    } catch (e) { }
    c.restore();
    return cv;
  }
  async function petaAman(map, titik, w, h) {
    let cv = await snapshotPeta(map, titik, w, h, true), tanpa = false;
    try { cv.toDataURL('image/png', .1); } catch (e) { tanpa = true; cv = await snapshotPeta(map, titik, w, h, false); }
    return { cv, tanpaTile: tanpa };
  }

  // ------------------------------------------------------------------ model laporan -> blok
  const VERDICT = { 'Sangat Layak': 'Titik ini sangat menjanjikan untuk dikembangkan sebagai zona PLTGL.', 'Layak': 'Titik ini layak dipertimbangkan sebagai zona PLTGL.', 'Cukup Layak': 'Titik ini cukup layak, tetapi ada indikator yang perlu diperbaiki atau diverifikasi.', 'Kurang Layak': 'Titik ini kurang layak; beberapa indikator lemah.', 'Tidak Layak': 'Titik ini tidak layak menurut parameter saat ini.' };
  function interpretasi(src) {
    const { m, sp } = src, kl = m.kelas, gugur = src.EX && m.ex, F = E.FAKTOR;
    const idx = m.s.map((v, i) => [v, i]), kuat = idx.reduce((a, b) => b[0] > a[0] ? b : a), lemah = idx.reduce((a, b) => b[0] < a[0] ? b : a);
    let t = gugur ? 'Titik ini TIDAK BOLEH dipakai karena melanggar aturan eksklusi: ' + sp.ex.map(x => x.teks).join('; ') + '. Skor akhir dipaksa 0.' : (VERDICT[kl.n] || '');
    if (!gugur) t += ' Indikator terkuat: ' + F[kuat[1]].nama + ' (' + n2(kuat[0], 1) + '/5); terlemah: ' + F[lemah[1]].nama + ' (' + n2(lemah[0], 1) + '/5).';
    if (!src.EX && m.ex) t += ' Perhatian: eksklusi dinonaktifkan, padahal titik ini terkena aturan eksklusi (' + sp.ex.map(x => x.teks).join('; ') + ').';
    (sp.peringatan || []).forEach(p => { t += '\nCatatan: ' + p; });
    return t;
  }
  const NAMA_LAYER = { mangrove: 'mangrove', karang: 'karang', reef: 'reef', lamun: 'lamun', konservasi: 'kawasan konservasi' };

  async function bangunLaporan(src) {
    const { m, sp, gel, en, P } = src, F = E.FAKTOR, T = Tata(), W = m.w, kl = m.kelas, gugur = src.EX && m.ex;
    const musim = E.MUSIM_NAMA[src.musim || 'thn'] || 'Tahunan';
    const wk = gugur ? '#D5B893' : kl.c;

    // 1. ringkasan
    T.judul('Ringkasan hasil', 1);
    T.kustom(150, (c, y) => {
      c.fillStyle = WARNA.kartu; c.fillRect(MARGIN, y, ISI, 140);
      c.fillStyle = wk; c.fillRect(MARGIN, y, 10, 140); c.textBaseline = 'alphabetic';
      c.fillStyle = WARNA.mut; c.font = '15px ' + FONT; c.fillText('Skor MCDA akhir', MARGIN + 34, y + 34);
      c.fillStyle = WARNA.teks; c.font = '800 64px ' + FONT; const st = n2(m.fin); c.fillText(st, MARGIN + 34, y + 100);
      const lw = c.measureText(st).width; c.fillStyle = WARNA.mut; c.font = '20px ' + FONT; c.fillText('/ 5', MARGIN + 34 + lw + 8, y + 100);
      c.font = '800 20px ' + FONT; const nm = gugur ? 'Tereksklusi' : kl.n, bw = c.measureText(nm).width + 32;
      c.fillStyle = wk; roundRect(c, MARGIN + 34, y + 108, bw, 26, 13); c.fill(); c.fillStyle = (m.fin >= 4.2 && !gugur) ? '#F5EFE6' : '#25344F'; c.font = '800 16px ' + FONT; c.fillText(nm, MARGIN + 50, y + 127);
      const kv = [['Daya gelombang', n2(gel.kw) + ' kW/m'], ['Daya listrik', n2(en.pKw, 1) + ' kW'], ['Energi per tahun', n2(en.kwhTahun / 1000, 1) + ' MWh'], ['Rumah 900 VA (tahunan)', en.rumah[900].tahunan.toLocaleString('id-ID')]];
      kv.forEach((r, i) => { const x = MARGIN + 420 + (i % 2) * 340, yy = y + 44 + Math.floor(i / 2) * 56; c.fillStyle = WARNA.mut; c.font = '14px ' + FONT; c.fillText(r[0], x, yy); c.fillStyle = WARNA.teks; c.font = '700 22px ' + FONT; c.fillText(r[1], x, yy + 28); });
    });
    T.jarak(10);
    T.para('Interpretasi: ' + interpretasi(src), { latar: '#F5EFE6', garis: WARNA.aksen, pad: 14, ukuran: 17 });
    T.jarak();

    // 2. lokasi & parameter
    T.judul('Lokasi dan parameter masukan', 2);
    T.kv([
      ['Koordinat', n2(src.lat, 5) + ', ' + n2(src.lng, 5)], ['Musim analisis', musim],
      ['Sumber gelombang', gel.label || '-'], ['Hs / Te', n2(gel.hs) + ' m / ' + n2(gel.te, 1) + ' s'],
      ['Daya gelombang P = 0,49·Hs²·Te', n2(gel.kw) + ' kW/m'], ['Eksklusi (buffer)', src.EX ? 'Aktif' : 'Nonaktif'],
      ['Lebar tangkap', n2(P.lebar, 0) + ' m'], ['Efisiensi perangkat', Math.round(P.efisiensi * 100) + ' %'],
      ['Jumlah unit', P.unit], ['Faktor kapasitas', Math.round(P.cf * 100) + ' %'],
      ['Rentang acuan skor Daya', n2(P.dayaRef[0]) + ' – ' + n2(P.dayaRef[1]) + ' kW/m'], ['Mode skor Daya / Jarak', P.dayaMode + ' / ' + P.jarMode]
    ]);
    T.jarak();

    // 3. indikator, bobot, skor
    T.judul('Indikator, bobot, dan perhitungan skor', 3);
    const nilaiUkur = [
      n2(gel.kw) + ' kW/m',
      sp.dEko != null && isFinite(sp.dEko) ? n2(sp.dEko) + ' km (' + (NAMA_LAYER[sp.ekoNama] || sp.ekoNama) + ')' : 'tidak ada ekosistem terdata',
      sp.kedalaman ? (sp.kedalaman.z != null ? n2(sp.kedalaman.z, 0) + ' m' : sp.kedalaman.rentang) : 'tidak diketahui',
      sp.dGrid != null ? n2(sp.dGrid) + ' km ke jaringan' + (sp.desa ? '' : '') : (sp.desa ? n2(sp.desa.d) + ' km ke desa' : 'tidak diketahui')
    ];
    T.tabel(['Indikator', 'Nilai terukur', 'Skor', 'Bobot', 'Kontribusi'],
      F.map((f, i) => [f.nama, nilaiUkur[i], n2(m.s[i], 2) + ' / 5', n2(W[f.key] * 100, 0) + ' %', n2(m.kontribusi[i], 2)])
        .concat([['Skor akhir (Σ kontribusi)', '', '', '100 %', n2(m.raw, 2)]]), [2.2, 3, 1.2, 1, 1.2], { tebalKol: 4 });
    T.para('Skor akhir = Σ (skor indikator × bobot)' + (gugur ? '; lalu dikali mask eksklusi sehingga menjadi 0.' : '.') + ' Bobot 40:30:15:15 adalah asumsi metodologis tim yang belum divalidasi (lihat Tentang Data → Studi Literatur dan Referensi Akademis).', { ukuran: 14, warna: WARNA.mut });
    T.gambar(barSkor(F.map((f, i) => ({ nama: f.nama, nilai: m.s[i], warna: ['#617891', '#617891', '#6F4D38', '#D5B893'][i] })), ISI, 230), ISI, 230);
    T.jarak();

    // 4. legenda kelas
    T.judul('Legenda kelas kelayakan', 4);
    const leg = E.KELAS_LEGENDA;
    T.kustom(70, (c, y) => {
      const w = ISI / leg.length; c.textBaseline = 'alphabetic';
      leg.forEach((k, i) => {
        const x = MARGIN + i * w; c.fillStyle = k.warna; c.fillRect(x, y, w - 6, 26);
        c.fillStyle = WARNA.teks; c.font = '700 15px ' + FONT; c.fillText(k.nama, x, y + 46); c.fillStyle = WARNA.mut; c.font = '13px ' + FONT; c.fillText(k.teks, x, y + 64);
        if (!gugur && k.nama === kl.n) { c.strokeStyle = WARNA.teks; c.lineWidth = 3; c.strokeRect(x - 1, y - 1, w - 4, 28); }
      });
    });
    T.jarak();

    // 5. peta
    if (src.map) {
      T.judul('Peta lokasi', 5);
      const mw = ISI, mh = Math.round(ISI * .56), { cv, tanpaTile } = await petaAman(src.map, { lat: src.lat, lng: src.lng }, mw, mh);
      T.gambar(cv, mw, mh, 'Titik analisis (penanda merah) pada peta yang sedang tampil, termasuk layer aktif dan skala.' + (tanpaTile ? ' Peta dasar tidak dapat disertakan (dibatasi CORS peramban).' : ''));
      T.jarak();
    }

    // 6. grafik
    if (src.pTahunan && gel.src === 'cmems') {
      T.judul('Pola gelombang bulanan', 6);
      const r = src.pTahunan / CMEMS.klimRata, nilai = CMEMS.bulanan.p.map(p => +(p * r).toFixed(2));
      T.gambar(garisBulanan(CMEMS.bulanan.label, nilai, ISI, 260, 'Estimasi daya gelombang bulanan di titik ini', 'kW/m'), ISI, 260, 'Klimatologi CMEMS 2015–2024 diskalakan ke rata-rata tahunan titik ini; asumsi pola musiman sama di seluruh area.');
      T.jarak();
    }

    // 7. jarak ke layer
    const baris = [];
    Object.keys(sp.jarak || {}).forEach(k => { const i = sp.info[k]; baris.push([k.replace(/_/g, ' '), i && i.di_dalam ? 'di dalam' : n2(sp.jarak[k]) + ' km']); });
    if (baris.length) {
      T.judul('Jarak ke layer terdekat', 7);
      T.tabel(['Layer', 'Jarak ke tepi'], baris, [3, 2]);
      T.jarak();
    }

    // 8. sumber & metodologi
    T.judul('Sumber data dan metodologi', 8);
    T.para('Sumber data: gelombang CMEMS 2015–2024 (Copernicus Marine Service) dan BMKG Maritim; ekosistem karang/lamun Allen Coral Atlas, mangrove dan kawasan konservasi dari layer proyek; kedalaman ETOPO1 (NOAA NGDC, 2009); infrastruktur listrik dari ekspor proyek ArcGIS/OpenStreetMap. Status, tahun, dan lembaga tiap lapisan: halaman Tentang Data → Tabel sumber data lengkap. Data berlabel "Data Simulasi" tidak boleh dibaca sebagai data aktual.', { ukuran: 15 });
    T.para('Metode: Daya gelombang diinterpolasi IDW (bobot 1/jarak²) dari titik CMEMS dan diskalakan per musim. Keempat indikator diubah ke skor 1–5, digabung dengan kombinasi linear terbobot (MCDA), dan dikalikan mask eksklusi. Kelas: ≥ 4,2 Sangat Layak; 3,4–4,2 Layak; 2,6–3,4 Cukup Layak; 1,8–2,6 Kurang Layak; < 1,8 Tidak Layak.', { ukuran: 15 });
    T.para('Keterbatasan: hasil adalah penapisan awal, bukan studi kelayakan. Bobot, ambang, dan buffer adalah asumsi tim; ETOPO1 berresolusi ±1,85 km; estimasi energi/rumah bersifat kasar. Verifikasi lapangan diperlukan sebelum keputusan perencanaan.', { ukuran: 15, latar: '#F5EFE6', garis: '#D5B893', pad: 12 });
    return { T, judul: 'ECO-WAVE – Laporan Analisis Zona PLTGL', sub: 'Pesisir Selatan Banten • ' + hariIni() };
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  // ------------------------------------------------------------------ render ke kanvas
  function kopKaki(c, lap, hal, total, lebar) {
    c.fillStyle = WARNA.gelap; c.fillRect(0, 0, lebar, 84);
    c.fillStyle = '#F5EFE6'; c.font = '800 28px ' + FONT; c.textBaseline = 'alphabetic'; c.fillText(lap.judul, MARGIN, 42);
    c.fillStyle = '#D5B893'; c.font = '15px ' + FONT; c.fillText(lap.sub, MARGIN, 66);
  }
  function renderPng(lap) {
    const kop = 104, kaki = 60, tot = kop + tinggiBlok(lap.T.blok) + kaki;
    if (tot * SKALA > 32000) throw new Error('Laporan terlalu panjang untuk satu gambar');
    const cv = document.createElement('canvas'); cv.width = LEBAR * SKALA; cv.height = tot * SKALA; const c = cv.getContext('2d'); c.scale(SKALA, SKALA);
    c.fillStyle = WARNA.latar; c.fillRect(0, 0, LEBAR, tot); kopKaki(c, lap, 1, 1, LEBAR);
    gambarBlok(c, lap.T.blok, kop);
    c.fillStyle = WARNA.mut; c.font = '13px ' + FONT; c.fillText('Dibuat oleh ECO-WAVE • ' + hariIni() + ' • Hasil penapisan awal; bobot dan ambang adalah asumsi tim.', MARGIN, tot - 24);
    return cv;
  }
  function renderHalaman(lap) {
    const kop = 104, kaki = 56, isi = HAL_T - kop - kaki, hal = []; let cur = [], h = 0;
    lap.T.blok.forEach(b => { if (h + b.h > isi && cur.length) { hal.push(cur); cur = []; h = 0; } cur.push(b); h += b.h; });
    if (cur.length) hal.push(cur);
    // judul bagian tidak boleh sendirian di akhir halaman
    for (let i = 0; i < hal.length - 1; i++) { const l = hal[i][hal[i].length - 1]; if (l.tahan && hal[i].length > 1) { hal[i].pop(); hal[i + 1].unshift(l); } }
    return hal.map((d, i) => {
      const cv = document.createElement('canvas'); cv.width = LEBAR * SKALA; cv.height = HAL_T * SKALA; const c = cv.getContext('2d'); c.scale(SKALA, SKALA);
      c.fillStyle = WARNA.latar; c.fillRect(0, 0, LEBAR, HAL_T); kopKaki(c, lap, i + 1, hal.length, LEBAR);
      gambarBlok(c, d, kop);
      c.fillStyle = WARNA.mut; c.font = '13px ' + FONT; c.fillText('ECO-WAVE • Hasil penapisan awal; bobot dan ambang adalah asumsi tim.', MARGIN, HAL_T - 22);
      c.textAlign = 'right'; c.fillText('Halaman ' + (i + 1) + ' dari ' + hal.length, LEBAR - MARGIN, HAL_T - 22); c.textAlign = 'left';
      return cv;
    });
  }

  // ------------------------------------------------------------------ penulis PDF
  const enc = new TextEncoder();
  function buatPdf(jpegs, judul) {
    const bagian = []; let pos = 0; const off = [];
    const tulis = x => { const b = typeof x === 'string' ? enc.encode(x) : x; bagian.push(b); pos += b.length; };
    const obj = (n, isi) => { off[n] = pos; tulis(n + ' 0 obj\n'); tulis(isi); tulis('\nendobj\n'); };
    tulis('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    const nHal = jpegs.length, PW = 595.28, PH = 841.89;
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Count ' + nHal + ' /Kids [' + jpegs.map((_, i) => (3 + i * 3) + ' 0 R').join(' ') + '] >>');
    jpegs.forEach((j, i) => {
      const p = 3 + i * 3, ct = p + 1, im = p + 2, isi = 'q ' + PW + ' 0 0 ' + PH + ' 0 0 cm /Im0 Do Q';
      obj(p, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /XObject << /Im0 ' + im + ' 0 R >> >> /Contents ' + ct + ' 0 R >>');
      obj(ct, '<< /Length ' + isi.length + ' >>\nstream\n' + isi + '\nendstream');
      off[im] = pos; tulis(im + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + j.w + ' /Height ' + j.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + j.bytes.length + ' >>\nstream\n'); tulis(j.bytes); tulis('\nendstream\nendobj\n');
    });
    const info = 3 + nHal * 3, d = new Date(), pad = v => String(v).padStart(2, '0');
    const tgl = 'D:' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
    obj(info, '<< /Title (' + judul.replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '-') + ') /Creator (ECO-WAVE) /Producer (ECO-WAVE ekspor.js) /CreationDate (' + tgl + ') >>');
    const xr = pos, total = info + 1; tulis('xref\n0 ' + total + '\n0000000000 65535 f \n');
    for (let n = 1; n < total; n++) tulis(String(off[n]).padStart(10, '0') + ' 00000 n \n');
    tulis('trailer\n<< /Size ' + total + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xr + '\n%%EOF\n');
    return new Blob(bagian, { type: 'application/pdf' });
  }
  const keBlob = (cv, tipe, q) => new Promise((res, rej) => { try { cv.toBlob(b => b ? res(b) : rej(new Error('Kanvas gagal dikonversi')), tipe, q); } catch (e) { rej(e); } });

  // ------------------------------------------------------------------ unduh
  function unduh(blob, nama) {
    if (navigator.msSaveOrOpenBlob) { navigator.msSaveOrOpenBlob(blob, nama); return; }
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = nama; a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
  }
  const namaBerkas = (src, ext) => { const d = new Date(), p = v => String(v).padStart(2, '0'); return 'ecowave-' + Math.abs(src.lat).toFixed(3) + (src.lat < 0 ? 'S' : 'N') + '_' + Math.abs(src.lng).toFixed(3) + (src.lng < 0 ? 'W' : 'E') + '-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + '.' + ext; };
  const ukuranTeks = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB';

  async function ekspor(jenis, src, tombol) {
    if (!src) { toast('Belum ada analisis untuk diekspor. Klik titik di peta atau pilih lokasi lebih dulu.', 'galat'); return null; }
    const lama = tombol ? tombol.innerHTML : ''; if (tombol) { tombol.disabled = true; tombol.setAttribute('aria-busy', 'true'); }
    const t = toast('Menyiapkan ' + jenis.toUpperCase() + '…', 'info');
    try {
      await new Promise(r => setTimeout(r, 30));
      const lap = await bangunLaporan(src); let blob, nama;
      if (jenis === 'png') { blob = await keBlob(renderPng(lap), 'image/png'); nama = namaBerkas(src, 'png'); }
      else {
        const hal = renderHalaman(lap), js = [];
        for (const cv of hal) { const b = await keBlob(cv, 'image/jpeg', .88); js.push({ w: cv.width, h: cv.height, bytes: new Uint8Array(await b.arrayBuffer()) }); }
        blob = buatPdf(js, lap.judul); nama = namaBerkas(src, 'pdf');
      }
      unduh(blob, nama); t.remove(); toast('Berhasil: ' + nama + ' (' + ukuranTeks(blob.size) + ') diunduh.', 'ok');
      return { blob, nama };
    } catch (e) {
      console.error('[ECO-WAVE ekspor]', e); t.remove(); toast('Gagal mengekspor ' + jenis.toUpperCase() + ': ' + (e && e.message || e), 'galat'); return null;
    } finally { if (tombol) { tombol.disabled = false; tombol.removeAttribute('aria-busy'); tombol.innerHTML = lama; } }
  }
  function pasang(o) {
    if (o.png) o.png.addEventListener('click', e => { e.preventDefault(); ekspor('png', o.ambil(), o.png); });
    if (o.pdf) o.pdf.addEventListener('click', e => { e.preventDefault(); ekspor('pdf', o.ambil(), o.pdf); });
  }
  window.ECOWAVE_EKSPOR = { pasang, ekspor, bangunLaporan, toast, buatPdf, interpretasi };
})();
