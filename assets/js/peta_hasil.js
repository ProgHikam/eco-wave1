// ECO-WAVE - kartu hasil klik peta: ringkasan 4 angka + tab per topik (data lengkap, satu topik per layar).
// peta.js memanggil window.petaHasilHTML(o) lalu menaruh hasilnya di #hasilKlik.
(function () {
  'use strict';
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var n2 = function (x, d) { d = d == null ? 2 : d; return Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var baris = function (rows) { return '<table class="kh-tbl"><tbody>' + rows.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>'; };

  window.petaHasilHTML = function (o) {
    var m = o.m, kls = o.kls, sp = o.sp, est = o.est, P = o.P, eb = o.eb, W = o.W, KEY = o.KEY, NAMA = o.NAMA, EX = o.EX, inter = o.inter;
    var rm = est.rumah, desa = sp.desa, gugur = m.ex && EX, J = o.J, kd = o.kd, kand = o.kand;
    var kelasTxt = gugur ? 'Eksklusi' : kls.n;

    // catatan data (digabung, tanpa duplikat)
    var catatan = (sp.peringatan || []).slice();
    if (sp.luarCakupan && !catatan.some(function (x) { return /cakupan/i.test(x); })) catatan.push('Di luar cakupan data karang/lamun: skor Ekosistem bisa terlalu tinggi.');

    var banner = sp.ex.length
      ? '<div class="kh-ban ' + (EX ? 'bad' : 'warn') + '"><b>' + (EX ? 'Eksklusi' : 'Terkena eksklusi (mask OFF)') + ':</b> ' + sp.ex.map(function (x) { return esc(x.teks); }).join('; ') + '</div>' : '';

    var kpi = '<div class="kh-kpi">' +
      '<div><span>Skor akhir</span><b style="color:' + kls.c + '">' + n2(m.fin) + '<small style="display:inline;font-size:12px;color:#9fb0bf"> /5</small></b><small>' + esc(kelasTxt) + '</small></div>' +
      '<div><span>Daya gelombang</span><b>' + n2(o.kw) + ' <small style="display:inline;font-size:12px">kW/m</small></b><small>Hs ' + n2(o.hs) + ' m · Te ' + n2(o.te) + ' s</small></div>' +
      '<div><span>Listrik</span><b>' + n2(est.pKw, 1) + ' <small style="display:inline;font-size:12px">kW</small></b><small>≈ ' + rm[450].puncak + ' rumah (450 VA)</small></div>' +
      '<div><span>Status</span><b style="font-size:15px;color:' + (gugur ? '#fca5a5' : '#86efac') + '">' + (sp.ex.length ? (EX ? 'Tereksklusi' : 'Eksklusi (OFF)') : 'Lolos eksklusi') + '</b><small>' + (catatan.length ? catatan.length + ' catatan data' : 'tanpa catatan data') + '</small></div></div>';

    // --- tab Skor
    var total = KEY.reduce(function (a, k, i) { return a + W[k] * m.s[i]; }, 0);
    var skor = '<table class="kh-tbl"><thead><tr><th>Kriteria</th><th>Skor</th><th>Bobot</th><th>Kontribusi</th></tr></thead><tbody>' +
      KEY.map(function (k, i) { var s = m.s[i], w = W[k];
        return '<tr><td>' + NAMA[k] + '</td><td><span class="kh-meter"><i style="width:' + (s * 20) + '%;background:hsl(' + (s * 24) + ',70%,50%)"></i></span>' + n2(s, 1) + '/5</td><td>' + Math.round(w * 100) + '%</td><td>' + n2(w * s) + '</td></tr>'; }).join('') +
      '</tbody><tfoot><tr><td colspan="3">Total tertimbang</td><td>' + n2(total) + '</td></tr><tr><td colspan="3"><b>Skor akhir' + (gugur ? ' (gugur oleh eksklusi)' : '') + '</b></td><td><b style="color:' + kls.c + '">' + n2(m.fin) + ' · ' + esc(kls.n) + '</b></td></tr></tfoot></table>' +
      '<p class="kh-note">Skor Ekosistem dibalik: jauh dari ekosistem = 5. Eksklusi ' + (EX ? 'ON' : 'OFF') + '. Bobot sama dengan Kalkulator &amp; Beranda.</p>';

    // --- tab Gelombang
    var gel = baris([['Tinggi gelombang signifikan (Hs)', n2(o.hs) + ' m'], ['Periode energi (Te)', n2(o.te) + ' s'], ['Daya gelombang (P)', '<b>' + n2(o.kw) + ' kW/m</b>'], ['Musim', esc(o.musim)]]) +
      '<table class="kh-tbl"><thead><tr><th>Titik CMEMS (IDW)</th><th>Jarak</th><th>Bobot</th></tr></thead><tbody>' +
      inter.detail.map(function (d) { return '<tr><td>' + esc(d.nama) + '</td><td>' + n2(d.jarak, 1) + ' km</td><td>' + d.persenBobot + '%</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="kh-note">P = 0,49 · Hs² · Te. Nilai diinterpolasi dari ' + inter.detail.length + ' titik CMEMS 2015–2024 (makin dekat, bobot makin besar).</p>';

    // --- tab Bulanan
    var mx = Math.max.apply(null, eb.bulan.map(function (b) { return b.pKw; })),
        hi = eb.bulan.reduce(function (a, b) { return b.pKw > a.pKw ? b : a; }), lo = eb.bulan.reduce(function (a, b) { return b.pKw < a.pKw ? b : a; });
    var bul = '<div class="kh-bar" role="img" aria-label="Listrik per bulan (kW)">' + eb.bulan.map(function (b) {
        return '<i class="' + (b === hi ? 'tinggi' : b === lo ? 'rendah' : '') + '" style="height:' + Math.max(8, b.pKw / mx * 100) + '%" title="' + b.nama + ': ' + n2(b.p) + ' kW/m → ' + n2(b.pKw, 1) + ' kW"><em>' + b.nama.slice(0, 3) + '</em></i>'; }).join('') + '</div>' +
      '<p class="kh-note" style="margin-top:0">Tertinggi <b>' + hi.nama + '</b> (' + n2(hi.p) + ' kW/m → ' + n2(hi.pKw, 1) + ' kW) · terendah <b>' + lo.nama + '</b> (' + n2(lo.p) + ' kW/m → ' + n2(lo.pKw, 1) + ' kW)</p>' +
      '<table class="kh-tbl"><thead><tr><th>Musim</th><th>kW/m</th><th>Listrik</th><th>Rumah 450 VA*</th></tr></thead><tbody>' +
      eb.musim.map(function (s) { return '<tr><td>' + s.nama + '</td><td>' + n2(s.p) + '</td><td>' + n2(s.pKw, 1) + ' kW</td><td>' + s.rumah450 + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="kh-note">Pola klimatologi CMEMS 2015–2024 diskalakan ke daya rata-rata titik ini (rasio ' + n2(eb.rasio) + ' = ' + n2(inter.p) + ' ÷ ' + n2(o.klim) + ' kW/m). Variasi antartahun ±' + n2(eb.tahunan.min) + '–' + n2(eb.tahunan.maks) + ' kW/m. Pola musiman dianggap sama di seluruh area. *Daya listrik ÷ VA.</p>';

    // --- tab Listrik
    var lis = baris([['Rumus', n2(o.kw) + ' kW/m × ' + P.lebar + ' m × ' + Math.round(P.efisiensi * 100) + '%'], ['Daya listrik', '<b>' + n2(est.pKw, 1) + ' kW</b>'], ['Energi per tahun', '<b>' + Math.round(est.kwhTahun).toLocaleString((window.ECOWAVE_LOC||'id-ID')) + ' kWh</b>'], ['Perangkat', P.unit + ' unit']]) +
      '<table class="kh-tbl"><thead><tr><th>Golongan</th><th>Sesaat*</th><th>Tahunan*</th></tr></thead><tbody>' +
      [450, 900, 1300].map(function (v) { return '<tr><td>' + v + ' VA</td><td>' + rm[v].puncak + ' rumah</td><td>' + rm[v].tahunan + ' rumah</td></tr>'; }).join('') + '</tbody></table>' +
      '<p class="kh-note">*Sesaat = daya listrik rata-rata ÷ VA (bukan beban puncak). Tahunan = energi per tahun ÷ konsumsi bulanan rumah. Parameter perangkat diatur di Kalkulator.</p>';

    // --- tab Lokasi
    var lok = baris([
      ['Mangrove', J('mangrove')], ['Terumbu karang', J('karang')], ['Lamun', J('lamun')], ['Kawasan konservasi', J('konservasi')],
      ['Gardu listrik', J('gardu')], ['Jalur listrik', J('jalur_listrik')], ['Jalur pelayaran', J('jalur_pelayaran')],
      ['Kedalaman', kd ? (kd.z != null ? n2(kd.z, 0) + ' m · ' : '') + esc(kd.rentang) : 'di luar data'],
      ['Desa terdekat', desa ? '<b>' + esc(desa.nama) + '</b> · ' + n2(desa.d) + ' km' : '-'],
      ['Kandidat terdekat', kand ? esc(kand.l.name) + ' · ' + n2(kand.d, 1) + ' km · skor ' + n2(fin(kand.l)) : '-']]) +
      '<p class="kh-note">Angka = jarak ke fitur terdekat dari data PLTGL nyata; "di dalam" berarti titik berada di dalam poligonnya.</p>';

    // --- tab Live (dimuat saat dibuka)
    var live = '<div class="kh-live" data-lat="' + o.lat + '" data-lng="' + o.lng + '">Membuka tab ini memuat prakiraan gelombang live untuk titik ini.</div>';

    var tabs = [['skor', 'Skor', skor], ['gelombang', 'Gelombang', gel], ['bulanan', 'Bulanan', bul], ['listrik', 'Listrik & rumah', lis], ['lokasi', 'Ekosistem & infrastruktur', lok], ['live', 'Live', live]];

    return '<div class="klik-hasil">' +
      '<div class="kh-head"><div><b>Titik analisis</b><small>' + o.lat.toFixed(4) + ', ' + o.lng.toFixed(4) + '</small></div><span class="pill" style="background:' + kls.c + '">' + esc(kelasTxt) + ' · ' + n2(m.fin) + '/5</span></div>' +
      banner + kpi +
      '<div class="kh-tabs" role="tablist">' + tabs.map(function (t, i) { return '<button type="button" class="kh-tab' + (i ? '' : ' on') + '" role="tab" data-kh="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      tabs.map(function (t, i) { return '<div class="kh-pane' + (i ? '' : ' on') + '" data-kh="' + t[0] + '">' + t[2] + '</div>'; }).join('') +
      (catatan.length ? '<details class="kh-cat"><summary>⚠ Catatan data (' + catatan.length + ')</summary>' + catatan.map(function (x) { return '<div class="cp-warn">' + x + '</div>'; }).join('') + '</details>' : '') +
      '<div class="kh-aksi">' + (gugur ? '' : '<div class="kh-simpan"><input id="namaKlik" placeholder="Nama lokasi, mis. Ujung Genteng"><select id="regionKlik"><option>Lebak</option><option>Pandeglang</option><option>Sukabumi</option></select><button type="button" onclick="simpanKlikKeForm()">+ Simpan lokasi</button></div>') +
      '<a class="kh-link" href="kalkulator.php?lat=' + o.lat.toFixed(4) + '&lng=' + o.lng.toFixed(4) + '">Buka di Kalkulator →</a></div></div>';
  };

  // pindah tab
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.kh-tab'); if (!t) return;
    var root = t.closest('.klik-hasil'), k = t.getAttribute('data-kh');
    root.querySelectorAll('.kh-tab').forEach(function (x) { x.classList.toggle('on', x === t); });
    root.querySelectorAll('.kh-pane').forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-kh') === k); });
    if (k === 'live') muatLive(root.querySelector('.kh-live'));
  });

  async function muatLive(el) {
    if (!el || el.dataset.ok) return; el.dataset.ok = '1'; el.textContent = 'Memuat prakiraan…';
    try {
      var ref = (typeof cur !== 'undefined' && cur) || (typeof D !== 'undefined' && D[0]) || { id: 0, kw: 20 };
      var v = await windy(+el.dataset.lat, +el.dataset.lng, ref);
      if (!v || v.sim || !v.now) { el.textContent = 'Prakiraan live tidak tersedia (Windy/Open-Meteo tidak terjangkau).'; el.dataset.ok = ''; return; }
      var s = v.series || [], step = Math.max(1, Math.floor(s.length / 24)), pts = s.filter(function (_, i) { return i % step === 0; }), mx = Math.max.apply(null, pts.map(function (x) { return x.p; }).concat([1]));
      el.innerHTML = baris([['Hs sekarang', n2(v.now.hs) + ' m'], ['Tp sekarang', n2(v.now.tp, 1) + ' s'], ['Arah', Math.round(v.now.dir) + '°'], ['Daya sekarang', '<b>' + n2(v.now.p, 1) + ' kW/m</b>']]) +
        '<div class="kh-bar" role="img" aria-label="Prakiraan daya">' + pts.map(function (x) { return '<i style="height:' + Math.max(8, x.p / mx * 100) + '%" title="' + new Date(x.t).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { weekday: 'short', hour: '2-digit' }) + ': ' + n2(x.p, 1) + ' kW/m"></i>'; }).join('') + '</div>' +
        '<p class="kh-note" style="margin-top:14px">Prakiraan daya ±3 hari (' + (v.trial ? 'DATA UJI Windy' : v.src === 'open-meteo' ? 'GFS Wave via Open-Meteo' : 'Windy') + '). Prakiraan jangka pendek, bukan klimatologi dan bukan pengukuran.</p>';
    } catch (err) { el.textContent = 'Gagal memuat: ' + err.message; el.dataset.ok = ''; }
  }
})();
