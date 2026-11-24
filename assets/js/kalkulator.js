/* ECO-WAVE - halaman Kalkulator. Memakai core.js (W, EX, D, kelas, simpanMCA, perlu, muatData), data.js (CMEMS, DESA,
   interpolasiCMEMS), ecowave.js (mesin hitung) dan ecowave_data.js (layer Leaflet). */
(function () {
  'use strict';
  const E = window.ECOWAVE, UI = window.ECOWAVE_UI, g = id => document.getElementById(id);
  const ALL = Object.keys(E.LAYER_META), BASE = 'assets/data/pltgl/';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const n2 = (x, d = 2) => Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { minimumFractionDigits: d, maximumFractionDigits: d });
  const clone = o => JSON.parse(JSON.stringify(o));
  const NAMA_KRI = { daya: 'Daya gelombang', eko: 'Ekosistem (jarak)', ked: 'Kedalaman', jar: 'Jarak infrastruktur' };
  const PARAM_KEY = 'ecowave_param';
  const MUSIM_IDX = { djf: 0, mam: 1, jja: 2, son: 3 };

  let P = paramEco() || clone(E.PARAM_DEFAULT);
  // Setelah titik acuan dari DB masuk, rentang acuan Daya ikut diperbarui (kecuali dikunci pengguna) agar sama dengan Peta.
  if (typeof onRef === 'function') onRef(() => { if (!P.dayaRefManual) P.dayaRef = E.rentangDayaAcuan(CMEMS.titik); });
  const simpanP = () => simpanParamEco(P);

  let titik = null, marker = null, last = null, bmRaw = null, chart = null, zona = null, rankCache = null;
  let map;

  // ------------------------------------------------------------------ peta
  const PG = window.ECOWAVE_PETA;
  let legCtl = null, batasCak = null, kandLayer = null, studiLayer = null, cakupan = null;
  function initPeta() {
    map = L.map('ekMap', { zoomSnap: .25, wheelPxPerZoomLevel: 90 }).setView([-7.05, 106], 9);
    PG.pasangBasemap(map, { awal: 'gelap', posisi: 'topright' });
    PG.kontrolUmum(map, { layarPenuh: g('ekMap'), titik: () => marker ? marker.getLatLng() : null });
    studiLayer = PG.batasStudi(map, E.batasAreaStudi());
    const gAcuan = L.layerGroup().addTo(map);
    function gambarAcuan() {
      gAcuan.clearLayers();
      CMEMS.titik.forEach((t, i) => L.marker([t.lat, t.lng], { icon: PG.ikonCmems(labelTitik(t, i)), keyboard: false }).addTo(gAcuan).bindPopup(PG.kartu({ judul: t.nama + ' (' + (t.sumber || 'CMEMS') + ')', sub: (t.sumber && t.sumber !== 'CMEMS') ? 'Titik acuan gelombang (' + t.sumber + ')' : 'Titik acuan gelombang 2015–2024',
        baris: [['Daya', n2(t.p) + ' kW/m'], ['Hs / Te', n2(t.hs) + ' m / ' + n2(t.te) + ' s']], aksi: [{ teks: 'Hitung titik ini', klik: 'window.__ekPilih(' + t.lat + ',' + t.lng + ')' }] }), PG.OPS_POPUP));
      DESA.forEach(d => L.marker([d.lat, d.lng], { icon: PG.ikonDesa(), keyboard: false }).addTo(gAcuan).bindPopup(PG.kartu({ judul: d.nama, sub: d.kec, baris: [['Penduduk', '~' + d.penduduk.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' jiwa']] }), PG.OPS_POPUP));
    }
    gambarAcuan(); onRef(gambarAcuan);
    legCtl = PG.kontrolLegenda(map, 'Legenda', () => PG.li('#facc15', 'Titik CMEMS (acuan gelombang)', 'c') + PG.li('#60a5fa', 'Desa acuan', 'c') + PG.li('#22d3ee', 'Titik analisis', 'c') +
      PG.li('#16a34a', 'Zona: Sangat layak') + PG.li('#86efac', 'Zona: Layak') + PG.li('#facc15', 'Zona: Cukup') + PG.li('#fb923c', 'Zona: Kurang') + PG.li('#9ca3af', 'Zona: Tereksklusi') + PG.li('#facc15', 'Batas cakupan data karang/lamun', 'l'), 'bottomright');
    map.on('click', async e => {
      try { await E.muatRaster(BASE); } catch (_) {}
      if (E.daratan(e.latlng.lat, e.latlng.lng)) { pesan('Titik yang diklik berada di <b>daratan</b>, jadi tidak ada nilai gelombang atau skor. Klik di perairan pesisir.', 'warn'); return; }
      setTitik(e.latlng.lat, e.latlng.lng, true);
    });
    UI.panelLayer({ wadah: g('ekLayers'), map, layers: ['perairan5km', 'mangrove', 'karang', 'reef', 'lamun', 'konservasi', 'batimetri', 'gardu', 'jalur_listrik', 'jalur_pelayaran', 'pelabuhan'], base: BASE });
    E.muat(['karang', 'lamun', 'reef'], BASE).then(() => { cakupan = E.cakupanHabitat(); gambarCakupan(E.batasAnalisisHabitatKustom()); aturKontrolGaris(); }).catch(() => {});
    aturKontrolGaris();
    setTimeout(() => map.invalidateSize(), 300);
  }

  // ---- garis putus-putus biru (area studi) & kuning (batas analisis), sama seperti panel Map / Layer di Peta
  function nilaiKotak(ids) { const v = ids.map(i => Number(g(i).value)); return v; }
  function isiKotak(ids, b) { g(ids[0]).value = b[1].toFixed(4); g(ids[1]).value = b[0].toFixed(4); g(ids[2]).value = b[3].toFixed(4); g(ids[3]).value = b[2].toFixed(4); }
  function kotakValid(v) { const [s, w, n, e] = v; return !(v.some(x => !Number.isFinite(x)) || s < -8 || n > -6 || w < 104.5 || e > 107 || s >= n || w >= e); }
  function gambarStudi(b) { if (studiLayer) map.removeLayer(studiLayer); studiLayer = PG.batasStudi(map, b); if (!g('ekStudyOn').checked) map.removeLayer(studiLayer); }
  function gambarCakupan(b) { if (batasCak) map.removeLayer(batasCak); batasCak = PG.batasCakupan(map, cakupan, b); if (batasCak && !g('ekAnalOn').checked) map.removeLayer(batasCak); }
  let kontrolGarisSiap = false;
  function aturKontrolGaris() {
    const S = ['ekStudyS', 'ekStudyW', 'ekStudyN', 'ekStudyE'], A = ['ekAnalS', 'ekAnalW', 'ekAnalN', 'ekAnalE'];
    g('ekStudyReset').disabled = !E.batasAreaStudiKustom();
    if (cakupan) { isiKotak(A, E.batasAnalisisHabitatKustom() || cakupan); g('ekAnalApply').disabled = false; g('ekAnalReset').disabled = false; }
    if (kontrolGarisSiap) return; kontrolGarisSiap = true;
    isiKotak(S, E.batasAreaStudi());
    g('ekStudyOn').onchange = () => { if (!studiLayer) return; if (g('ekStudyOn').checked) studiLayer.addTo(map); else map.removeLayer(studiLayer); };
    g('ekAnalOn').onchange = () => { if (!batasCak) return; if (g('ekAnalOn').checked) batasCak.addTo(map); else map.removeLayer(batasCak); };
    g('ekStudyApply').onclick = () => {
      const v = nilaiKotak(S), st = g('ekStudyStatus');
      if (!kotakValid(v)) { st.textContent = 'Koordinat tidak valid. Gunakan area studi maksimum (lat −8…−6, bujur 104,5…107) dan pastikan batas selatan < utara serta barat < timur.'; return; }
      try { const b = [v[1], v[0], v[3], v[2]]; E.simpanBatasAreaStudi(b); gambarStudi(b); g('ekStudyReset').disabled = false; st.textContent = 'Kotak area studi diperbarui. Titik dan zona di luar kotak tidak dihitung.'; }
      catch (err) { st.textContent = 'Gagal menyimpan area studi: ' + err.message; }
    };
    g('ekStudyReset').onclick = () => {
      const st = g('ekStudyStatus');
      try { E.simpanBatasAreaStudi(null); const b = E.batasAreaStudi(); isiKotak(S, b); gambarStudi(b); g('ekStudyReset').disabled = true; st.textContent = 'Area studi dikembalikan ke batas awal.'; }
      catch (err) { st.textContent = 'Gagal mengembalikan area studi: ' + err.message; }
    };
    g('ekAnalApply').onclick = () => {
      const v = nilaiKotak(A), st = g('ekAnalStatus');
      if (!kotakValid(v)) { st.textContent = 'Koordinat tidak valid. Gunakan area studi (lat −8…−6, bujur 104,5…107) dan pastikan batas selatan < utara serta barat < timur.'; return; }
      try { const b = [v[1], v[0], v[3], v[2]]; E.simpanBatasAnalisisHabitat(b); gambarCakupan(b); st.textContent = 'Batas area analisis diperbarui dan disimpan.'; }
      catch (err) { st.textContent = 'Gagal menyimpan batas: ' + err.message; }
    };
    g('ekAnalReset').onclick = () => {
      if (!cakupan) return; const st = g('ekAnalStatus');
      try { E.simpanBatasAnalisisHabitat(null); isiKotak(A, cakupan); gambarCakupan(null); st.textContent = 'Batas analisis dikembalikan ke cakupan data asli.'; }
      catch (err) { st.textContent = 'Gagal mengembalikan batas: ' + err.message; }
    };
  }
  function gambarKandidat() {   // kandidat database (DEMO) sebagai lencana skor; skor memakai bobot bersama Peta/Beranda
    if (kandLayer) map.removeLayer(kandLayer); kandLayer = L.layerGroup().addTo(map);
    D.forEach(l => { const s = fin(l), k = kelas(s), gugur = EX && l.ex;
      L.marker([l.latitude, l.longitude], { icon: PG.ikonSkor(s, k.c, l.name, gugur), riseOnHover: true, keyboard: false }).addTo(kandLayer)
        .bindPopup(PG.kartu({ judul: l.name, sub: l.region + ' · kandidat (DEMO)', skor: n2(s), warna: k.c, kelas: k.n, baris: [['Daya rata-rata', n2(l.kw, 1) + ' kW/m']], aksi: [{ teks: 'Hitung data nyata', klik: 'window.__ekPilih(' + l.latitude + ',' + l.longitude + ')' }] }), PG.OPS_POPUP); });
  }
  function setTitik(lat, lng, jalan) {
    titik = { lat: +lat, lng: +lng };
    g('ekLat').value = titik.lat.toFixed(4); g('ekLng').value = titik.lng.toFixed(4);
    if (marker) map.removeLayer(marker);
    marker = L.marker([titik.lat, titik.lng], { icon: PG.ikonTarget(), keyboard: false }).addTo(map);
    if (jalan) hitung();
  }

  // ------------------------------------------------------------------ pesan
  function pesan(teks, jenis) { const j = jenis || 'bad'; g('ekMsg').innerHTML = teks ? '<div class="ek-' + j + '"><i class="bi bi-' + (j === 'ok' ? 'check-circle' : 'exclamation-triangle') + '"></i><span>' + teks + '</span></div>' : ''; }
  function sibuk(b) { const t = g('ekHitung'); t.disabled = b; t.innerHTML = b ? '<i class="bi bi-hourglass-split"></i> Menghitung…' : '<i class="bi bi-calculator"></i> Hitung ECO-WAVE'; }

  // ------------------------------------------------------------------ perangkat & parameter dari form
  function bacaPerangkat() {
    const v = (id, lo, hi) => { const x = +g(id).value; return isFinite(x) ? Math.min(hi, Math.max(lo, x)) : lo; };
    P.lebar = v('ekLebar', 1, 1000); P.efisiensi = v('ekEf', 1, 100) / 100; P.cf = v('ekCf', 1, 100) / 100; P.unit = Math.round(v('ekUnit', 1, 1000));
    simpanP();
  }

  // ------------------------------------------------------------------ BMKG
  function kodeBmkg() { const s = g('ekPerairan').value; return s === 'custom' ? g('ekKode').value.trim().toUpperCase() : s; }
  async function muatBMKG() {
    const kode = kodeBmkg(), st = g('ekBmStat');
    if (!/^[MP](\.[A-Z]{1,2})?\.[0-9]{2}$/.test(kode)) { st.innerHTML = '<span style="color:#fecdd3">Kode tidak valid (contoh: M.09, P.AC.01).</span>'; return false; }
    st.textContent = 'Memuat prakiraan BMKG ' + kode + '…';
    let j = null, via = '';
    try { const r = await fetch('api/bmkg.php?code=' + encodeURIComponent(kode)); j = await r.json(); if (!r.ok || !j.forecast_day1) throw new Error(j.error || 'respon tidak valid'); via = 'server (api/bmkg.php)' + (j.stale ? ' — cache lama, BMKG tidak terjangkau' : j.cache ? ' — cache' : ''); }
    catch (e1) { bmRaw = null; st.innerHTML = '<span style="color:#fecdd3">Gagal memuat BMKG (' + esc(e1.message || e1) + '). Periksa koneksi server atau gunakan sumber CMEMS/Manual.</span>'; return false; }
    bmRaw = j;
    st.innerHTML = '<b>' + esc(j.name || kode) + '</b> (' + esc(j.code || kode) + ')<br>Terbit ' + esc(j.issued) + ' • berlaku ' + esc(j.valid_from) + ' s/d ' + esc(j.valid_to) + '<br>Nomor: ' + esc(j.no_surat || '-') + ' • sumber: ' + esc(via);
    return true;
  }

  // ------------------------------------------------------------------ gelombang -> kW/m
  function seasonFactor(m) { return E.faktorMusim(m, CMEMS); }  // rumus bersama dengan Peta (core.js sf)
  async function gelombang(t) {
    const src = document.querySelector('input[name=ekSumber]:checked').value;
    if (src === 'manual') {
      const hs = +g('ekHs').value, te = +g('ekTeM').value;
      if (!(hs > 0 && te > 0)) throw new Error('Isi Hs dan Te manual dengan angka positif.');
      return { src, kw: E.dayaGelombang(hs, te), hs, te, label: 'Manual', rumus: 'P = 0,49 × Hs² × Te' };
    }
    if (src === 'bmkg') {
      if (!bmRaw && !(await muatBMKG())) throw new Error('Prakiraan BMKG belum tersedia.');
      const te = +g('ekTeB').value; if (!(te > 0)) throw new Error('Isi periode Te BMKG.');
      const bm = E.parseBMKG(bmRaw, te), r = E.ringkasBMKG(bm, te); if (!r) throw new Error('Deret prakiraan BMKG kosong.');
      const stat = g('ekStat').value;
      const kw = stat === 'sekarang' ? r.pSekarang : stat === 'maks' ? r.pMaks : r.pRata;
      const hs = stat === 'sekarang' ? r.sekarang.hs : stat === 'maks' ? r.hsMaks : r.hsRata;
      return { src, kw, hs, te, label: 'BMKG ' + (bm.nama || bm.kode) + ' • ' + ({ rata: 'rata-rata', sekarang: 'saat ini', maks: 'maksimum' }[stat]), bm, ringkas: r,
               rumus: 'Hs dari BMKG; Te = ' + n2(te, 1) + ' s (input pengguna)' };
    }
    const it = interpolasiCMEMS(t.lat, t.lng), m = g('ekMusim').value, f = seasonFactor(m);
    return { src, kw: it.p * f, hs: it.hs, te: it.te, label: 'CMEMS 2015–2024 (IDW)' + (m === 'thn' ? '' : ' • musim ' + m.toUpperCase()), inter: it, musim: m, faktor: f, rumus: 'IDW ' + rentangTitik() + ', P = 0,49 × Hs² × Te' };
  }

  // ------------------------------------------------------------------ hitung utama
  async function hitung() {
    if (!titik) { pesan('Klik peta atau isi koordinat lebih dulu.'); return; }
    if (!E.dalamAreaStudi(titik.lat, titik.lng)) { pesan('Titik di luar kotak area studi yang aktif. Atur batasnya di panel “Garis batas di peta” di bawah peta.'); return; }
    if (!E.dalamAreaAnalisisHabitat(titik.lat, titik.lng)) { pesan('Titik di luar batas area analisis. Ubah koordinat batas di panel “Garis batas di peta” di bawah peta.'); return; }
    bacaPerangkat(); pesan(''); sibuk(true);
    try {
      await Promise.all([E.muat(ALL, BASE), E.muatRaster(BASE)]);
      if (E.daratan(titik.lat, titik.lng)) { pesan('Titik ini berada di <b>daratan</b>, jadi tidak ada nilai gelombang atau skor. Pilih titik di perairan pesisir.', 'warn'); return; }
      const gel = await gelombang(titik);
      P.dayaSkala = gel.src === 'cmems' ? gel.faktor : 1;   // skor Daya musiman dibandingkan dengan rentang musim yang sama
      const sp = E.analisisSpasial(titik.lat, titik.lng, { P, desa: DESA });
      last = { titik: { ...titik }, sp, gel }; rankCache = null;
      g('ekHasil').classList.remove('hidden'); render();
      g('ekHasil').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) { pesan(esc(e.message || e)); }
    finally { sibuk(false); }
  }

  // ------------------------------------------------------------------ render
  function render() {
    if (!last) return;
    const { sp, gel } = last; P.dayaSkala = gel.src === 'cmems' ? gel.faktor : 1; const en = E.energi(gel.kw, P), m = E.mcda(sp, gel.kw, W, EX, P);
    last.en = en; last.m = m;
    SINKRON.tulis({ terakhir: { lat: last.titik.lat, lng: last.titik.lng, kw: gel.kw, hs: gel.hs, te: gel.te, fin: m.fin, kelas: m.kelas.n, ex: m.ex, pKw: en.pKw, rumah450: en.rumah[450].puncak, musim: gel.musim || null, sumber: 'Kalkulator · ' + gel.label, waktu: Date.now() } });
    const kls = m.kelas;
    g('ekCakup').innerHTML = sp.luarCakupan ? '<div class="ek-warn" style="margin:0 0 14px"><i class="bi bi-exclamation-triangle"></i><span><b>Di luar cakupan data karang/lamun.</b> Hasil &ldquo;tidak ada karang/lamun&rdquo; di titik ini berarti <b>tidak ada data</b>, bukan tidak ada ekosistem. Skor Ekosistem dapat terlalu tinggi; verifikasi lapangan/data tambahan diperlukan.</span></div>' : '';
    g('k-ringkas').innerHTML = ringkasan(m, sp, gel);
    g('ekKpi').innerHTML =
      kpi('bi-water', '#38bdf8', 'Daya gelombang', n2(gel.kw), 'kW/m', 'Hs ' + n2(gel.hs) + ' m • Te ' + n2(gel.te, 1) + ' s', 'Energi gelombang di setiap 1 meter lebar muka gelombang.') +
      kpi('bi-lightning-charge-fill', '#facc15', 'Daya listrik', n2(en.pKw, 1), 'kW', P.unit + ' perangkat × ' + P.lebar + ' m × ' + Math.round(P.efisiensi * 100) + '%', 'Listrik yang dihasilkan perangkat pada kondisi gelombang rata-rata.') +
      kpi('bi-battery-charging', '#2dd4bf', 'Energi per tahun', n2(en.kwhTahun / 1000, 1), 'MWh', 'Faktor kapasitas ' + Math.round(P.cf * 100) + '%', '&asymp; ' + en.rumah[900].tahunan.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' rumah 900 VA terlayani sepanjang tahun.') +
      kpi('bi-clipboard-check', kls.c, 'Skor MCDA', n2(m.fin), '/ 5', '<span class="pill" style="background:' + kls.c + '">' + kls.n + '</span>' + (m.ex ? ' tereksklusi' : ''), 'Skor 1&ndash;5. Makin tinggi, makin layak titik ini.');
    renderEnergi(en); renderMcda(); renderJarak(); renderChart();
  }
  const kpi = (ik, w, a, b, u, c, x) => '<div class="card" style="--kc:' + w + '"><div class="kh"><i class="bi ' + ik + '"></i><small>' + a + '</small></div><strong>' + b + '<u>' + u + '</u></strong><div class="kd">' + c + '</div><div class="kx">' + x + '</div></div>';
  const IKON_KRI = { daya: 'bi-water', eko: 'bi-tree', ked: 'bi-rulers', jar: 'bi-plug' };
  const ARTI_KRI = { daya: 'Makin besar gelombang, makin baik.', eko: 'Makin jauh dari mangrove, karang, dan lamun, makin baik.', ked: 'Skor mengikuti rentang kedalaman (diatur di Parameter lanjutan).', jar: 'Makin dekat ke gardu, jalur listrik, atau desa, makin baik.' };
  const KELAS_LEG = [['Tidak Layak', '#ef4444', '< 1,8'], ['Kurang Layak', '#fb923c', '1,8 – 2,6'], ['Cukup Layak', '#facc15', '2,6 – 3,4'], ['Layak', '#86efac', '3,4 – 4,2'], ['Sangat Layak', '#16a34a', '≥ 4,2']];
  const VERDICT = { 'Sangat Layak': 'Titik ini sangat menjanjikan untuk dikembangkan sebagai zona PLTGL.', 'Layak': 'Titik ini layak dipertimbangkan sebagai zona PLTGL.', 'Cukup Layak': 'Titik ini cukup layak, tetapi ada kriteria yang perlu diperbaiki atau diverifikasi.', 'Kurang Layak': 'Titik ini kurang layak karena beberapa kriteria utamanya lemah.', 'Tidak Layak': 'Titik ini tidak layak menurut kriteria yang dipakai.' };
  function ringkasan(m, sp, gel) {
    const kl = m.kelas, gugur = EX && m.ex, idx = m.s.map((v, i) => [v, i]), kuat = idx.reduce((a, b) => b[0] > a[0] ? b : a), lemah = idx.reduce((a, b) => b[0] < a[0] ? b : a);
    const teks = gugur ? 'Titik ini <b>tidak boleh dipakai</b> karena melanggar aturan eksklusi (lihat alasan di panel Skor MCDA). Skor akhir dipaksa 0.' : (VERDICT[kl.n] || '') + (EX || !m.ex ? '' : ' Perhatian: titik ini sebenarnya terkena eksklusi, tetapi eksklusi sedang dimatikan.');
    const pos = Math.min(100, Math.max(0, (m.fin - 1) / 4 * 100));
    const bar = KELAS_LEG.map(k => '<i style="background:' + k[1] + '"></i>').join('') + (gugur ? '' : '<em style="left:' + pos + '%"></em>');
    const lab = KELAS_LEG.map(k => '<span><b>' + k[0].replace(' Layak', '') + '</b>' + k[2] + '</span>').join('');
    const leg = KELAS_LEG.slice().reverse().map(k => '<li><i style="background:' + k[1] + '"></i>' + k[0] + '<span>' + k[2] + '</span></li>').join('') + '<li><i style="background:#9ca3af"></i>Gugur (tereksklusi)<span>0</span></li>';
    return '<div class="ek-verdict" style="--vc:' + kl.c + '"><div class="ek-vtop"><div class="ek-skor"><div><strong>' + n2(m.fin, 1) + '</strong><span>dari 5</span></div></div>' +
      '<div class="ek-vtxt"><small>Kesimpulan untuk titik ' + last.titik.lat.toFixed(3) + ', ' + last.titik.lng.toFixed(3) + '</small><h2>' + kl.n + '</h2><p>' + teks + '</p></div></div>' +
      '<div class="ek-skala"><div class="ek-skala-bar">' + bar + '</div><div class="ek-skala-lab">' + lab + '</div></div>' +
      '<div class="ek-plus"><div class="p"><small>Kriteria terkuat</small><b>' + NAMA_KRI[E.KEY[kuat[1]]] + '</b> &mdash; skor ' + n2(kuat[0], 1) + '</div><div class="m"><small>Kriteria terlemah</small><b>' + NAMA_KRI[E.KEY[lemah[1]]] + '</b> &mdash; skor ' + n2(lemah[0], 1) + '</div></div></div>' +
      '<div class="ek-baca"><h3><i class="bi bi-book"></i> Cara membaca skor</h3><ul>' + leg + '</ul><p>Skor akhir = jumlah (skor tiap kriteria × bobotnya). Skor kriteria bernilai 1 (buruk) sampai 5 (baik). Ini penapisan awal, bukan keputusan akhir.</p></div>';
  }

  function renderEnergi(en) {
    const gel = last.gel, st = (ik, t, d, v, hi) => '<div class="en-st' + (hi ? ' hi' : '') + '"><i class="bi ' + ik + '"></i><div><b>' + t + '</b><small>' + d + '</small></div><div class="ev">' + v + '</div></div>';
    let h = '<div class="en-src"><b>' + esc(gel.label) + '</b><small>' + esc(gel.rumus) + '</small></div><div class="en-flow">' +
      st('bi-water', 'Daya gelombang', 'per 1 meter muka gelombang', n2(gel.kw) + ' kW/m') +
      st('bi-arrows-expand', 'Dikali lebar tangkap', n2(gel.kw) + ' × ' + P.lebar + ' m', n2(en.pKwGel, 1) + ' kW') +
      st('bi-lightning-charge-fill', 'Dikali efisiensi &amp; jumlah unit = daya listrik', '× ' + Math.round(P.efisiensi * 100) + '% × ' + P.unit + ' unit &nbsp;(' + Math.round(en.pW).toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' W)', n2(en.pKw, 1) + ' kW', true) +
      st('bi-battery-charging', 'Energi dalam setahun', '× 8.760 jam × faktor kapasitas ' + Math.round(P.cf * 100) + '%', Math.round(en.kwhTahun).toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' kWh', true) + '</div>' +
      '<div class="ek-sub">Rumah yang bisa dilayani</div><div class="rm">';
    [[450, 'Rumah kecil / subsidi'], [900, 'Rumah menengah'], [1300, 'Rumah besar']].forEach(([va, t]) => {
      h += '<div class="rm-i"><i class="bi bi-house-door-fill"></i><b>' + va + ' VA</b><small>' + t + '</small><strong>' + en.rumah[va].tahunan.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + '</strong><span>rumah, berdasarkan energi tahunan*</span><em>' + en.rumah[va].puncak.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' <small>rumah sesaat*</small></em></div>';
    });
    h += '</div><details class="en-det"><summary>Catatan perhitungan (penting dibaca)</summary><p>*Tahunan: 450 VA = ' + P.kwhBulan[450] + ', 900 VA = ' + P.kwhBulan[900] + ', 1300 VA = ' + P.kwhBulan[1300] + ' kWh/bulan. *Sesaat = daya listrik rata-rata ÷ VA (bukan beban puncak sebenarnya). Energi tahunan mengalikan efisiensi dan faktor kapasitas sekaligus. Faktor kapasitas literatur biasanya terhadap daya terpasang, jadi hasil ini cenderung konservatif (batas bawah); konfirmasikan dengan pembimbing. Rujukan: lihat Teknologi &amp; Metode. Belum termasuk rugi kabel, downtime, inverter, dan profil beban.</p>' +
      (gel.src === 'bmkg' ? '<p>Arus permukaan rata-rata zona BMKG ' + n2(gel.ringkas.arusRata) + ' m/s (informasi saja; tidak dipakai dalam daya gelombang).</p>' : '') + '</details>';
    g('ekEnergi').innerHTML = h;
  }

  function renderMcda() {
    const { sp, gel, m } = last, w = m.w; const kd = sp.kedalaman;
    const nilai = [
      n2(gel.kw) + ' kW/m',
      sp.ekoNama ? esc(E.LAYER_META[sp.ekoNama].label) + ' ' + n2(sp.dEko, 2) + ' km (' + E.label5(sp.dEko) + ')' : 'tidak ada data',
      kd ? (kd.z != null ? n2(kd.z, 0) + ' m' : '') + ' • ' + esc(kd.rentang) : 'di luar data (netral)',
      (P.jarMode === 'desa' ? 'desa ' + (sp.desa ? n2(sp.desa.d) + ' km' : '-') : sp.dGrid != null ? 'jaringan listrik ' + n2(sp.dGrid) + ' km' : 'tidak ada data') + (P.jarMode === 'rata' && sp.desa ? ' • desa ' + n2(sp.desa.d) + ' km' : '')
    ];
    let h = '<div class="ek-sub">Nilai tiap kriteria</div><div class="kr">';
    E.KEY.forEach((k, i) => {
      const sk = m.s[i], c = kelas(sk).c, on = Math.round(sk);
      h += '<div class="kr-i" style="--c:' + c + '"><div class="kr-top"><i class="bi ' + IKON_KRI[k] + '"></i><div><b>' + NAMA_KRI[k] + '</b><small>' + ARTI_KRI[k] + '</small></div><div class="kr-s"><strong>' + n2(sk, 1) + '</strong><span>dari 5</span></div></div>' +
        '<div class="kr-val">' + nilai[i] + '</div><div class="kr-bar">' + [1, 2, 3, 4, 5].map(n => '<i' + (n <= on ? ' class="on"' : '') + '></i>').join('') + '</div>' +
        '<div class="kr-meta"><span>Bobot <b>' + Math.round(w[k] * 100) + '%</b></span><span>Sumbangan ke skor akhir <b>' + n2(m.kontribusi[i]) + '</b></span></div></div>';
    });
    h += '</div><div class="kr-total"><div><span>Skor sebelum eksklusi</span><b>' + n2(m.raw) + '</b></div>' +
         '<div class="fin"><span>Skor akhir (' + (EX ? 'eksklusi aktif' : 'eksklusi nonaktif') + ')</span><span class="pill" style="background:' + m.kelas.c + '">' + n2(m.fin) + ' • ' + m.kelas.n + '</span></div></div>' +
         '<p class="kr-rumus">Sumbangan = skor × bobot. Jumlah keempat sumbangan = skor sebelum eksklusi.</p>';
    if (sp.ex.length) h += '<div class="ek-bad"><i class="bi bi-slash-circle"></i><span><b>' + (EX ? 'TEREKSKLUSI' : 'Terkena kriteria eksklusi (mask OFF)') + ':</b><br>' + sp.ex.map(e => '• ' + esc(e.teks)).join('<br>') + '</span></div>';
    else h += '<div class="ek-ok"><i class="bi bi-check-circle"></i><span>Lolos semua kriteria eksklusi.</span></div>';
    if (sp.peringatan.length) h += '<div class="ek-warn"><i class="bi bi-exclamation-triangle"></i><span>' + sp.peringatan.map(esc).join('<br>') + '</span></div>';
    g('ekMcda').innerHTML = h;
  }

  function renderJarak() {
    const { sp } = last, eks = [], inf = [];
    const buf = { mangrove: P.buf.mangrove, karang: P.buf.karang, reef: P.buf.reef, lamun: P.buf.lamun, konservasi: P.buf.konservasi, jalur_pelayaran: P.buf.pelayaran };
    let langgar = 0, total = 0;
    ['mangrove', 'karang', 'reef', 'lamun', 'konservasi', 'jalur_pelayaran'].forEach(n => {
      const d = sp.jarak[n]; if (d === undefined) return; const b = buf[n], melanggar = sp.info[n].di_dalam || d < b; total++; if (melanggar) langgar++;
      eks.push('<div class="jr-i' + (melanggar ? ' bad' : '') + '"><div><b>' + E.LAYER_META[n].label + '</b><small>Batas aman: minimal ' + n2(b, 1) + ' km</small></div><div class="jv">' + (sp.info[n].di_dalam ? 'di dalam' : n2(d) + ' km') + '</div>' +
        (melanggar ? '<span class="pill no">eksklusi</span>' : '<span class="pill ok">aman</span>') + '</div>');
    });
    const baris = (t, v, k) => '<div class="jr-i"><div><b>' + t + '</b>' + (k ? '<small>' + k + '</small>' : '') + '</div><div class="jv">' + v + '</div><span class="pill in">info</span></div>';
    ['gardu', 'jalur_listrik', 'pelabuhan'].forEach(n => { const d = sp.jarak[n]; if (d !== undefined) inf.push(baris(E.LAYER_META[n].label, n2(d) + ' km')); });
    if (sp.desa) inf.push(baris('Desa terdekat', n2(sp.desa.d) + ' km', esc(sp.desa.nama)));
    inf.push(baris('Perairan pesisir 5 km', sp.dalamPerairan === null ? '-' : sp.dalamPerairan ? 'di dalam' : 'di luar'));
    g('ekJarak').innerHTML = '<div class="jr-sum ' + (langgar ? 'no' : 'ok') + '"><i class="bi bi-' + (langgar ? 'x-octagon' : 'shield-check') + '"></i><span>' + (langgar ? '<b>' + langgar + ' dari ' + total + '</b> lapisan terlalu dekat (melanggar batas aman).' : '<b>Semua ' + total + ' lapisan</b> berada di luar batas aman.') + '</span></div>' +
      '<div class="jr-g">Ekosistem, kawasan lindung &amp; pelayaran</div><div class="jr-l">' + eks.join('') + '</div>' +
      '<div class="jr-g">Infrastruktur &amp; permukiman</div><div class="jr-l">' + inf.join('') + '</div>' +
      '<p class="ek-note">Jarak dihitung ke tepi poligon/garis terdekat (proyeksi lokal, km). Titik gardu = pusat poligon gardu.</p>';
  }

  function renderChart() {
    const { gel } = last, cv = g('ekChart'); chart && chart.destroy(); chart = null;
    Chart.defaults.color = '#bcd3e3'; Chart.defaults.borderColor = 'rgba(255,255,255,.09)';
    const note = g('ekChartNote'), jud = g('ekChartT');
    if (gel.src === 'bmkg') {
      const s = gel.bm.seri, lab = s.map(x => new Date(x.t).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }));
      jud.textContent = 'Prakiraan BMKG — ' + (gel.bm.nama || gel.bm.kode) + ' (WIB)';
      chart = new Chart(cv, { type: 'line', data: { labels: lab, datasets: [
        { label: 'Hs (m)', data: s.map(x => x.hs), borderColor: '#22d3ee', backgroundColor: '#22d3ee22', fill: true, tension: .3, yAxisID: 'y', pointRadius: 0 },
        { label: 'P (kW/m)', data: s.map(x => +x.p.toFixed(2)), borderColor: '#facc15', tension: .3, yAxisID: 'y1', pointRadius: 0 }] },
        options: { interaction: { mode: 'index', intersect: false }, scales: { y: { title: { display: true, text: 'Hs (m)' } }, y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'kW/m' } }, x: { ticks: { maxTicksLimit: 8 } } } } });
      note.textContent = 'Hs dari BMKG, P dihitung dengan Te = ' + n2(gel.te, 1) + ' s. Kategori saat ini: ' + gel.ringkas.sekarang.kat + ' • cuaca: ' + gel.ringkas.sekarang.cuaca + '.';
    } else if (gel.src === 'cmems') {
      jud.textContent = 'Pola bulanan daya gelombang (CMEMS, diskalakan ke titik)';
      chart = new Chart(cv, { type: 'bar', data: { labels: CMEMS.bulanan.label, datasets: [{ label: 'kW/m', data: CMEMS.bulanan.p.map(v => +(v * gel.inter.p / CMEMS.klimRata).toFixed(2)), backgroundColor: '#22d3eeaa' }] }, options: { plugins: { legend: { display: false } } } });
      note.textContent = 'Pola bulanan CMEMS (klimatologi tetap di data.js) diskalakan ke daya di titik ini. Detail IDW: ' + gel.inter.detail.map(d => d.nama + ' ' + d.persenBobot + '%').join(' • ');
    } else { jud.textContent = 'Gelombang manual'; note.textContent = 'Mode manual: tidak ada deret waktu.'; }
  }

  // ------------------------------------------------------------------ bobot MCDA (disinkronkan dengan halaman Peta)
  function initBobot() {
    g('ekSliders').innerHTML = E.KEY.map(k => '<div class="sld"><span>' + NAMA_KRI[k] + '</span><input type="range" min="0" max="100" id="ew_' + k + '"><b id="ev_' + k + '"></b></div>').join('') +
      '<div class="ek-actions" style="margin:4px 0 0"><button class="btn2" id="ekResetW" type="button">Reset bobot</button></div>';
    const sink = () => E.KEY.forEach(k => { g('ew_' + k).value = Math.round(W[k] * 100); g('ev_' + k).textContent = Math.round(W[k] * 100) + '%'; });
    E.KEY.forEach(k => g('ew_' + k).oninput = e => {
      const v = e.target.value / 100, sisa = 1 - v, lain = E.KEY.filter(x => x !== k), so = lain.reduce((a, x) => a + W[x], 0);
      lain.forEach(x => W[x] = so ? W[x] / so * sisa : sisa / 3); W[k] = v; sink(); simpanMCA(); rankCache = null; if (last) render();
    });
    g('ekResetW').onclick = () => { W = { ...DEF }; sink(); simpanMCA(); rankCache = null; if (last) render(); };
    g('ekMask').checked = EX;
    g('ekMask').onchange = e => {
      if (!e.target.checked && !ME) { e.target.checked = true; perlu(() => { g('ekMask').checked = false; EX = false; simpanMCA(); rankCache = null; last && render(); }, 'Mode Eksklusi OFF perlu login.'); return; }
      EX = e.target.checked; simpanMCA(); rankCache = null; if (last) render();
    };
    sink();
  }

  // ------------------------------------------------------------------ peringkat kandidat (data nyata)
  async function hitungRank() {
    await Promise.all([E.muat(ALL, BASE), E.muatRaster(BASE)]);
    bacaPerangkat();
    const baris = D.filter(l => E.dalamAreaAnalisisHabitat(l.latitude, l.longitude)).map(l => {
      const sp = E.analisisSpasial(l.latitude, l.longitude, { P, desa: DESA }), m = E.mcda(sp, l.kw, W, EX, P);
      return { l, sp, m, lama: fin(l), lamaS: l.s };
    }).sort((a, b) => b.m.fin - a.m.fin);
    if (!baris.length) throw new Error('Tidak ada kandidat di dalam batas area analisis.');
    rankCache = baris; g('ekRankCsv').classList.remove('hidden'); return baris;
  }
  async function tampilRank() {
    const b = await hitungRank(), tbl = g('ekRankTbl');
    tbl.innerHTML = '<table><thead><tr><th>#</th><th>Lokasi</th><th class="num" title="Daya gelombang rata-rata">kW/m</th><th class="num" title="Skor Daya (1-5)">Daya</th><th class="num" title="Skor Ekosistem (1-5)">Eko</th><th class="num" title="Skor Kedalaman (1-5)">Ked</th><th class="num" title="Skor Jarak (1-5)">Jar</th><th>Skor data nyata</th><th class="num">Skor tersimpan</th><th>Catatan</th></tr></thead><tbody>' +
      b.map((r, i) => '<tr><td><span class="rk">' + (i + 1) + '</span></td><td><a href="#" data-fly="' + r.l.latitude + ',' + r.l.longitude + '">' + esc(r.l.name) + '</a><div class="muted text-xs">' + esc(r.l.region) + '</div></td><td class="num">' + n2(r.l.kw, 1) + '</td>' +
        r.m.s.map(v => '<td class="num">' + n2(v, 1) + '</td>').join('') +
        '<td><div class="sb"><div class="bar"><i style="width:' + Math.min(100, r.m.fin / 5 * 100) + '%;background:' + r.m.kelas.c + '"></i></div><b>' + n2(r.m.fin) + '</b></div><span class="pill" style="background:' + r.m.kelas.c + '">' + r.m.kelas.n + '</span></td><td class="num">' + n2(r.lama) + '</td><td class="text-xs">' + (r.sp.ex.length ? esc(r.sp.ex.map(e => e.teks).join('; ')) : (r.sp.peringatan[0] ? esc(r.sp.peringatan[0]) : '')) + '</td></tr>').join('') + '</tbody></table>';
    tbl.querySelectorAll('[data-fly]').forEach(a => a.onclick = ev => { ev.preventDefault(); const [la, ln] = a.dataset.fly.split(',').map(Number); map.flyTo([la, ln], 11); setTitik(la, ln, true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    return b;
  }
  async function ujiRobust() {
    const b = rankCache || await hitungRank(), ok = b.filter(r => !(EX && r.m.ex)); if (!ok.length) { g('ekUjiHasil').textContent = 'Semua kandidat tereksklusi.'; return; }
    const top = (w) => ok.map(r => ({ r, v: E.KEY.reduce((a, k, i) => a + w[k] * r.m.s[i], 0) })).sort((a, c) => c.v - a.v)[0].r;
    const base = top(E.normBobot(W)); let n = 0, t = 0;
    E.KEY.forEach(k => [.1, -.1].forEach(dl => {
      const w = { ...W }; w[k] = Math.min(1, Math.max(0, W[k] + dl)); const so = E.KEY.filter(x => x !== k).reduce((a, x) => a + W[x], 0);
      E.KEY.forEach(x => { if (x !== k) w[x] = so ? W[x] / so * (1 - w[k]) : (1 - w[k]) / 3; }); t++; if (top(w).l.id === base.l.id) n++;
    }));
    g('ekUjiHasil').innerHTML = '<div class="box"><i class="bi bi-activity"></i><span>Peringkat 1 data nyata (<b>' + esc(base.l.name) + '</b>) bertahan di <b>' + n + '/' + t + '</b> skenario (bobot ±10 poin). ' + (n === t ? '<b>Robust</b> &mdash; hasilnya stabil.' : 'Peringkat berubah di sebagian skenario.') + '</span></div>';
  }

  // ------------------------------------------------------------------ zona grid
  async function hitungZona() {
    const btn = g('ekZona'), pr = g('ekProg'), bar = pr.firstElementChild; btn.disabled = true; pr.classList.remove('hidden'); bar.style.width = '0';
    try {
      bacaPerangkat(); await Promise.all([E.muat(ALL, BASE), E.muatRaster(BASE)]);
      const f = seasonFactor(g('ekMusim').value); P.dayaSkala = f;
      const cells = await E.zonaGrid({ step: 0.01, P, W, mask: EX, desa: DESA, latMaks: P.zonaLatMaks, kwFn: (la, ln) => interpolasiCMEMS(la, ln).p * f, onProgress: p => bar.style.width = Math.round(p * 100) + '%' });
      hapusZona();
      const grp = L.layerGroup();
      cells.forEach(c => {
        const gugur = EX && c.ex, h = c.step / 2;
        L.rectangle([[c.lat - h, c.lng - h], [c.lat + h, c.lng + h]], { stroke: false, fillColor: gugur ? '#9ca3af' : c.kelas.c, fillOpacity: gugur ? .45 : .7 })
          .bindPopup('<b>' + (gugur ? 'Tereksklusi' : c.kelas.n) + '</b> • skor ' + n2(c.fin) + '<br>Daya ' + n2(c.kw) + ' kW/m<br>Skor D/E/K/J: ' + c.s.map(v => n2(v, 1)).join(' / ') + (c.alasan.length ? '<br><small>' + esc(c.alasan.join('; ')) + '</small>' : '') + (c.luarCakupan ? '<br><small>Di luar cakupan data habitat; hasil perlu diverifikasi.</small>' : '') + '<br><a href="#" onclick="window.__ekPilih(' + c.lat + ',' + c.lng + ');return false">Hitung titik ini</a>').addTo(grp);
      });
      grp.addTo(map); zona = { grp, cells };
      const ok = cells.filter(c => !(EX && c.ex)), kl = {}; ok.forEach(c => kl[c.kelas.n] = (kl[c.kelas.n] || 0) + 1);
      const wn = {}; ok.forEach(c => wn[c.kelas.n] = c.kelas.c);
      g('ekZonaInfo').innerHTML = '<div class="box"><i class="bi bi-grid-3x3-gap"></i><span><b>' + cells.length.toLocaleString((window.ECOWAVE_LOC||'id-ID')) + '</b> sel dinilai, <b>' + (cells.length - ok.length) + '</b> tereksklusi (abu-abu di peta). Sebaran kelas:</span></div><div class="zn-leg" style="margin-top:8px">' + Object.entries(kl).map(([k, v]) => '<span><i style="background:' + wn[k] + '"></i>' + k + ' <b>' + v + '</b></span>').join('') + '</div>';
      const top = ok.sort((a, b) => b.fin - a.fin || b.kw - a.kw).slice(0, 10);
      g('ekZonaTbl').innerHTML = '<table><thead><tr><th>#</th><th>Koordinat</th><th class="num">kW/m</th><th class="num">Skor</th><th>Kelas</th></tr></thead><tbody>' + top.map((c, i) => '<tr><td><span class="rk">' + (i + 1) + '</span></td><td><a href="#" onclick="window.__ekPilih(' + c.lat + ',' + c.lng + ');return false">' + c.lat.toFixed(3) + ', ' + c.lng.toFixed(3) + '</a></td><td class="num">' + n2(c.kw, 1) + '</td><td><div class="sb"><div class="bar"><i style="width:' + Math.min(100, c.fin / 5 * 100) + '%;background:' + c.kelas.c + '"></i></div><b>' + n2(c.fin) + '</b></div></td><td><span class="pill" style="background:' + c.kelas.c + '">' + c.kelas.n + '</span></td></tr>').join('') + '</tbody></table>';
      g('ekZonaInfo').insertAdjacentHTML('beforeend', '<p class="ek-note" style="margin-top:10px">10 sel teratas ditampilkan; sel bersebelahan bisa memiliki skor sama. Klik koordinat untuk menghitung rinci.</p>');
      g('ekZonaHapus').classList.remove('hidden'); g('ekZonaGj').classList.remove('hidden');
    } catch (e) { g('ekZonaInfo').innerHTML = '<span style="color:#fecdd3">Gagal: ' + esc(e.message) + '</span>'; }
    finally { btn.disabled = false; setTimeout(() => pr.classList.add('hidden'), 600); }
  }
  function hapusZona() { if (zona) { map.removeLayer(zona.grp); zona = null; } g('ekZonaHapus').classList.add('hidden'); g('ekZonaGj').classList.add('hidden'); }
  window.__ekPilih = (la, ln) => { setTitik(la, ln, true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // ------------------------------------------------------------------ parameter lanjutan
  function initAdv() {
    const num = (id, label, val, step) => '<label>' + label + '<input type="number" id="' + id + '" step="' + (step || 0.1) + '" value="' + val + '"></label>';
    let h = '';
    [['mangrove', 'Mangrove'], ['karang', 'Karang'], ['reef', 'Reef extent'], ['lamun', 'Lamun'], ['konservasi', 'Konservasi'], ['pelayaran', 'Jalur pelayaran']].forEach(([k, l]) => h += num('ab_' + k, 'Buffer eksklusi ' + l + ' (km)', P.buf[k]));
    P.ekoBatas.forEach((v, i) => h += num('ae_' + i, 'Ambang Eko ' + (i + 1) + ' (km) → skor ' + (i + 1) + '/' + (i + 2), v));
    P.jarBatas.forEach((v, i) => h += num('aj_' + i, 'Ambang jaringan ' + (i + 1) + ' (km) → skor ' + (5 - i) + '/' + (4 - i), v));
    P.dayaBatas.forEach((v, i) => h += num('ad_' + i, 'Ambang daya ' + (i + 1) + ' (kW/m) → skor ' + (5 - i), v));
    [[1, '< −200 m'], [2, '−200…−100 m'], [3, '−100…−50 m'], [4, '−50…−20 m'], [5, '−20…−10 m'], [6, '−10…0 m']].forEach(([k, l]) => h += num('ak_' + k, 'Skor kedalaman ' + l, P.skorKedalaman[k], 1));
    h += num('az', 'Batas utara zona grid (lintang)', P.zonaLatMaks, 0.05);
    h += '<label>Skor Daya<select id="adm"><option value="relatif">Relatif (min–maks titik CMEMS)</option><option value="absolut">Absolut (ambang lama)</option></select></label>' + num('adr0', 'Rentang acuan Daya: min (kW/m)', P.dayaRef[0], 0.01) + num('adr1', 'Rentang acuan Daya: maks (kW/m)', P.dayaRef[1], 0.01);
    h += '<label>Sumber skor Jarak<select id="ajm"><option value="grid">Gardu & jalur listrik</option><option value="desa">Desa terdekat</option><option value="rata">Rata-rata keduanya</option></select></label>' +
         '<label>Perairan 5 km<select id="ap5"><option value="0">Hanya peringatan</option><option value="1">Wajib (di luar = gugur)</option></select></label>';
    g('ekAdv').innerHTML = h; g('adm').value = P.dayaMode; g('ajm').value = P.jarMode; g('ap5').value = P.wajibPerairan5km ? '1' : '0';
    g('ekAdv').oninput = g('ekAdv').onchange = () => {
      const v = id => { const x = parseFloat(g(id).value); return isFinite(x) ? x : 0; };
      ['mangrove', 'karang', 'reef', 'lamun', 'konservasi', 'pelayaran'].forEach(k => P.buf[k] = Math.max(0, v('ab_' + k)));
      P.ekoBatas = [0, 1, 2, 3].map(i => v('ae_' + i)); P.jarBatas = [0, 1, 2, 3].map(i => v('aj_' + i)); P.dayaBatas = [0, 1, 2, 3].map(i => v('ad_' + i));
      [1, 2, 3, 4, 5, 6].forEach(k => P.skorKedalaman[k] = Math.min(5, Math.max(1, v('ak_' + k))));
      P.zonaLatMaks = Math.min(-6, Math.max(-8, v('az'))); P.dayaMode = g('adm').value; P.dayaRef = [v('adr0'), v('adr1')]; { const ac = E.rentangDayaAcuan(CMEMS.titik); P.dayaRefManual = Math.abs(P.dayaRef[0] - ac[0]) > 0.005 || Math.abs(P.dayaRef[1] - ac[1]) > 0.005; } P.jarMode = g('ajm').value; P.wajibPerairan5km = g('ap5').value === '1'; simpanP(); rankCache = null;
      if (last) { last.sp = E.analisisSpasial(last.titik.lat, last.titik.lng, { P, desa: DESA }); render(); }
    };
  }

  // ------------------------------------------------------------------ ekspor (celah Q6)
  function unduh(nama, isi, tipe) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([isi], { type: tipe })); a.download = nama; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
  const metaParam = () => ({ dibuat: new Date().toISOString(), bobot: E.normBobot(W), eksklusi: EX, musim: g('ekMusim').value, param: P, catatan: 'Penapisan awal; skor/buffer/ambang adalah asumsi. Data karang/lamun hanya mencakup sebagian pesisir.' });
  function eksporZona() { if (!zona) return; unduh('ecowave_zona.geojson', JSON.stringify(E.zonaKeGeoJSON(zona.cells, metaParam())), 'application/geo+json'); }
  function eksporRank() { const b = rankCache; if (!b) return; unduh('ecowave_peringkat_kandidat.csv', '\ufeff' + E.keCSV(['peringkat', 'nama', 'wilayah', 'lat', 'lng', 'kw_per_m', 's_daya', 's_eko', 's_ked', 's_jar', 'skor_data_nyata', 'kelas', 'tereksklusi', 'skor_tersimpan', 'peringatan'],
    b.map((r, i) => [i + 1, r.l.name, r.l.region, r.l.latitude, r.l.longitude, r.l.kw, ...r.m.s.map(v => +v.toFixed(2)), +r.m.fin.toFixed(3), r.m.kelas.n, r.m.ex ? 1 : 0, +r.lama.toFixed(3), r.sp.peringatan.join(' | ')])), 'text/csv'); }
  // ------------------------------------------------------------------ CSV
  function unduhCsv() {
    if (!last) return; const { sp, gel, en, m } = last, r = [['parameter', 'nilai'],
      ['lat', last.titik.lat], ['lng', last.titik.lng], ['sumber_gelombang', gel.label], ['Hs_m', gel.hs.toFixed(3)], ['Te_s', gel.te.toFixed(3)], ['daya_kW_per_m', gel.kw.toFixed(3)],
      ['lebar_m', P.lebar], ['efisiensi', P.efisiensi], ['faktor_kapasitas', P.cf], ['unit', P.unit], ['daya_listrik_kW', en.pKw.toFixed(2)], ['energi_kWh_tahun', Math.round(en.kwhTahun)],
      ['rumah_450VA_puncak', en.rumah[450].puncak], ['rumah_900VA_puncak', en.rumah[900].puncak], ['rumah_1300VA_puncak', en.rumah[1300].puncak],
      ['skor_daya', m.s[0]], ['skor_eko', m.s[1]], ['skor_kedalaman', m.s[2]], ['skor_jarak', m.s[3]], ['bobot_daya', m.w.daya.toFixed(3)], ['bobot_eko', m.w.eko.toFixed(3)], ['bobot_ked', m.w.ked.toFixed(3)], ['bobot_jar', m.w.jar.toFixed(3)],
      ['skor_sebelum_eksklusi', m.raw.toFixed(3)], ['skor_akhir', m.fin.toFixed(3)], ['kelas', m.kelas.n], ['eksklusi', sp.ex.map(e => e.teks).join(' | ')]];
    Object.entries(sp.jarak).forEach(([k, v]) => r.push(['jarak_km_' + k, v.toFixed(3)]));
    const csv = r.map(x => x.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = 'ecowave_' + last.titik.lat.toFixed(3) + '_' + last.titik.lng.toFixed(3) + '.csv'; a.click();
  }

  // ------------------------------------------------------------------ inisialisasi
  function bindSumber() {
    const tampil = () => { const s = document.querySelector('input[name=ekSumber]:checked').value; g('pCmems').classList.toggle('hidden', s !== 'cmems'); g('pBmkg').classList.toggle('hidden', s !== 'bmkg'); g('pManual').classList.toggle('hidden', s !== 'manual');
      if (s === 'bmkg' && !bmRaw) muatBMKG(); };
    g('ekSumber').addEventListener('change', tampil);
    g('ekPerairan').onchange = () => { g('ekKodeWrap').classList.toggle('hidden', g('ekPerairan').value !== 'custom'); bmRaw = null; if (g('ekPerairan').value !== 'custom') muatBMKG(); };
    g('ekKode').onchange = () => { bmRaw = null; muatBMKG(); };
    g('ekMuatBmkg').onclick = () => { bmRaw = null; muatBMKG(); };
  }
  async function init() {
    initPeta(); initBobot(); initAdv(); bindSumber();
    g('ekHitung').onclick = hitung;
    g('ekPakai').onclick = () => { const la = parseFloat(g('ekLat').value), ln = parseFloat(g('ekLng').value); if (!isFinite(la) || !isFinite(ln)) { pesan('Isi latitude dan longitude dengan angka.'); return; } setTitik(la, ln, false); map.flyTo([la, ln], Math.max(map.getZoom(), 10)); hitung(); };
    g('ekReset').onclick = () => { P = clone(E.PARAM_DEFAULT); simpanP(); ['ekLebar', 'ekEf', 'ekCf', 'ekUnit'].forEach((id, i) => g(id).value = [P.lebar, P.efisiensi * 100, P.cf * 100, P.unit][i]); initAdv(); rankCache = null; if (last) { last.sp = E.analisisSpasial(last.titik.lat, last.titik.lng, { P, desa: DESA }); render(); } };
    ['ekLebar', 'ekEf', 'ekCf', 'ekUnit'].forEach(id => g(id).onchange = () => { bacaPerangkat(); if (last) render(); });
    ['ekMusim', 'ekStat', 'ekTeB', 'ekHs', 'ekTeM'].forEach(id => g(id).onchange = () => { if (id === 'ekTeB') SINKRON.tulis({ teBmkg: +g('ekTeB').value }); if (id === 'ekMusim') { SA = g('ekMusim').value; simpanMCA(); } if (last) hitung(); });
    g('ekRank').onclick = () => tampilRank().catch(e => g('ekUjiHasil').textContent = 'Gagal: ' + e.message);
    g('ekUji').onclick = () => ujiRobust().catch(e => g('ekUjiHasil').textContent = 'Gagal: ' + e.message);
    g('ekZonaGj').onclick = eksporZona; g('ekRankCsv').onclick = eksporRank; g('ekZona').onclick = hitungZona; g('ekZonaHapus').onclick = hapusZona; g('ekCsv').onclick = unduhCsv;
    window.ECOWAVE_EKSPOR.pasang({ png: g('ekPng'), pdf: g('ekPdf'), ambil: () => last && last.m ? { halaman: 'kalkulator', lat: last.titik.lat, lng: last.titik.lng, musim: last.gel.musim || 'thn', gel: last.gel, pTahunan: last.gel.inter ? last.gel.inter.p : null, sp: last.sp, m: last.m, en: last.en, P, EX, map } : null });
    const isiCm = () => { g('ekCm').innerHTML = '<option value="">- pilih -</option>' + CMEMS.titik.map((t, i) => '<option value="' + i + '">' + esc(t.nama) + '</option>').join(''); };
    isiCm(); onRef(isiCm);
    g('ekCm').onchange = e => { if (e.target.value === '') return; const t = CMEMS.titik[+e.target.value]; map.flyTo([t.lat, t.lng], 9); setTitik(t.lat, t.lng, true); };
    // Te awal BMKG mengikuti IDW CMEMS di tengah area studi (dapat diubah pengguna)
    try { g('ekTeB').value = n2(interpolasiCMEMS(-7.1, 105.9).te, 1).replace(',', '.'); } catch (e) {}
    await muatData();                                    // kandidat dari database (atau data demo)
    g('ekKand').innerHTML = '<option value="">- pilih -</option>' + D.map(l => '<option value="' + l.id + '">' + esc(l.name) + ' (' + esc(l.region) + ')</option>').join('');
    g('ekKand').onchange = e => { const l = D.find(x => String(x.id) === e.target.value); if (!l) return; map.flyTo([l.latitude, l.longitude], 10); setTitik(l.latitude, l.longitude, true); };
    g('ekMask').checked = EX; initBobot(); gambarKandidat();
    g('ekMusim').value = SA in { thn: 1, djf: 1, mam: 1, jja: 1, son: 1 } ? SA : 'thn';
    const teS = SINKRON.baca().teBmkg; if (teS > 0) g('ekTeB').value = teS;
    const q = new URLSearchParams(location.search), la = parseFloat(q.get('lat')), ln = parseFloat(q.get('lng'));
    if (isFinite(la) && isFinite(ln)) { setTitik(la, ln, false); map.setView([la, ln], 10); hitung(); }
  }
  window.onSinkron = () => { try { g('ekMask').checked = EX; initBobot(); gambarKandidat(); rankCache = null; if (last) render(); } catch (e) {} };
  document.addEventListener('DOMContentLoaded', () => { init().catch(e => { console.error(e); pesan('Gagal memulai kalkulator: ' + esc(e.message)); }); });
})();
