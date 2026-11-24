/* ECO-WAVE - panel "BMKG Maritim" di halaman Peta.
   Sumber : https://maritim.bmkg.go.id/marine2026-data/perairan/<KODE>.json  (lewat proxy api/bmkg.php, cache 30 menit)
   Sifat  : prakiraan 4 hari (jam-jaman hari ke-1, 3-jaman hari ke-2 s/d 4). BUKAN klimatologi dan TIDAK memuat periode
            gelombang, sehingga panel ini hanya informasi pendamping dan tidak ikut dalam skor MCA / daya (kW/m).
   Aditif : hanya menambah panel dan satu pendengar klik; tidak mengubah logika peta.js / ecowave.js. */
(function () {
  'use strict';
  var $ = function (i) { return document.getElementById(i); };
  var panel = $('bmkgPanel'); if (!panel || typeof map === 'undefined') return;

  // Kode diverifikasi langsung dari berkas BMKG (field "name"): P.I.04, P.I.05, P.I.06 (Stamar Merak).
  // M.09 dan M.19 dipakai pada Kalkulator (Samudra Hindia selatan Jawa Barat; Laut Jawa bagian barat).
  // lat/lng = titik acuan kasar untuk menyarankan zona terdekat dari titik klik (BUKAN batas resmi BMKG).
  var ZONA = [
    { kode: 'P.I.04', nama: 'Selat Sunda Barat Pandeglang', lat: -6.60, lng: 105.70 },
    { kode: 'P.I.05', nama: 'Perairan Selatan Pandeglang',  lat: -6.95, lng: 105.60 },
    { kode: 'P.I.06', nama: 'Perairan Selatan Lebak',       lat: -7.05, lng: 106.15 },
    { kode: 'M.09',   nama: 'Samudra Hindia selatan Jawa Barat', lat: -7.60, lng: 106.60 }
  ];
  var KODE_OK = /^[MP](\.[A-Z]{1,2})?\.[0-9]{2}$/;
  var sel = $('bmkgZona'), stat = $('bmkgStat'), isi = $('bmkgIsi'), grafik = null, cache = {};

  sel.innerHTML = ZONA.map(function (z) { return '<option value="' + z.kode + '">' + z.nama + ' (' + z.kode + ')</option>'; }).join('');

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var n1 = function (x) { return Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { minimumFractionDigits: 1, maximumFractionDigits: 1 }); };
  var n2 = function (x) { return Number(x).toLocaleString((window.ECOWAVE_LOC||'id-ID'), { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var KNOT = 0.514444; // data BMKG: angin dan arus dalam knot (lihat dokumentasi API BMKG)

  function jarak2(la, ln, z) { var dx = (ln - z.lng) * Math.cos(la * Math.PI / 180), dy = la - z.lat; return dx * dx + dy * dy; }
  function zonaTerdekat(lat, lng) {
    var b = ZONA[0], d = Infinity;
    ZONA.slice(0, 3).forEach(function (z) { var x = jarak2(lat, lng, z); if (x < d) { d = x; b = z; } });
    return b;
  }
  // "2026-11-13 00:00 UTC" -> Date (UTC)
  function waktu(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(s || ''); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])) : null; }
  function wib(d) { return d ? d.toLocaleString((window.ECOWAVE_LOC||'id-ID'), { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'; }

  async function ambil(kode) {
    if (cache[kode]) return cache[kode];
    var j, via = '';
    try {
      var r = await fetch('api/bmkg.php?code=' + encodeURIComponent(kode)); j = await r.json();
      if (!r.ok || !j.forecast_day1) throw new Error(j.error || 'respon tidak valid');
      via = j.stale ? 'cache lama (BMKG tidak terjangkau)' : j.cache ? 'cache server' : 'server';
    } catch (e1) { throw new Error(e1.message || 'gagal memuat'); }
    j._via = via; cache[kode] = j; return j;
  }

  function seri(j) {
    return (j.forecast_day1 || []).concat(j['forecast_day2-4'] || []).map(function (x) {
      return { t: waktu(x.time), hs: +x.wave_height, kat: x.wave_cat, cuaca: x.weather, angin: +x.wind_speed, hembus: +x.wind_gust, dari: x.wind_from, arus: +x.current_speed, ke: x.current_to, suhu: x.temp_avg };
    }).filter(function (x) { return x.t && isFinite(x.hs); });
  }

  function render(j) {
    var s = seri(j); if (!s.length) { isi.innerHTML = '<p class="text-xs">Deret prakiraan kosong.</p>'; return; }
    var now = Date.now(), k = 0, best = Infinity;
    s.forEach(function (x, i) { var d = Math.abs(x.t - now); if (d < best) { best = d; k = i; } });
    var cur = s[k], hs = s.map(function (x) { return x.hs; });
    var rata = hs.reduce(function (a, b) { return a + b; }, 0) / hs.length, maks = Math.max.apply(null, hs), min = Math.min.apply(null, hs);
    var arusRata = s.reduce(function (a, x) { return a + x.arus; }, 0) / s.length;
    var h = '<table class="w-full text-xs"><tbody>' +
      '<tr><td>Zona</td><td><b>' + esc(j.name) + '</b> (' + esc(j.code) + ')</td></tr>' +
      '<tr><td>Stasiun</td><td>' + esc(j.nama_stasiun || '-') + '</td></tr>' +
      '<tr><td>Terbit</td><td>' + esc(j.issued) + '</td></tr>' +
      '<tr><td>Berlaku</td><td>' + esc(j.valid_from) + ' s/d ' + esc(j.valid_to) + '</td></tr>' +
      '<tr><td>Langkah terdekat</td><td>' + wib(cur.t) + ' WIB</td></tr>' +
      '<tr><td>Hs saat ini</td><td><b>' + n1(cur.hs) + ' m</b> (' + esc(cur.kat) + ')</td></tr>' +
      '<tr><td>Hs rata-rata / min / maks</td><td><b>' + n2(rata) + '</b> / ' + n1(min) + ' / ' + n1(maks) + ' m</td></tr>' +
      '<tr><td>Angin</td><td>dari ' + esc(cur.dari) + ' ' + cur.angin + ' kt (hembusan ' + cur.hembus + ' kt &asymp; ' + n1(cur.hembus * KNOT) + ' m/s)</td></tr>' +
      '<tr><td>Arus permukaan</td><td>ke ' + esc(cur.ke) + ' ' + n2(cur.arus) + ' kt (rata-rata ' + n2(arusRata) + ' kt)</td></tr>' +
      '<tr><td>Cuaca</td><td>' + esc(cur.cuaca) + ', ' + cur.suhu + '&deg;C</td></tr></tbody></table>' +
      '<canvas id="bmkgChart" height="130" style="margin-top:8px"></canvas>' +
      '<p class="text-xs mt-2" style="opacity:.75">Sumber: BMKG Maritim (' + esc(j._via) + '). Prakiraan jangka pendek, bukan klimatologi ERA5/CMEMS. ' +
      'JSON BMKG tidak memuat periode gelombang, jadi daya (kW/m) tidak dihitung dari sini dan skor MCA tidak berubah.</p>';
    isi.innerHTML = h;
    if (grafik) { grafik.destroy(); grafik = null; }
    if (typeof Chart !== 'undefined') {
      grafik = new Chart($('bmkgChart'), { type: 'line',
        data: { labels: s.map(function (x) { return wib(x.t); }), datasets: [{ label: 'Hs (m)', data: hs, borderColor: '#38bdf8', backgroundColor: '#38bdf822', fill: true, tension: .3, pointRadius: 0 }] },
        options: { plugins: { legend: { display: false }, title: { display: true, text: 'Tinggi gelombang prakiraan (WIB)' } }, scales: { x: { ticks: { maxTicksLimit: 6 } }, y: { beginAtZero: true } } } });
    }
  }

  async function muat() {
    var kode = sel.value;
    if (!KODE_OK.test(kode)) { stat.textContent = 'Kode tidak valid.'; return; }
    stat.textContent = 'Memuat prakiraan BMKG ' + kode + '…'; isi.innerHTML = '';
    try { var j = await ambil(kode); stat.textContent = 'Diperbarui ' + new Date().toLocaleTimeString((window.ECOWAVE_LOC||'id-ID'), { hour: '2-digit', minute: '2-digit' }); render(j); }
    catch (e) { stat.textContent = 'Gagal'; isi.innerHTML = '<p class="text-xs">Gagal memuat BMKG (' + esc(e.message) + '). Periksa koneksi server atau coba lagi.</p>'; }
  }

  $('bmkgMuat').onclick = muat;
  sel.onchange = muat;

  // klik peta: sarankan zona terdekat; muat otomatis hanya bila tab BMKG sedang dibuka
  map.on('click', function (e) {
    var z = zonaTerdekat(e.latlng.lat, e.latlng.lng);
    if (sel.value !== z.kode) sel.value = z.kode;
    $('bmkgHint').textContent = 'Zona terdekat dari titik klik (perkiraan): ' + z.nama + '.';
    if (panel.classList.contains('on')) muat();
  });

  // muat pertama kali saat tab dibuka
  var dermaga = document.querySelector('#hudDock button[data-tab="bmkg"]'), sudah = false;
  if (dermaga) dermaga.addEventListener('click', function () { if (!sudah) { sudah = true; muat(); } });
})();
