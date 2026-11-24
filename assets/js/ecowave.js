/* ECO-WAVE (Ecosystem-aware Wave Energy) - mesin hitung spasial + MCDA.
   Murni perhitungan (tanpa DOM) agar bisa dipakai halaman Peta, Kalkulator, dan diuji di Node.
   Memakai data PLTGL nyata di assets/data/pltgl/*.geojson. Semua skor/buffer/ambang di PARAM adalah
   ASUMSI AWAL yang bisa diubah di halaman Kalkulator - bukan fakta; wajib divalidasi (literatur/AHP/pakar). */
(function (root) {
  'use strict';

  // ---------------------------------------------------------------- parameter awal (dapat diubah)
  const PARAM_DEFAULT = {
    // buffer eksklusi (km): titik yang lebih dekat dari ini ke ekosistem/alur DIKELUARKAN dari ranking
    // (nilai mangrove/karang/lamun sama dengan aturan versi sebelumnya: 1 / 1 / 0,5 km)
    buf: { mangrove: 1, karang: 1, reef: 1, lamun: 0.5, konservasi: 0, pelayaran: 0.5 },
    // ambang jarak ekosistem (km) -> skor 1..5 (tabel "Skor Sensitivitas" versi sebelumnya: 0,5 / 1 / 2 / 5)
    ekoBatas: [0.5, 1, 2, 5],
    // ambang jarak jaringan listrik (km) -> skor 5..1
    jarBatas: [5, 10, 20, 40],
    // skor desa (km) -> 5..1 (aturan versi sebelumnya: <2 / <5 / <10 / <20)
    desaBatas: [2, 5, 10, 20],
    jarMode: 'grid',                // 'grid' = gardu/jalur listrik | 'desa' | 'rata'
    // ambang daya gelombang (kW/m) -> skor 5..2 (aturan versi sebelumnya: 20 / 15 / 10 / 5)
    dayaBatas: [20, 15, 10, 5],
    // Celah P1: dengan ambang absolut di atas, SEMUA titik CMEMS (20,48-25,57 kW/m) mendapat skor 5, sehingga kriteria
    // berbobot 40% tidak membedakan lokasi. 'relatif' = normalisasi min-maks antar titik acuan -> skor kontinu 1..5.
    // 'absolut' = ambang lama di atas. dayaRef = [min,maks] kW/m titik acuan (CMEMS P0-P3; ganti dengan ERA5 bila sudah ada).
    // dayaSkala dikalikan ke dayaRef (mis. faktor musim) agar skor musiman dibandingkan dengan rentang musim yang sama.
    dayaMode: 'relatif', dayaRef: [20.48, 25.57], dayaSkala: 1,
    // skor kedalaman per kelas batimetri (class_id data: 1 terdalam ... 6 terdangkal)
    skorKedalaman: { 1: 1, 2: 2, 3: 3, 4: 5, 5: 4, 6: 2 },
    skorKedalamanTakDiketahui: 3,
    zonaLatMaks: -6.60,             // zona grid hanya dinilai di selatan lintang ini (Selat Sunda/Teluk Banten dilewati: daya CMEMS di sana hanya ekstrapolasi)
    wajibPerairan5km: false,        // true: titik di luar perairan pesisir 5 km dianggap gugur
    // perangkat (sama dengan asumsi versi sebelumnya)
    lebar: 10, efisiensi: 0.30, cf: 0.15, unit: 1,
    kwhBulan: { 450: 113.5, 900: 164.6, 1300: 229.9 }   // Unigoro (skripsi): 450 VA 113,5; 900 VA 164,6; 1200 VA 229,9 (dipakai untuk kelas 1300 VA). Pembanding nasional 900 VA RTM: 104,61 (CNBC Indonesia 2019, data Ditjen Gatrik)
  };
  // ---------------------------------------------------------------- SATU SUMBER KEBENARAN MODEL
  // Empat faktor MCDA, bobot awal, nama, dan kelas kelayakan didefinisikan HANYA di sini. Peta, Kalkulator, Lokasi Terbaik, Beranda,
  // laporan ekspor, dan halaman informasi membaca dari objek ini (tests/test_konsistensi.js memeriksa kesamaannya dengan
  // assets/data/model.json dan database.sql). Bobot 40/30/15/15 adalah keputusan metodologis tim, bukan hasil AHP: lihat
  // "Studi Literatur dan Referensi Akademis" di halaman Tentang Data.
  const FAKTOR = [
    { key: 'daya', kode: 'D', nama: 'Daya gelombang',      singkat: 'Daya',      bobot: 0.40, ikon: 'bi-water',
      arti: 'Daya gelombang rata-rata di titik (kW/m), diskalakan min–maks titik acuan menjadi skor 1–5. Makin besar makin baik.' },
    { key: 'eko',  kode: 'E', nama: 'Ekosistem',           singkat: 'Ekosistem', bobot: 0.30, ikon: 'bi-tree',
      arti: 'Jarak ke tepi mangrove, karang, reef, lamun, dan kawasan konservasi terdekat. Makin jauh dari ekosistem sensitif makin baik (skor dibalik).' },
    { key: 'ked',  kode: 'K', nama: 'Kedalaman',           singkat: 'Kedalaman', bobot: 0.15, ikon: 'bi-rulers',
      arti: 'Kelas kedalaman batimetri ETOPO1 di titik; kelas −50 s/d −20 m paling sesuai untuk perangkat dekat pantai.' },
    { key: 'jar',  kode: 'J', nama: 'Jarak infrastruktur', singkat: 'Jarak',     bobot: 0.15, ikon: 'bi-plug',
      arti: 'Jarak ke gardu atau jalur listrik terdekat (mode lain: desa). Makin dekat makin baik.' }
  ];
  const KEY = FAKTOR.map(f => f.key);
  const BOBOT_DEFAULT = {}; FAKTOR.forEach(f => { BOBOT_DEFAULT[f.key] = f.bobot; });
  const NAMA_FAKTOR = {}; FAKTOR.forEach(f => { NAMA_FAKTOR[f.key] = f.nama; });
  const KELAS = [[4.2, 'Sangat Layak', '#16a34a'], [3.4, 'Layak', '#86efac'], [2.6, 'Cukup Layak', '#facc15'], [1.8, 'Kurang Layak', '#fb923c']];
  // Legenda kelas (rentang skor) dibangun dari KELAS agar legenda Peta, Kalkulator, dan laporan selalu sama dengan perhitungan.
  const KELAS_LEGENDA = (function () {
    const hi = [5].concat(KELAS.map(k => k[0])), r = [];
    KELAS.forEach((k, i) => r.push({ nama: k[1], warna: k[2], dari: k[0], sampai: hi[i], teks: i === 0 ? '\u2265 ' + k[0].toFixed(1) : k[0].toFixed(1) + ' \u2013 < ' + hi[i].toFixed(1) }));
    r.push({ nama: 'Tidak Layak', warna: '#ef4444', dari: 0, sampai: KELAS[KELAS.length - 1][0], teks: '< ' + KELAS[KELAS.length - 1][0].toFixed(1) });
    return r.reverse();
  })();
  const LAYER_META = {
    mangrove:        { label: 'Mangrove',            file: 'mangrove.geojson',        tipe: 'poly', warna: '#16a34a' },
    karang:          { label: 'Terumbu karang',      file: 'karang.geojson',          tipe: 'poly', warna: '#ec4899' },
    reef:            { label: 'Reef extent',         file: 'reef.geojson',            tipe: 'poly', warna: '#f472b6' },
    lamun:           { label: 'Lamun',               file: 'lamun.geojson',           tipe: 'poly', warna: '#0d9488' },
    konservasi:      { label: 'Kawasan konservasi',  file: 'konservasi.geojson',      tipe: 'poly', warna: '#6366f1' },
    batimetri:       { label: 'Batimetri',           file: 'batimetri.geojson',       tipe: 'poly', warna: '#0ea5e9' },
    perairan5km:     { label: 'Perairan pesisir 5 km', file: 'perairan5km.geojson',   tipe: 'poly', warna: '#38bdf8' },
    gardu:           { label: 'Gardu listrik',       file: 'gardu.geojson',           tipe: 'pt',   warna: '#f59e0b' },
    pelabuhan:       { label: 'Pelabuhan / dermaga', file: 'pelabuhan.geojson',       tipe: 'pt',   warna: '#a855f7' },
    jalur_listrik:   { label: 'Jalur listrik',       file: 'jalur_listrik.geojson',   tipe: 'line', warna: '#facc15' },
    jalur_pelayaran: { label: 'Jalur pelayaran',     file: 'jalur_pelayaran.geojson', tipe: 'line', warna: '#ef4444' }
  };

  // ---------------------------------------------------------------- penyimpanan & pemuatan data
  const STORE = {};          // nama -> { feats:[{b,rings,props}], pts:[{x,y,props}] }
  const RAWGJ = {};          // nama -> geojson mentah (untuk digambar Leaflet)
  const MUAT = {};           // nama -> Promise

  function indeks(nama, gj) {
    const tipe = LAYER_META[nama].tipe, feats = [], pts = [];
    for (const f of gj.features) {
      const g = f.geometry; if (!g) continue;
      const pr = f.properties || {};
      if (g.type === 'Point') { pts.push({ x: g.coordinates[0], y: g.coordinates[1], props: pr }); continue; }
      const rl = g.type === 'Polygon' ? g.coordinates : g.type === 'LineString' ? [g.coordinates] :
                 g.type === 'MultiPolygon' ? [].concat(...g.coordinates) : g.type === 'MultiLineString' ? g.coordinates : [];
      const rings = []; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const r of rl) {
        const a = new Float64Array(r.length * 2);
        for (let i = 0; i < r.length; i++) {
          const x = r[i][0], y = r[i][1]; a[2 * i] = x; a[2 * i + 1] = y;
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        rings.push(a);
      }
      if (rings.length) feats.push({ b: [x0, y0, x1, y1], rings, props: pr, poly: g.type === 'Polygon' || g.type === 'MultiPolygon' });
    }
    STORE[nama] = { tipe, feats, pts };
  }

  // muat(['karang','lamun'], 'assets/data/pltgl/', fetchFn?) -> Promise
  function muat(daftar, base, fetchFn) {
    base = base || 'assets/data/pltgl/';
    const f = fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    return Promise.all(daftar.map(n => {
      if (!LAYER_META[n]) return Promise.reject(new Error('Layer tidak dikenal: ' + n));
      if (STORE[n]) return Promise.resolve(STORE[n]);
      if (MUAT[n]) return MUAT[n];
      MUAT[n] = f(base + LAYER_META[n].file).then(r => { if (!r.ok) throw new Error('Gagal memuat ' + n + ' (' + r.status + ')'); return r.json(); })
        .then(gj => { RAWGJ[n] = gj; indeks(n, gj); return STORE[n]; })
        .catch(e => { delete MUAT[n]; throw e; });
      return MUAT[n];
    }));
  }
  // ---- raster batimetri (ETOPO1) : kedalaman di titik mana pun (nilai sel, konsisten dengan poligon kelas batimetri)
  let RASTER = null;
  function muatRaster(base, fetchFn) {
    base = base || 'assets/data/pltgl/';
    const f = fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    if (RASTER) return Promise.resolve(RASTER);
    return f(base + 'batimetri_grid.json').then(r => { if (!r.ok) throw new Error('Gagal memuat raster batimetri'); return r.json(); })
      .then(j => { RASTER = j; return j; });
  }
  function pasangRaster(j) { RASTER = j; }
  function kedalamanDi(lat, lng) {           // meter (negatif = laut), sel terdekat (sama dengan cara poligon kelas dibuat); null di luar raster
    const R = RASTER; if (!R) return null;
    const i = Math.floor((lng - R.x0) / R.dx), j = Math.floor((R.y0 - lat) / R.dy);
    if (i < 0 || j < 0 || i >= R.nx || j >= R.ny) return null;
    return R.z[j * R.nx + i];
  }
  // true bila sel raster ETOPO1 di titik itu berada di atas permukaan laut (daratan). Resolusi ~1,85 km: di garis pantai bisa meleset.
  function daratan(lat, lng) { const z = kedalamanDi(lat, lng); return z != null && z > 0; }
  const RENTANG = { 1: '< -200 m', 2: '-200 s/d -100 m', 3: '-100 s/d -50 m', 4: '-50 s/d -20 m', 5: '-20 s/d -10 m', 6: '-10 s/d 0 m' };
  const kelasKedalaman = z => z > 0 ? 0 : z < -200 ? 1 : z < -100 ? 2 : z < -50 ? 3 : z < -20 ? 4 : z < -10 ? 5 : 6;

  function pasang(nama, gj) { RAWGJ[nama] = gj; indeks(nama, gj); }   // untuk uji / data lokal

  // ---------------------------------------------------------------- geometri (km, proyeksi lokal)
  const KY = 110.574;
  const kxAt = lat => 111.320 * Math.cos(lat * Math.PI / 180);

  function jarakBbox(px, py, b, kx) {
    const dx = px < b[0] ? (b[0] - px) * kx : px > b[2] ? (px - b[2]) * kx : 0;
    const dy = py < b[1] ? (b[1] - py) * KY : py > b[3] ? (py - b[3]) * KY : 0;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function jarakRing(px, py, a, kx) {          // jarak minimum titik ke ruas-ruas sebuah ring/garis (km)
    let best = Infinity;
    for (let i = 0; i + 3 < a.length; i += 2) {
      const ax = (a[i] - px) * kx, ay = (a[i + 1] - py) * KY, bx = (a[i + 2] - px) * kx, by = (a[i + 3] - py) * KY;
      const dx = bx - ax, dy = by - ay, n = dx * dx + dy * dy; let t = 0;
      if (n > 0) { t = -(ax * dx + ay * dy) / n; t = t < 0 ? 0 : t > 1 ? 1 : t; }
      const x = ax + t * dx, y = ay + t * dy, d = x * x + y * y;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }
  function dalamRing(px, py, a) {               // ray casting
    let in_ = false;
    for (let i = 0, j = a.length - 2; i < a.length; j = i, i += 2) {
      const xi = a[i], yi = a[i + 1], xj = a[j], yj = a[j + 1];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) in_ = !in_;
    }
    return in_;
  }
  function dalamFitur(px, py, f) {              // ring[0] = luar, sisanya lubang
    if (px < f.b[0] || px > f.b[2] || py < f.b[1] || py > f.b[3]) return false;
    if (!dalamRing(px, py, f.rings[0])) return false;
    for (let k = 1; k < f.rings.length; k++) if (dalamRing(px, py, f.rings[k])) return false;
    return true;
  }

  // terdekat(nama, lat, lng) -> { d (km, 0 bila di dalam), di_dalam, props } | null bila layer kosong / belum dimuat
  function terdekat(nama, lat, lng, batas) {
    const S = STORE[nama]; if (!S) return null;
    const kx = kxAt(lat); let best = batas == null ? Infinity : batas, props = null, ada = false;
    if (S.pts.length) {
      for (const p of S.pts) {
        const dx = (p.x - lng) * kx, dy = (p.y - lat) * KY, d = Math.sqrt(dx * dx + dy * dy);
        if (d < best || !ada) { if (d < best || best === Infinity) { best = d; props = p.props; ada = true; } }
      }
    }
    for (const f of S.feats) {
      if (jarakBbox(lng, lat, f.b, kx) >= best) continue;
      if (f.poly && dalamFitur(lng, lat, f)) return { d: 0, di_dalam: true, props: f.props };
      let d = Infinity;
      for (const r of f.rings) { const v = jarakRing(lng, lat, r, kx); if (v < d) d = v; if (d === 0) break; }
      if (d < best) { best = d; props = f.props; ada = true; }
    }
    if (!ada) return { d: Infinity, di_dalam: false, props: null };
    return { d: best, di_dalam: false, props };
  }
  function titikDalam(nama, lat, lng) {          // fitur poligon yang memuat titik (atau null)
    const S = STORE[nama]; if (!S) return undefined;
    for (const f of S.feats) if (f.poly && dalamFitur(lng, lat, f)) return f.props;
    return null;
  }

  // ---------------------------------------------------------------- skor
  function skorDaya(kw, P) {
    P = P || PARAM_DEFAULT;
    if (P.dayaMode === 'relatif') {
      const k = P.dayaSkala > 0 ? P.dayaSkala : 1, lo = P.dayaRef[0] * k, hi = P.dayaRef[1] * k;
      if (!(hi > lo)) return 3;
      return 1 + 4 * Math.min(1, Math.max(0, (kw - lo) / (hi - lo)));
    }
    const t = P.dayaBatas; return kw >= t[0] ? 5 : kw >= t[1] ? 4 : kw >= t[2] ? 3 : kw >= t[3] ? 2 : 1;
  }
  function skorEko(d, P) { const t = (P || PARAM_DEFAULT).ekoBatas; return d <= t[0] ? 1 : d <= t[1] ? 2 : d <= t[2] ? 3 : d <= t[3] ? 4 : 5; }
  function skorJaringan(d, P) { const t = (P || PARAM_DEFAULT).jarBatas; return d <= t[0] ? 5 : d <= t[1] ? 4 : d <= t[2] ? 3 : d <= t[3] ? 2 : 1; }
  function skorDesa(d, P) { const t = (P || PARAM_DEFAULT).desaBatas; return d < t[0] ? 5 : d < t[1] ? 4 : d < t[2] ? 3 : d < t[3] ? 2 : 1; }
  const kelasDari = s => { if (s <= 0) return { n: 'Gugur', c: '#9ca3af' }; for (const [k, n, c] of KELAS) if (s >= k) return { n, c }; return { n: 'Tidak Layak', c: '#ef4444' }; };
  const label5 = d => d > 5 ? 'Sangat Rendah' : d > 2 ? 'Rendah' : d > 1 ? 'Sedang' : d > 0.5 ? 'Tinggi' : 'Sangat Tinggi';

  function hav(lat1, lng1, lat2, lng2) {
    const r = Math.PI / 180, x = Math.sin((lat2 - lat1) * r / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin((lng2 - lng1) * r / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(x));
  }

  // ---------------------------------------------------------------- cakupan data (celah K5)
  // Allen Coral Atlas (karang/lamun/reef) hanya mencakup sebagian pesisir. Di luar kotak cakupannya "tidak ada karang/lamun"
  // berarti TIDAK ADA DATA, bukan hasil. cakupan(nama) = [x0,y0,x1,y1] gabungan semua fitur layer, atau null bila belum dimuat.
  function cakupan(nama) {
    const S = STORE[nama]; if (!S || !S.feats.length) return null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    S.feats.forEach(f => { x0 = Math.min(x0, f.b[0]); y0 = Math.min(y0, f.b[1]); x1 = Math.max(x1, f.b[2]); y1 = Math.max(y1, f.b[3]); });
    return [x0, y0, x1, y1];
  }
  const LAYER_HABITAT = ['karang', 'lamun', 'reef'];
  // gabungan cakupan habitat; luarCakupan(lat,lng) -> true bila titik di luar bujur/lintang yang pernah dipetakan
  function cakupanHabitat() {
    const bs = LAYER_HABITAT.map(cakupan).filter(Boolean); if (!bs.length) return null;
    return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))];
  }
  const AREA_STUDI_DEFAULT = [104.5, -8, 107, -6], KUNCI_AREA_STUDI = 'ecowave_area_studi';
  function batasAreaStudiKustom() {
    try {
      const raw = root.localStorage.getItem(KUNCI_AREA_STUDI);
      if (!raw) return null;
      const b = JSON.parse(raw);
      return Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) &&
        b[0] >= AREA_STUDI_DEFAULT[0] && b[2] <= AREA_STUDI_DEFAULT[2] && b[0] < b[2] &&
        b[1] >= AREA_STUDI_DEFAULT[1] && b[3] <= AREA_STUDI_DEFAULT[3] && b[1] < b[3] ? b : null;
    } catch (e) { return null; }
  }
  function batasAreaStudi() { return batasAreaStudiKustom() || AREA_STUDI_DEFAULT.slice(); }
  function simpanBatasAreaStudi(b) {
    if (b == null) { root.localStorage.removeItem(KUNCI_AREA_STUDI); return; }
    if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite) ||
        b[0] < AREA_STUDI_DEFAULT[0] || b[2] > AREA_STUDI_DEFAULT[2] || b[0] >= b[2] ||
        b[1] < AREA_STUDI_DEFAULT[1] || b[3] > AREA_STUDI_DEFAULT[3] || b[1] >= b[3]) throw new Error('Batas area studi tidak valid.');
    root.localStorage.setItem(KUNCI_AREA_STUDI, JSON.stringify(b));
  }
  function diDalamKotak(lat, lng, b) { return lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3]; }
  function dalamAreaStudi(lat, lng) { return diDalamKotak(lat, lng, batasAreaStudi()); }

  const KUNCI_BATAS_ANALISIS = 'ecowave_batas_analisis_habitat';
  function batasAnalisisHabitatKustom() {
    try {
      const raw = root.localStorage.getItem(KUNCI_BATAS_ANALISIS);
      if (!raw) return null;
      const b = JSON.parse(raw);
      return Array.isArray(b) && b.length === 4 && b.every(Number.isFinite) &&
        b[0] >= 104.5 && b[2] <= 107 && b[0] < b[2] &&
        b[1] >= -8 && b[3] <= -6 && b[1] < b[3] ? b : null;
    } catch (e) { return null; }
  }
  function simpanBatasAnalisisHabitat(b) {
    if (b == null) { root.localStorage.removeItem(KUNCI_BATAS_ANALISIS); return; }
    if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite) ||
        b[0] < 104.5 || b[2] > 107 || b[0] >= b[2] ||
        b[1] < -8 || b[3] > -6 || b[1] >= b[3]) throw new Error('Batas analisis tidak valid.');
    root.localStorage.setItem(KUNCI_BATAS_ANALISIS, JSON.stringify(b));
  }
  function dalamAreaAnalisisHabitat(lat, lng) {
    if (!dalamAreaStudi(lat, lng)) return false;
    const b = batasAnalisisHabitatKustom();
    return !b || diDalamKotak(lat, lng, b);
  }
  function luarCakupanHabitat(lat, lng, margin) {
    const b = cakupanHabitat(); if (!b) return null; const m = margin == null ? 0.02 : margin;
    return lng < b[0] - m || lng > b[2] + m || lat < b[1] - m || lat > b[3] + m;
  }

  // ---------------------------------------------------------------- analisis spasial satu titik
  // opsi: { P: PARAM, desa: [{nama,lat,lng}] }
  function analisisSpasial(lat, lng, opsi) {
    opsi = opsi || {}; const P = opsi.P || PARAM_DEFAULT;
    const jarak = {}, info = {};
    ['mangrove', 'karang', 'reef', 'lamun', 'konservasi', 'gardu', 'jalur_listrik', 'jalur_pelayaran', 'pelabuhan'].forEach(n => {
      const r = terdekat(n, lat, lng); if (r) { jarak[n] = r.d; info[n] = r; }
    });
    // eksklusi
    const ex = [];
    const aturan = [['konservasi', 'Di dalam / dekat kawasan konservasi'], ['mangrove', 'Terlalu dekat mangrove'], ['karang', 'Terlalu dekat terumbu karang'],
                    ['reef', 'Terlalu dekat reef extent'], ['lamun', 'Terlalu dekat lamun'], ['jalur_pelayaran', 'Terlalu dekat jalur pelayaran (feri)']];
    for (const [n, teks] of aturan) {
      if (jarak[n] === undefined) continue;
      const b = P.buf[n] || 0;
      if (info[n].di_dalam || jarak[n] < b || (b === 0 && jarak[n] === 0)) ex.push({ layer: n, teks: info[n].di_dalam ? teks.replace('Terlalu dekat', 'Di dalam').replace('Di dalam / dekat', 'Di dalam') : teks + ' (' + jarak[n].toFixed(2) + ' km < ' + b + ' km)' });
    }
    // perairan 5 km & kedalaman
    const p5 = titikDalam('perairan5km', lat, lng);
    const dalamPerairan = p5 === undefined ? null : !!p5;
    if (P.wajibPerairan5km && dalamPerairan === false) ex.push({ layer: 'perairan5km', teks: 'Di luar perairan pesisir 5 km' });
    let kedalaman = null;
    const zr = kedalamanDi(lat, lng);
    if (zr != null) {
      const kl = kelasKedalaman(zr);
      kedalaman = { z: zr, kelas: kl || 6, daratan: kl === 0, rentang: kl === 0 ? 'daratan (ETOPO1 > 0 m)' : RENTANG[kl], sumber: 'ETOPO1 (raster ~1,85 km)' };
    } else {
      const bat = titikDalam('batimetri', lat, lng);
      if (bat) kedalaman = { z: null, kelas: +bat.class_id, rentang: bat.depth_range, sumber: 'poligon kelas batimetri' };
    }
    // ekosistem terdekat (jarak ke batas), untuk skor Eko
    const kandidat = ['mangrove', 'karang', 'reef', 'lamun', 'konservasi'].filter(n => jarak[n] !== undefined);
    let dEko = Infinity, ekoNama = null;
    for (const n of kandidat) if (jarak[n] < dEko) { dEko = jarak[n]; ekoNama = n; }
    // jaringan
    const dGrid = Math.min(jarak.gardu === undefined ? Infinity : jarak.gardu, jarak.jalur_listrik === undefined ? Infinity : jarak.jalur_listrik);
    let desaInfo = null;
    if (opsi.desa && opsi.desa.length) {
      const l = opsi.desa.map(x => ({ nama: x.nama, d: hav(lat, lng, x.lat, x.lng) })).sort((a, b) => a.d - b.d); desaInfo = l[0];
    }
    const sJarGrid = isFinite(dGrid) ? skorJaringan(dGrid, P) : null;
    const sJarDesa = desaInfo ? skorDesa(desaInfo.d, P) : null;
    let sJar = P.jarMode === 'desa' ? sJarDesa : P.jarMode === 'rata' ? (sJarGrid != null && sJarDesa != null ? (sJarGrid + sJarDesa) / 2 : (sJarGrid != null ? sJarGrid : sJarDesa)) : sJarGrid;
    const peringatan = [];
    if (sJar == null) { sJar = sJarDesa != null ? sJarDesa : 3; peringatan.push('Data jaringan listrik tidak termuat; skor Jarak memakai cadangan.'); }
    if (kedalaman == null) peringatan.push('Titik di luar cakupan data batimetri; skor Kedalaman memakai nilai netral (' + P.skorKedalamanTakDiketahui + ').');
    else if (kedalaman.daratan) peringatan.push('ETOPO1 (resolusi ~1,85 km) menandai titik ini sebagai daratan; kedalaman nyata di pesisir bisa berbeda. Skor memakai kelas terdangkal.');
    if (dalamPerairan === false) peringatan.push('Titik di luar poligon perairan pesisir 5 km (daratan atau laut lepas).');
    const luar = luarCakupanHabitat(lat, lng), bh = cakupanHabitat();
    if (luar === true) peringatan.push('DI LUAR CAKUPAN DATA karang/lamun/reef (Allen Coral Atlas hanya ' + bh[0].toFixed(2) + '–' + bh[2].toFixed(2) + '°BT). \"Tidak ada karang/lamun\" di sini berarti tidak ada data, bukan tidak ada ekosistem; skor Ekosistem bisa terlalu tinggi.');
    const sKed = kedalaman ? (P.skorKedalaman[kedalaman.kelas] != null ? P.skorKedalaman[kedalaman.kelas] : P.skorKedalamanTakDiketahui) : P.skorKedalamanTakDiketahui;
    const sEko = isFinite(dEko) ? skorEko(dEko, P) : 5;
    return { lat, lng, jarak, info, ex, kedalaman, dalamPerairan, dEko, ekoNama, dGrid: isFinite(dGrid) ? dGrid : null, desa: desaInfo,
             skor: { eko: sEko, ked: sKed, jar: sJar, jarGrid: sJarGrid, jarDesa: sJarDesa }, luarCakupan: luar === true, peringatan };
  }

  // ---------------------------------------------------------------- MCDA
  function normBobot(W) {
    const w = {}; let s = 0; KEY.forEach(k => { w[k] = Math.max(0, +W[k] || 0); s += w[k]; });
    if (s <= 0) return Object.assign({}, BOBOT_DEFAULT);
    KEY.forEach(k => w[k] /= s); return w;
  }
  // mcda(spasial, kw, W, mask, P) -> { s:[daya,eko,ked,jar], raw, fin, ex, kelas, kontribusi }
  function mcda(sp, kw, W, mask, P) {
    P = P || PARAM_DEFAULT; const w = normBobot(W || BOBOT_DEFAULT);
    const s = [skorDaya(kw, P), sp.skor.eko, sp.skor.ked, sp.skor.jar];
    const kontribusi = KEY.map((k, i) => s[i] * w[k]);
    const raw = kontribusi.reduce((a, b) => a + b, 0);
    const ex = sp.ex.length > 0;
    const fin = (mask !== false && ex) ? 0 : raw;
    return { s, w, raw, fin, ex, kelas: kelasDari(fin), kontribusi, ekoTidakLengkap: !!sp.luarCakupan };
  }

  // ---------------------------------------------------------------- energi (sama dengan rumus versi sebelumnya, dapat diatur)
  const dayaGelombang = (hs, te) => 0.49 * hs * hs * te;     // kW/m
  function energi(kw, P) {
    P = P || PARAM_DEFAULT;
    const pKwGel = kw * P.lebar;                    // kW pada muka gelombang selebar perangkat
    const pKw = pKwGel * P.efisiensi * P.unit;      // kW listrik (semua unit)
    const pW = pKw * 1000;
    const kwhTahun = pKw * 8760 * P.cf;
    const rumah = {};
    [450, 900, 1300].forEach(va => {
      rumah[va] = { puncak: Math.floor(pW / va), tahunan: Math.floor(kwhTahun / (P.kwhBulan[va] * 12)) };
    });
    return { pKwGel, pKw, pW, kwhTahun, rumah };
  }

  // ---------------------------------------------------------------- zona grid (peta zona ECO-WAVE)
  // Menilai sel grid di dalam perairan 5 km. kwFn(lat,lng) -> kW/m. Bertahap agar UI tidak membeku.
  function zonaGrid(opsi) {
    opsi = opsi || {}; const step = opsi.step || 0.01, P = opsi.P || PARAM_DEFAULT, W = opsi.W || BOBOT_DEFAULT;
    const S = STORE.perairan5km; if (!S) return Promise.reject(new Error('Layer perairan5km belum dimuat'));
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    S.feats.forEach(f => { x0 = Math.min(x0, f.b[0]); y0 = Math.min(y0, f.b[1]); x1 = Math.max(x1, f.b[2]); y1 = Math.max(y1, f.b[3]); });
    const cells = [], batasAnalisis = batasAnalisisHabitatKustom(), areaStudi = batasAreaStudi();
    for (let la = Math.ceil(y0 / step) * step; la < y1; la += step) for (let ln = Math.ceil(x0 / step) * step; ln < x1; ln += step) cells.push([la + step / 2, ln + step / 2]);
    const hasil = []; let i = 0;
    return new Promise(res => {
      (function putaran() {
        const t0 = Date.now();
        while (i < cells.length && Date.now() - t0 < 30) {
          const [la, ln] = cells[i++];
          if (!diDalamKotak(la, ln, areaStudi) || (batasAnalisis && !diDalamKotak(la, ln, batasAnalisis))) continue;
          if (opsi.latMaks != null && la > opsi.latMaks) continue;
          if (!titikDalam('perairan5km', la, ln)) continue;
          const sp = analisisSpasial(la, ln, { P, desa: opsi.desa }), kw = opsi.kwFn(la, ln), m = mcda(sp, kw, W, opsi.mask, P);
          hasil.push({ lat: la, lng: ln, step, kw, fin: m.fin, raw: m.raw, ex: m.ex, alasan: sp.ex.map(e => e.teks), s: m.s, kelas: m.kelas, luarCakupan: !!sp.luarCakupan });
        }
        if (opsi.onProgress) opsi.onProgress(i / cells.length);
        if (i < cells.length) (typeof setTimeout !== 'undefined' ? setTimeout : f => f())(putaran, 0); else res(hasil);
      })();
    });
  }

  // ---------------------------------------------------------------- BMKG (JSON prakiraan perairan)
  // Mengubah JSON BMKG menjadi deret waktu seragam. Hs dari BMKG; periode (Te) TIDAK ada di BMKG -> dari parameter.
  function parseBMKG(j, te) {
    const gabung = [].concat(j.forecast_day1 || [], j['forecast_day2-4'] || []);
    const seri = gabung.map(r => {
      const t = Date.parse(String(r.time).replace(' UTC', 'Z').replace(' ', 'T'));
      return { t, waktu: r.time, cuaca: r.weather, suhu: r.temp_avg, angin: r.wind_speed, hembus: r.wind_gust, arahAngin: r.wind_from,
               kat: r.wave_cat, hs: +r.wave_height, arus: +r.current_speed, arahArus: r.current_to, p: dayaGelombang(+r.wave_height, te) };
    }).filter(x => isFinite(x.hs) && isFinite(x.t));
    return { kode: j.code, nama: j.name, terbit: j.issued, berlakuDari: j.valid_from, berlakuSampai: j.valid_to, noSurat: j.no_surat, seri };
  }
  function ringkasBMKG(b, te) {
    const s = b.seri; if (!s.length) return null;
    const hs = s.map(x => x.hs), now = Date.now();
    let k = 0, best = Infinity; s.forEach((x, i) => { const d = Math.abs(x.t - now); if (d < best) { best = d; k = i; } });
    const rata = a => a.reduce((x, y) => x + y, 0) / a.length;
    const p = hs.map(h => dayaGelombang(h, te));
    return { sekarang: s[k], idxSekarang: k, hsRata: rata(hs), hsMaks: Math.max(...hs), hsMin: Math.min(...hs),
             pRata: rata(p), pMaks: Math.max(...p), pSekarang: dayaGelombang(s[k].hs, te), arusRata: rata(s.map(x => x.arus)), n: s.length };
  }

  // ---------------------------------------------------------------- gelombang acuan (IDW) + faktor musim: SATU rumus untuk Peta & Kalkulator
  // idw(lat,lng,titik) -> { p, hs, te, med, terdekat, detail }. Bobot = 1/d^2 (d dalam derajat, minimum 0,001), identik dengan versi sebelumnya.
  function idw(lat, lng, titik) {
    let sW = 0, sP = 0, sHs = 0, sTe = 0, sMed = 0, sWMed = 0; const detail = [];
    (titik || []).forEach(t => {
      let dDeg = Math.sqrt(Math.pow(lat - t.lat, 2) + Math.pow(lng - t.lng, 2)); if (dDeg < 0.001) dDeg = 0.001;
      const w = 1 / (dDeg * dDeg); sW += w; sP += w * t.p; sHs += w * t.hs; sTe += w * t.te;
      if (t.med != null) { sMed += w * t.med; sWMed += w; }
      detail.push({ nama: t.nama, jarak: dDeg * 111, bobot: w, p: t.p });
    });
    if (!detail.length) throw new Error('Tidak ada titik acuan gelombang.');
    detail.sort((a, b) => a.jarak - b.jarak); detail.forEach(d => { d.persenBobot = (d.bobot / sW * 100).toFixed(1); });
    return { p: sP / sW, hs: sHs / sW, te: sTe / sW, med: sWMed ? sMed / sWMed : null, terdekat: detail[0], detail };
  }
  const MUSIM_INDEKS = { djf: 0, mam: 1, jja: 2, son: 3 };
  const MUSIM_NAMA = { thn: 'Tahunan', djf: 'Barat (DJF)', mam: 'Peralihan I (MAM)', jja: 'Timur (JJA)', son: 'Peralihan II (SON)' };
  // faktorMusim('jja', cm) = daya rata-rata musim / daya rata-rata tahunan (klimatologi CMEMS cm.musiman.p ÷ cm.klimRata).
  function faktorMusim(musim, cm) {
    if (!musim || musim === 'thn') return 1;
    const i = MUSIM_INDEKS[musim]; if (i === undefined || !cm || !cm.musiman || !(cm.klimRata > 0)) return 1;
    return cm.musiman.p[i] / cm.klimRata;
  }
  // hitungTitik: SATU jalur perhitungan untuk satu titik. Dipakai Peta (klik), Kalkulator, Lokasi Terbaik, dan laporan ekspor.
  // opsi: { lat, lng, cm:{titik,musiman,klimRata}, musim, gel (opsional: {src,kw,hs,te,...} untuk BMKG/manual), W, mask, P, desa }
  function hitungTitik(opsi) {
    const P0 = opsi.P || PARAM_DEFAULT, musim = opsi.musim || 'thn'; let gel = opsi.gel;
    if (!gel) {
      const it = idw(opsi.lat, opsi.lng, opsi.cm.titik), f = faktorMusim(musim, opsi.cm);
      gel = { src: 'cmems', kw: it.p * f, hs: it.hs, te: it.te, faktor: f, musim, inter: it, label: 'CMEMS 2015–2024 (IDW)' + (musim === 'thn' ? '' : ' • musim ' + musim.toUpperCase()) };
    }
    // skor Daya musiman dibandingkan dengan rentang musim yang sama (dayaSkala); sumber lain memakai skala tahunan
    const P = Object.assign({}, P0, { dayaSkala: gel.src === 'cmems' ? (gel.faktor || 1) : 1 });
    const sp = analisisSpasial(opsi.lat, opsi.lng, { P, desa: opsi.desa }), m = mcda(sp, gel.kw, opsi.W || BOBOT_DEFAULT, opsi.mask !== false, P), en = energi(gel.kw, P);
    return { lat: opsi.lat, lng: opsi.lng, gel, sp, m, en, P, W: normBobot(opsi.W || BOBOT_DEFAULT), mask: opsi.mask !== false };
  }
  // Rentang acuan skor Daya = min–maks daya titik acuan yang sedang dipakai (kecuali pengguna mengubahnya sendiri).
  function rentangDayaAcuan(titik) { const ps = (titik || []).map(t => t.p); if (!ps.length) return PARAM_DEFAULT.dayaRef.slice(); const lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps); return hi > lo ? [lo, hi] : [lo * .9, hi * 1.1]; }

  // ---------------------------------------------------------------- ekspor (celah Q6) - fungsi murni, tanpa DOM
  // zonaKeGeoJSON(sel, meta) -> FeatureCollection poligon EPSG:4326 untuk ArcGIS/QGIS; meta (parameter yang dipakai) ikut disimpan.
  function zonaKeGeoJSON(cells, meta) {
    return { type: 'FeatureCollection', name: 'ecowave_zona', crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } }, metadata: meta || {},
      features: cells.map(c => { const h = c.step / 2, x0 = +(c.lng - h).toFixed(5), x1 = +(c.lng + h).toFixed(5), y0 = +(c.lat - h).toFixed(5), y1 = +(c.lat + h).toFixed(5);
        return { type: 'Feature', properties: { kw: +c.kw.toFixed(3), skor_akhir: +c.fin.toFixed(3), skor_mentah: +c.raw.toFixed(3), kelas: c.kelas.n, tereksklusi: c.ex ? 1 : 0, alasan: c.alasan.join(' | '),
          s_daya: +c.s[0].toFixed(2), s_eko: c.s[1], s_ked: c.s[2], s_jar: c.s[3], luar_cakupan_habitat: c.luarCakupan ? 1 : 0 },
          geometry: { type: 'Polygon', coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] } }; }) };
  }
  const csvSel = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  function keCSV(kepala, baris) { return [kepala].concat(baris).map(r => r.map(csvSel).join(',')).join('\r\n'); }

  const API = { daratan, FAKTOR, NAMA_FAKTOR, KELAS_LEGENDA, MUSIM_NAMA, MUSIM_INDEKS, idw, faktorMusim, hitungTitik, rentangDayaAcuan, PARAM_DEFAULT, cakupan, cakupanHabitat, batasAreaStudi, batasAreaStudiKustom, simpanBatasAreaStudi, dalamAreaStudi, batasAnalisisHabitatKustom, simpanBatasAnalisisHabitat, dalamAreaAnalisisHabitat, luarCakupanHabitat, zonaKeGeoJSON, keCSV, BOBOT_DEFAULT, KEY, KELAS, LAYER_META, STORE, RAWGJ, muat, muatRaster, pasang, pasangRaster, kedalamanDi, terdekat, titikDalam, analisisSpasial, mcda, normBobot,
                energi, dayaGelombang, skorDaya, skorEko, skorJaringan, skorDesa, kelasDari, label5, hav, zonaGrid, parseBMKG, ringkasBMKG };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.ECOWAVE = API;
})(typeof window !== 'undefined' ? window : globalThis);
