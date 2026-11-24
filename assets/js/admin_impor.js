// ECO-WAVE - UI impor titik gelombang (admin.php). Parser ada di impor_data.js; penyimpanan lewat api/referensi.php (admin + CSRF).
(() => {
 const $ = id => document.getElementById(id); if (!$('imPeriksa')) return;
 const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 const f = (v, d = 2) => v == null ? '–' : Number(v).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d });
 let csrf = '', hasil = null;
 fetch('api/auth.php?aksi=me').then(r => r.json()).then(j => { csrf = j.csrf || ''; }).catch(() => {});

 // nomor P berikutnya = angka P terbesar yang sudah ada + 1 (dibaca dari data acuan yang sedang aktif)
 function nomorBerikut() {
  let m = -1; (typeof CMEMS !== 'undefined' ? CMEMS.titik : []).forEach(t => { const x = /^\s*P(\d+)/i.exec(t.nama || ''); if (x) m = Math.max(m, +x[1]); });
  return m + 1;
 }
 const setMulai = () => { $('imMulai').value = nomorBerikut(); };
 (typeof onRef === 'function') ? onRef(setMulai) : setMulai();

 const baca = file => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => no(new Error('Gagal membaca berkas.')); r.readAsText(file); });
 const tampil = (html, kelas) => { $('imHasil').innerHTML = html; $('imHasil').style.color = kelas === 'bad' ? '#dc2626' : kelas === 'ok' ? '#16a34a' : ''; };

 $('imPeriksa').onclick = async () => {
  hasil = null; $('imSimpan').disabled = true;
  try {
   const file = $('imFile').files[0]; let teks = $('imTeks').value.trim(), nama = 'tempel.txt';
   if (file) { if (file.size > 25 * 1024 * 1024) throw new Error('Berkas lebih dari 25 MB. Ringkas dulu dengan scripts/nc_ke_titik.py.'); nama = file.name; if (/\.nc$/i.test(nama)) throw new Error('Berkas .nc tidak bisa dibaca browser. Ubah dulu ke CSV dengan scripts/nc_ke_titik.py (lihat "Format yang dikenali").'); teks = await baca(file); }
   if (!teks) throw new Error('Pilih berkas atau tempel isi CSV/JSON dulu.');
   const faktor = parseFloat($('imFaktor').value); if (!(faktor >= .5 && faktor <= 1)) throw new Error('Faktor Te/Tp harus antara 0,5 dan 1.');
   const r = ImporData.parse(teks, nama, { sumber: $('imSumber').value, faktorTe: faktor, mulai: Math.max(0, parseInt($('imMulai').value, 10) || 0) });
   hasil = r;
   const bad = new Set(); r.galat.forEach(g => { const m = /^#(\d+)/.exec(g); if (m) bad.add(+m[1] - 1); });
   const tabel = '<div style="overflow:auto;max-height:320px"><table><thead><tr><th>#</th><th>Nama</th><th>Lat</th><th>Lng</th><th>P kW/m</th><th>Hs</th><th>Te</th><th>Median</th><th>P90</th><th>Maks</th><th>CV</th><th>Status</th></tr></thead><tbody>' +
    r.baris.slice(0, 200).map((b, i) => '<tr' + (bad.has(i) ? ' style="color:#dc2626"' : '') + '><td>' + (i + 1) + '</td><td>' + esc(b.nama) + '</td><td>' + f(b.lat, 3) + '</td><td>' + f(b.lng, 3) + '</td><td>' + f(b.p) + '</td><td>' + f(b.hs) + '</td><td>' + f(b.te) + '</td><td>' + f(b.med) + '</td><td>' + f(b.p90) + '</td><td>' + f(b.maks) + '</td><td>' + f(b.cv) + '</td><td>' + (b.masalah.length ? esc(b.masalah.join(', ')) : 'siap') + '</td></tr>').join('') + '</tbody></table></div>';
   let kepala = '<b>' + esc(r.format) + '</b>: ' + r.baris.length + ' titik terbaca.';
   if (r.peringatan.length) kepala += '<ul style="margin:6px 0 0 18px;color:#b45309">' + r.peringatan.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
   if (r.galat.length) { kepala += '<p style="color:#dc2626;margin:6px 0"><b>' + r.galat.length + ' masalah.</b> Perbaiki berkasnya; tidak ada yang bisa disimpan sebelum semuanya valid.</p>'; tampil(kepala + tabel, 'bad'); }
   else { $('imSimpan').disabled = false; tampil(kepala + tabel + '<p style="margin:6px 0">Pratinjau di atas sudah benar? Tekan <b>2. Simpan ke database</b>.</p>'); }
  } catch (e) { tampil('<b>Tidak bisa dibaca:</b> ' + esc(e.message), 'bad'); }
 };

 $('imSimpan').onclick = async () => {
  if (!hasil || hasil.galat.length) return;
  $('imSimpan').disabled = true; tampil('Menyimpan…');
  try {
   const rows = hasil.baris.map(({ masalah, n, ...b }) => b);
   const r = await fetch('api/referensi.php', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ jenis: 'titik', aksi: 'impor', rows, timpa: $('imTimpa').checked }) });
   const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Gagal menyimpan.');
   let m = j.ditambah + ' titik ditambahkan, ' + j.diperbarui + ' diperbarui, ' + j.dilewati + ' dilewati (nama sudah ada; centang "Timpa" untuk memperbarui).';
   if (j.sumber_disimpan === false) m += ' Kolom sumber belum ada di database: jalankan database_referensi_v18.sql agar asal data (CMEMS/ERA5) tersimpan.';
   tampil('<b>Selesai.</b> ' + esc(m) + ' Tabel "Titik CMEMS" di bawah sudah diperbarui; Peta dan Kalkulator memuat titik baru saat halamannya dibuka/dimuat ulang.', 'ok');
   hasil = null; if (window.__refMuat) window.__refMuat(); try { SINKRON.tulis({ refVer: Date.now() }); } catch (e) {}
  } catch (e) { tampil('<b>Gagal:</b> ' + esc(e.message), 'bad'); $('imSimpan').disabled = false; }
 };
})();
