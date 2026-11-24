/* ECO-WAVE - parser impor titik acuan gelombang (CMEMS, ERA5, dan sumber lain).
   Murni fungsi (tanpa DOM) supaya bisa diuji di Node. Dipakai admin.js.
   Masukan : teks CSV / JSON / GeoJSON (hasil scripts/nc_ke_titik.py, process_era5.py, atau ekspor sendiri).
   Keluaran: { format, baris:[{nama,sumber,lat,lng,p,hs,te,med,p90,maks,cv,persen}], peringatan:[], galat:[] }
   Prinsip: tidak ada angka yang dikarang. Statistik yang tidak bisa dihitung dari data dibiarkan null. */
(function (root) {
  'use strict';

  // nama kolom yang dikenali (huruf kecil, tanpa spasi/garis bawah)
  const ALIAS = {
    nama: ['nama', 'name', 'titik', 'point', 'id', 'kode', 'label'],
    lat: ['lat', 'latitude', 'lintang', 'y'],
    lng: ['lng', 'lon', 'long', 'longitude', 'bujur', 'x'],
    waktu: ['time', 'validtime', 'waktu', 'tanggal', 'date', 'datetime'],
    hs: ['hs', 'swh', 'vhm0', 'hm0', 'waveheight', 'tinggigelombang'],
    te: ['te', 'vtm10', 'tm10', 'energyperiod', 'periodeenergi'],
    tp: ['tp', 'vtpk', 'pp1d', 'peakperiod', 'periodepuncak'],
    p: ['p', 'power', 'powerkw', 'wavepowerkwm', 'wavepower', 'dayakwm', 'daya', 'kw', 'pannualkwm', 'pannual'],
    med: ['med', 'median'],
    p90: ['p90'],
    maks: ['maks', 'max', 'maksimum', 'maximum'],
    cv: ['cv'],
    persen: ['persen', 'percent', 'dayarelatif']
  };
  const BATAS = { lat: [-8.5, -5.5], lng: [104, 108], hs: [0, 15], te: [0, 25], p: [0, 500] };
  const SUMBER = ['CMEMS', 'ERA5', 'BMKG', 'Windy', 'Pengukuran', 'Lainnya'];
  const norm = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');

  // ---- CSV sederhana: pemisah , ; atau tab, tanda kutip ganda, BOM
  function bacaCSV(teks) {
    teks = String(teks).replace(/^\uFEFF/, '');
    const baris1 = teks.split(/\r?\n/).find(l => l.trim() !== '') || '';
    const sep = [',', ';', '\t'].map(c => [c, baris1.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
    const out = []; let f = '', r = [], q = false;
    for (let i = 0; i < teks.length; i++) {
      const c = teks[i];
      if (q) { if (c === '"') { if (teks[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === sep) { r.push(f); f = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; r.push(f); f = ''; if (r.some(x => x.trim() !== '')) out.push(r); r = []; }
      else f += c;
    }
    r.push(f); if (r.some(x => x.trim() !== '')) out.push(r);
    if (out.length < 2) return [];
    const kepala = out[0].map(h => h.trim());
    return out.slice(1).map(v => { const o = {}; kepala.forEach((h, i) => { o[h] = (v[i] == null ? '' : v[i]).trim(); }); return o; });
  }

  // ---- petakan kolom baku -> nama kolom asli
  function petaKolom(kunci) {
    const hasil = {};
    Object.keys(ALIAS).forEach(k => {
      const cocok = kunci.find(x => ALIAS[k].includes(norm(x)));
      if (cocok !== undefined) hasil[k] = cocok;
    });
    return hasil;
  }
  const angka = v => { if (v === null || v === undefined || v === '') return null; const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };

  // ---- statistik deret waktu
  function persentil(urut, q) { // urut sudah terurut naik; interpolasi linear
    if (!urut.length) return null;
    const i = (urut.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i);
    return urut[lo] + (urut[hi] - urut[lo]) * (i - lo);
  }
  const r2 = x => x == null ? null : Math.round(x * 100) / 100;

  function ringkasDeret(rows, K, faktorTe) {
    // rows: objek mentah; K: peta kolom. Kelompokkan per (lat,lng) dibulatkan 3 desimal.
    const grup = new Map(), peringatan = [];
    let buang = 0;
    rows.forEach(r => {
      const lat = angka(r[K.lat]), lng = angka(r[K.lng]); if (lat == null || lng == null) { buang++; return; }
      const hs = angka(r[K.hs]); let te = K.te ? angka(r[K.te]) : null;
      if (te == null && K.tp) { const tp = angka(r[K.tp]); if (tp != null) te = tp * faktorTe; }
      let p = K.p ? angka(r[K.p]) : null;
      if (p == null && hs != null && te != null && hs >= 0 && te > 0) p = 0.49 * hs * hs * te;
      if (p == null || !isFinite(p) || p < 0 || hs == null || hs < 0 || te == null || te <= 0) { buang++; return; }
      const key = lat.toFixed(3) + '|' + lng.toFixed(3);
      if (!grup.has(key)) grup.set(key, { lat, lng, nama: K.nama ? String(r[K.nama] || '').trim() : '', p: [], hs: [], te: [] });
      const g = grup.get(key); g.p.push(p); g.hs.push(hs); g.te.push(te);
    });
    if (buang) peringatan.push(buang + ' baris deret waktu dilewati (kosong/tidak valid, mis. Hs atau periode hilang).');
    const rata = a => a.reduce((x, y) => x + y, 0) / a.length;
    const baris = [...grup.values()].map(g => {
      const urut = g.p.slice().sort((a, b) => a - b), m = rata(g.p);
      const sd = Math.sqrt(rata(g.p.map(x => (x - m) * (x - m))));
      return {
        nama: g.nama, lat: g.lat, lng: g.lng, n: g.p.length,
        p: r2(m), med: r2(persentil(urut, .5)), p90: r2(persentil(urut, .1)), // P90 = nilai yang dilampaui 90% waktu (persentil ke-10)
        maks: r2(urut[urut.length - 1]), cv: m > 0 ? r2(sd / m) : null, hs: r2(rata(g.hs)), te: r2(rata(g.te)), persen: null
      };
    });
    return { baris, peringatan };
  }

  // ---- titik masukan dari berbagai bentuk -> { baris mentah (objek), format }
  function ekstrak(teks, namaBerkas) {
    const ext = String(namaBerkas || '').toLowerCase().split('.').pop();
    const t = String(teks).replace(/^\uFEFF/, '').trim();
    if (!t) throw new Error('Berkas kosong.');
    if (t[0] === '{' || t[0] === '[') {
      let j; try { j = JSON.parse(t); } catch (e) { throw new Error('JSON tidak valid: ' + e.message); }
      if (j && j.type === 'FeatureCollection' && Array.isArray(j.features)) {
        const rows = j.features.map(f => {
          const g = f && f.geometry; if (!g || g.type !== 'Point' || !Array.isArray(g.coordinates)) return null;
          return Object.assign({}, f.properties || {}, { lng: g.coordinates[0], lat: g.coordinates[1] });
        }).filter(Boolean);
        if (!rows.length) throw new Error('GeoJSON tidak berisi fitur Point. Impor titik hanya menerima Point; untuk poligon/garis pakai "Impor layer GeoJSON".');
        return { format: 'GeoJSON (Point)', rows };
      }
      const arr = Array.isArray(j) ? j : (j && (j.titik || j.data || j.rows || j.points));
      if (!Array.isArray(arr) || !arr.length) throw new Error('JSON harus berupa daftar objek, atau {"titik":[...]}, atau GeoJSON FeatureCollection.');
      if (arr.some(x => x === null || typeof x !== 'object' || Array.isArray(x))) throw new Error('Setiap elemen JSON harus berupa objek {lat, lng, ...}.');
      return { format: 'JSON', rows: arr };
    }
    if (ext === 'nc' || ext === 'grib' || ext === 'grb' || ext === 'tif') throw new Error('Berkas ' + ext.toUpperCase() + ' tidak bisa dibaca di browser. Ubah dulu ke CSV dengan scripts/nc_ke_titik.py.');
    const rows = bacaCSV(t);
    if (!rows.length) throw new Error('CSV harus punya baris judul kolom dan minimal satu baris data.');
    return { format: 'CSV', rows };
  }

  /* parse(teks, namaBerkas, opsi)
     opsi: { sumber:'ERA5', faktorTe:0.9, awalan:'P', mulai:4 }   (awalan+mulai = penamaan otomatis untuk baris tanpa nama) */
  function parse(teks, namaBerkas, opsi) {
    opsi = Object.assign({ sumber: 'Lainnya', faktorTe: 0.9, awalan: 'P', mulai: 0 }, opsi || {});
    if (!SUMBER.includes(opsi.sumber)) opsi.sumber = 'Lainnya';
    const { format, rows } = ekstrak(teks, namaBerkas);
    if (rows.length > 2000000) throw new Error('Terlalu banyak baris.');
    const K = petaKolom(Object.keys(rows[0] || {}));
    const galat = [], peringatan = [];
    if (!K.lat || !K.lng) throw new Error('Kolom koordinat tidak ditemukan. Perlu kolom lat/latitude dan lon/lng/longitude.');
    const adaDeret = !!K.waktu && rows.length > 1;
    const adaP = !!K.p, adaHsTe = !!K.hs && (!!K.te || !!K.tp);
    if (!adaP && !adaHsTe) throw new Error('Perlu kolom daya (p / power / kw) atau pasangan Hs (hs / swh / VHM0) + periode (te / VTM10 / tp).');
    if (!K.hs || !(K.te || K.tp)) { if (adaP) peringatan.push('Kolom Hs dan/atau periode tidak ada. Hs dan Te wajib untuk interpolasi, jadi baris tanpa keduanya akan ditolak.'); }
    if (K.tp && !K.te) peringatan.push('Hanya ada periode puncak (Tp). Te dihitung sebagai ' + opsi.faktorTe + ' × Tp (asumsi proyek, bukan pengukuran). Kolom CMEMS VTM10 sudah periode energi dan tidak perlu faktor ini.');

    let calon;
    if (adaDeret) {
      const rs = ringkasDeret(rows, K, opsi.faktorTe);
      calon = rs.baris; peringatan.push(...rs.peringatan);
      peringatan.push('Terdeteksi deret waktu: tiap lokasi dirata-ratakan jadi satu titik (' + rs.baris.map(b => b.n).join(', ') + ' langkah waktu).');
    } else {
      calon = rows.map((r, i) => {
        const hs = angka(r[K.hs]); let te = K.te ? angka(r[K.te]) : null;
        if (te == null && K.tp) { const tp = angka(r[K.tp]); if (tp != null) te = tp * opsi.faktorTe; }
        let p = K.p ? angka(r[K.p]) : null, turunan = false;
        if (p == null && hs != null && te != null) { p = 0.49 * hs * hs * te; turunan = true; }
        return {
          nama: K.nama ? String(r[K.nama] == null ? '' : r[K.nama]).trim() : '', lat: angka(r[K.lat]), lng: angka(r[K.lng]), p, hs, te,
          med: K.med ? angka(r[K.med]) : null, p90: K.p90 ? angka(r[K.p90]) : null, maks: K.maks ? angka(r[K.maks]) : null,
          cv: K.cv ? angka(r[K.cv]) : null, persen: K.persen ? angka(r[K.persen]) : null, turunan
        };
      });
      if (calon.some(c => c.turunan)) peringatan.push('Daya dihitung dari Hs dan Te dengan P = 0,49 × Hs² × Te untuk baris yang tidak memuat kolom daya.');
      if (calon.length > 1 && !calon.some(c => c.med != null)) peringatan.push('Median, P90, maks, dan CV tidak ada di data ini. Disimpan kosong (tidak dikarang). Peta dan Kalkulator tetap berfungsi; hanya popup yang menampilkan "–".');
    }

    // beri nama otomatis & validasi
    let urut = opsi.mulai, dipakai = new Set();
    const baris = calon.map((c, i) => {
      const nama = c.nama || (opsi.awalan + (urut++) + ' ' + opsi.sumber + ' (' + (c.lat == null ? '?' : c.lat.toFixed(2)) + ', ' + (c.lng == null ? '?' : c.lng.toFixed(2)) + ')');
      const b = { nama, sumber: opsi.sumber, lat: c.lat, lng: c.lng, p: r2(c.p), hs: r2(c.hs), te: r2(c.te), med: r2(c.med), p90: r2(c.p90), maks: r2(c.maks), cv: r2(c.cv), persen: r2(c.persen), n: c.n };
      const m = [];
      if (b.lat == null || b.lat < BATAS.lat[0] || b.lat > BATAS.lat[1]) m.push('lintang di luar ' + BATAS.lat.join('..'));
      if (b.lng == null || b.lng < BATAS.lng[0] || b.lng > BATAS.lng[1]) m.push('bujur di luar ' + BATAS.lng.join('..'));
      if (b.p == null || b.p < BATAS.p[0] || b.p > BATAS.p[1]) m.push('daya kosong/di luar ' + BATAS.p.join('..') + ' kW/m');
      if (b.hs == null || b.hs < BATAS.hs[0] || b.hs > BATAS.hs[1]) m.push('Hs kosong/di luar ' + BATAS.hs.join('..') + ' m');
      if (b.te == null || b.te <= BATAS.te[0] || b.te > BATAS.te[1]) m.push('Te kosong/di luar ' + BATAS.te.join('..') + ' s');
      if (!/^[\p{L}\p{N} \/\-.,()]{2,80}$/u.test(b.nama)) m.push('nama memuat karakter yang tidak diizinkan');
      if (dipakai.has(b.nama)) m.push('nama ganda dalam berkas');
      dipakai.add(b.nama);
      b.masalah = m;
      return b;
    });
    baris.forEach((b, i) => { if (b.masalah.length) galat.push('#' + (i + 1) + ' ' + b.nama + ': ' + b.masalah.join(', ')); });
    if (baris.length > 200) galat.push('Maksimal 200 titik per impor (ada ' + baris.length + '). Pilih area/titik yang dipakai saja.');
    return { format: format + (adaDeret ? ' • deret waktu' : ' • ringkas'), baris, peringatan, galat, kolom: K };
  }

  const API = { parse, bacaCSV, ringkasDeret, persentil, SUMBER, BATAS };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.ImporData = API;
})(typeof window !== 'undefined' ? window : globalThis);
