// map-klik.js - FULL
// Syarat: di index lu udah ada variabel global `map` dari Leaflet
// Contoh: var map = L.map('map').setView([-7.05, 106.2], 8);
// Dan di index lu udah ada elemen dengan id="hasilKlik" (opsional, kalo gak ada ya gak error)

let markerKlik = null;
let klikTerakhir = null;

map.on('click', async function(e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  if (lat < -8 || lat > -6 || lng < 104.5 || lng > 107) {
    alert('Klik di dalam area studi ya: Banten Selatan (Lat -8 s/d -6, Lng 104.5 s/d 107)');
    return;
  }

  if (markerKlik) map.removeLayer(markerKlik);
  markerKlik = L.marker([lat, lng]).addTo(map);
  markerKlik.bindPopup("⏳ Lagi ambil data gelombang...").openPopup();

  const box = document.getElementById('hasilKlik');
  if (box) { box.style.display = 'block'; box.innerHTML = '⏳ Lagi ambil data gelombang...'; }

  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wave_period&forecast_days=1`;
    const res = await fetch(url);
    const j = await res.json();
    const hs = j.hourly.wave_height[12];
    const tp = j.hourly.wave_period[12];
    const te = 0.9 * tp;
    const kw = (0.49 * hs * hs * te);

    // Rumus SAMA PERSIS kayak di api/locations.php
    let s0 = kw >= 20 ? 5 : kw >= 15 ? 4 : kw >= 10 ? 3 : kw >= 5 ? 2 : 1;
    let s1 = hs > 3 ? 2 : hs > 2.5 ? 3 : 4;
    let s2 = 4, s3 = 3;
    let fin = (s0*0.40 + s1*0.30 + s2*0.15 + s3*0.15);
    let persen = ((fin/5)*100).toFixed(1);
    let status = fin >= 4 ? 'SANGAT LAYAK ✅' : fin >= 3 ? 'LAYAK 👍' : fin >= 2 ? 'KURANG LAYAK ⚠️' : 'TIDAK LAYAK ❌';
    let cls = fin >= 3 ? 'layak' : fin >= 2 ? 'kurang' : 'tidak';

    klikTerakhir = { latitude: lat, longitude: lng, hs, tp };

    const html = `
      <b>📍 Titik Baru</b><br>
      Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}<br><hr>
      🌊 Hs: <b>${hs} m</b> | ⏱️ Tp: <b>${tp} detik</b><br>
      ⚡ Daya: <b>${kw.toFixed(2)} kW/m</b><br>
      Skor: [${s0}, ${s1}, ${s2}, ${s3}]<br>
      <b>Kelayakan: ${persen}% - ${status}</b><br><br>
      <input id="namaKlik" placeholder="Nama lokasi, misal: Ujung Genteng" style="width:100%;padding:8px;box-sizing:border-box">
      <select id="regionKlik" style="width:100%;padding:8px;margin-top:5px;box-sizing:border-box">
        <option>Lebak</option><option>Pandeglang</option><option>Sukabumi</option><option>Cianjur</option><option>Garut</option>
      </select>
      <button onclick="simpanKlik()" style="width:100%;margin-top:6px;padding:10px;background:#0ea5e9;color:#fff;border:none;border-radius:6px;font-weight:bold;cursor:pointer">+ Simpan Lokasi Ini</button>
    `;

    if (box) {
      box.innerHTML = `<h3>📍 Hasil Klik Peta</h3>${html}`;
    }
    markerKlik.bindPopup(html).openPopup();
  } catch(err) {
    markerKlik.bindPopup("❌ Gagal ambil data, coba klik di laut.").openPopup();
    if (box) box.innerHTML = '❌ Gagal, coba klik di laut.';
  }
});

async function simpanKlik() {
  const nama = document.getElementById('namaKlik').value.trim();
  const region = document.getElementById('regionKlik').value;
  if (!nama) { alert('Isi nama lokasi dulu!'); return; }
  if (!klikTerakhir) return;

  const res = await fetch('api/locations.php', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      aksi: 'from_click',
      name: nama,
      region: region,
      latitude: klikTerakhir.latitude,
      longitude: klikTerakhir.longitude,
      hs: klikTerakhir.hs,
      tp: klikTerakhir.tp
    })
  });
  const j = await res.json();
  if (j.ok) {
    alert(`✅ Tersimpan! ${nama}\nDaya ${j.kw} kW/m | Kelayakan ${j.kelayakan}`);
    location.reload();
  } else {
    alert('❌ Gagal: ' + (j.error || 'cek login admin'));
  }
}