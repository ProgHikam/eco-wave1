<?php
require_once __DIR__.'/config/auth.php';
wajib_admin();
$page='admin'; $title='ECO-WAVE - Kelola Data'; $libs=[]; $js=['data','impor_data','admin','admin_impor'];
include __DIR__.'/includes/head.php';
?><?php if(is_admin()): ?>
<div class="kl-wrap">
<header class="kl-head">
  <div class="kl-judul"><span class="kl-kicker">Panel admin</span><h1>Kelola Data</h1></div>
  <div class="kl-sisi"><p>Atur pengguna, impor data gelombang dan layer, serta data acuan yang dipakai Peta dan Kalkulator. Catatan audit tim ada di <a href="celah.php" style="color:var(--tan)">Celah &amp; Kekurangan</a>.</p>
    <nav class="kl-chip" aria-label="Lompat ke bagian"><a href="#kelola-user">Pengguna</a><a href="#impor-layer">Layer</a><a href="#impor-titik">Data gelombang</a><a href="#impor-lokasi">Lokasi</a><a href="#refAdmin">Data acuan</a></nav></div>
</header>
<div class="kl-grid">

<?php if (is_admin() && isset($_GET['impor'])): $okI = $_GET['impor'] === 'ok'; ?>
<div class="card" role="status" style="margin:16px 0;border-left:4px solid <?= $okI ? '#617891' : '#632024' ?>"><b><?= $okI ? 'Impor berhasil' : 'Impor gagal' ?></b><br><?= htmlspecialchars((string)($_GET['msg'] ?? '')) ?></div>
<?php endif; ?>
<div class="card" style="margin:16px 0" id="kelola-user">
  <b>Tambah User Baru</b>
  <form method="post" action="config/auth.php" style="display:grid;gap:8px;margin-top:10px;max-width:480px">
    <?= csrf_field() ?>
    <input type="hidden" name="aksi" value="buat_user">
    <input name="name" placeholder="Nama lengkap" required>
    <input name="username" placeholder="Username (contoh: budi)" required>
    <input name="email" type="email" placeholder="Email (opsional)">
    <input name="password" type="password" placeholder="Password" required>
    <select name="role">
      <option value="user">User - Cuma Lihat</option>
      <option value="admin">Admin - Kendali Penuh</option>
    </select>
    <button type="submit" class="btn">+ Tambah User</button>
  </form>
  <div style="margin-top:16px;overflow:auto">
    <table>
      <tr><th>Nama</th><th>Username</th><th>Role</th><th>Aksi</th></tr>
      <?php foreach(list_users() as $usr): ?>
      <tr>
        <td><?= htmlspecialchars($usr['name']) ?></td>
        <td><?= htmlspecialchars($usr['username']) ?></td>
        <td><?= htmlspecialchars($usr['role']) ?></td>
        <td style="display:flex;gap:6px">
          <form method="post" action="config/auth.php" style="display:flex;gap:4px">
            <?= csrf_field() ?><input type="hidden" name="aksi" value="ubah_role"><input type="hidden" name="id" value="<?= $usr['id'] ?>">
            <select name="role"><option value="user" <?= $usr['role']==='user'?'selected':'' ?>>User</option><option value="admin" <?= $usr['role']==='admin'?'selected':'' ?>>Admin</option></select>
            <button class="btn2">Ubah Role</button>
          </form>
          <form method="post" action="config/auth.php" onsubmit="return confirm('Hapus user <?= htmlspecialchars($usr['username']) ?>?')">
            <?= csrf_field() ?><input type="hidden" name="aksi" value="hapus_user"><input type="hidden" name="id" value="<?= $usr['id'] ?>">
            <button class="btn2">Hapus</button>
          </form>
        </td>
      </tr>
      <?php endforeach; ?>
    </table>
  </div>
</div>
<div class="card" style="margin:16px 0" id="impor-layer">
  <b>Impor Layer GeoJSON (poligon, garis, titik)</b>
  <p style="opacity:.75;font-size:13px;margin:6px 0 10px">Layer baru langsung muncul di Peta, panel Layer, bagian &ldquo;Layer buatan admin&rdquo;. Koordinat harus WGS84 (EPSG:4326), urutan [bujur, lintang]. Maks. 8 MB.</p>
  <form method="post" action="api/impor_json.php" enctype="multipart/form-data" style="display:grid;gap:8px;max-width:520px">
    <?= csrf_field() ?><input type="hidden" name="aksi" value="impor_layer">
    <input name="label" placeholder="Nama layer (contoh: Zona nelayan)" required minlength="2" maxlength="60">
    <input name="sumber" placeholder="Sumber data (opsional)" maxlength="160">
    <label style="font-size:13px">Warna <input type="color" name="warna" value="#617891"></label>
    <input type="file" name="berkas" accept=".json,.geojson" required>
    <button class="btn" type="submit">+ Tambah layer</button>
  </form>
</div>

<div class="card" style="margin:16px 0" id="impor-titik">
  <b>Impor Data Gelombang (CMEMS, ERA5, dan lainnya)</b>
  <p style="opacity:.75;font-size:13px;margin:6px 0 10px">Unggah berkas <b>CSV</b>, <b>JSON</b>, atau <b>GeoJSON (Point)</b> berisi titik gelombang. Berkas dibaca di browser, diperiksa, lalu Anda lihat pratinjaunya sebelum disimpan ke database sebagai titik acuan. Titik baru langsung ikut interpolasi IDW di Peta dan Kalkulator.</p>
  <div class="kl-impor-grid">
    <label style="font-size:13px">Berkas<br><input type="file" id="imFile" accept=".csv,.json,.geojson,.txt,.tsv,.nc"></label>
    <label style="font-size:13px">Sumber data<br><select id="imSumber"><option>CMEMS</option><option>ERA5</option><option>BMKG</option><option>Windy</option><option>Pengukuran</option><option selected>Lainnya</option></select></label>
    <label style="font-size:13px">Te = faktor × Tp<br><input id="imFaktor" type="number" step="0.01" min="0.5" max="1" value="0.9" title="Dipakai hanya bila data hanya punya periode puncak (Tp)"></label>
    <label style="font-size:13px">Nama otomatis mulai dari P<br><input id="imMulai" type="number" min="0" max="999" value="4"></label>
  </div>
  <label style="font-size:13px;display:block;margin-top:8px">atau tempel isi CSV/JSON di sini<br><textarea id="imTeks" rows="4" style="width:100%;font-family:monospace;font-size:12px" placeholder="nama,lat,lng,hs,te&#10;P4 Cikeusik,-7.4,105.5,1.9,11.2"></textarea></label>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;align-items:center">
    <button class="btn2" type="button" id="imPeriksa">1. Periksa berkas</button>
    <label style="font-size:13px"><input type="checkbox" id="imTimpa"> Timpa titik yang namanya sama</label>
    <button class="btn" type="button" id="imSimpan" disabled>2. Simpan ke database</button>
  </div>
  <div id="imHasil" style="margin-top:10px;font-size:13px" aria-live="polite"></div>
  <details style="margin-top:10px;font-size:13px"><summary>Format yang dikenali</summary>
    <ul style="margin:6px 0 0 18px;line-height:1.6">
      <li><b>Ringkas</b>: satu baris per titik. Wajib: <code>lat</code>, <code>lng</code>, <code>hs</code>, <code>te</code> (atau <code>tp</code>); <code>p</code> boleh kosong (dihitung 0,49·Hs²·Te). Opsional: <code>nama</code>, <code>med</code>, <code>p90</code>, <code>maks</code>, <code>cv</code>. Nama kolom ERA5/CMEMS (<code>swh</code>, <code>VHM0</code>, <code>VTM10</code>, <code>pp1d</code>, <code>latitude</code>, <code>longitude</code>) dikenali.</li>
      <li><b>Deret waktu</b>: ada kolom <code>time</code>; tiap lokasi dirata-ratakan dan median, P90 (nilai yang dilampaui 90% waktu), maks, CV dihitung otomatis.</li>
      <li><b>NetCDF (.nc)</b> tidak bisa dibaca browser. Ubah dulu dengan <code>python scripts/nc_ke_titik.py berkas.nc --titik "-7.4,105.5" --sumber ERA5 --keluar titik.csv</code>, lalu unggah CSV-nya.</li>
      <li>Area studi: lintang −8,5…−5,5 dan bujur 104…108. Hanya titik di dalamnya yang diterima.</li>
    </ul>
    <p style="margin:8px 0 0;opacity:.8"><b>Catatan metode:</b> IDW mencampur semua titik acuan. Titik dari produk berbeda (mis. CMEMS dan ERA5) punya resolusi, periode, dan definisi periode gelombang yang berbeda, jadi hasilnya sebaiknya dibandingkan hati-hati. Kolom sumber dicatat agar jelas asalnya.</p>
  </details>
</div>

<div class="card" style="margin:16px 0" id="impor-lokasi">
  <b>Impor Lokasi Kandidat (JSON)</b>
  <p style="opacity:.75;font-size:13px;margin:6px 0 10px">Daftar lokasi kandidat ke tabel <code>locations</code>. Format: <code>[{"name":"Bayah 2","region":"Lebak","latitude":-6.95,"longitude":106.2,"kw":21.5,"s":[3,5,5,4],"ex":0}]</code> (s = skor daya, ekosistem, kedalaman, jarak; 1&ndash;5).</p>
  <form method="post" action="api/impor_json.php" enctype="multipart/form-data" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <?= csrf_field() ?><input type="hidden" name="aksi" value="impor_lokasi">
    <input type="file" name="berkas" accept=".json" required>
    <button class="btn" type="submit">+ Tambah lokasi</button>
  </form>
</div>

<?php
$regFile = __DIR__.'/assets/data/pltgl/layer_pengguna.json';
$layerUser = is_file($regFile) ? (json_decode((string)file_get_contents($regFile), true) ?: []) : [];
?>
<?php if ($layerUser): ?>
<div class="card" style="margin:16px 0" id="daftar-layer">
  <b>Layer buatan admin</b>
  <div style="overflow:auto;margin-top:8px"><table>
    <tr><th>Nama</th><th>Fitur</th><th>Geometri</th><th>Sumber</th><th>Oleh / tanggal</th><th></th></tr>
    <?php foreach ($layerUser as $ly): ?>
    <tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:<?= htmlspecialchars($ly['warna'] ?? '#617891') ?>"></span> <?= htmlspecialchars($ly['label'] ?? '') ?></td>
      <td><?= (int)($ly['fitur'] ?? 0) ?></td><td><?= htmlspecialchars($ly['geom'] ?? '') ?></td><td><?= htmlspecialchars($ly['sumber'] ?? '') ?></td>
      <td><?= htmlspecialchars(($ly['oleh'] ?? '-').' / '.($ly['tanggal'] ?? '')) ?></td>
      <td><form method="post" action="api/impor_json.php" onsubmit="return confirm('Hapus layer ini?')"><?= csrf_field() ?><input type="hidden" name="aksi" value="hapus_layer"><input type="hidden" name="id" value="<?= htmlspecialchars($ly['id'] ?? '') ?>"><button class="btn2">Hapus</button></form></td></tr>
    <?php endforeach; ?>
  </table></div>
</div>
<?php endif; ?>
<div class="card" style="margin:16px 0" id="refAdmin">
  <b>Data Acuan (CRUD)</b>
  <p style="opacity:.75;font-size:13px;margin:6px 0 12px">Titik CMEMS (P0, P1, ...), desa acuan, dan bobot MCA. Perubahan langsung dipakai Peta, Kalkulator, dan Hasil. Titik CMEMS menentukan daya, Hs, dan Te lewat interpolasi IDW (minimal 1 titik; untuk mengganti semua, tambah titik baru dulu lalu hapus yang lama). Pola bulanan/musiman memakai klimatologi tetap di data.js.</p>
  <div id="refMsg" style="min-height:20px;font-size:13px"></div>

  <h4 style="margin:14px 0 6px">Titik CMEMS</h4>
  <div style="overflow:auto"><table id="tTitik"><thead><tr><th>Nama</th><th>Sumber</th><th>Lat</th><th>Lng</th><th>P (kW/m)</th><th>Median</th><th>P90</th><th>Maks</th><th>CV</th><th>Hs</th><th>Te</th><th>Daya relatif %</th><th>Aksi</th></tr></thead><tbody></tbody></table></div>
  <form id="fTitik" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-top:8px">
    <input type="hidden" name="id"><input name="nama" placeholder="Nama (P4 ...)" required><select name="sumber" title="Sumber data"><option>CMEMS</option><option>ERA5</option><option>BMKG</option><option>Windy</option><option>Pengukuran</option><option selected>Lainnya</option></select>
    <input name="lat" placeholder="Lat" required><input name="lng" placeholder="Lng" required>
    <input name="p" placeholder="P kW/m" required><input name="med" placeholder="Median (boleh kosong)"><input name="p90" placeholder="P90 (boleh kosong)">
    <input name="maks" placeholder="Maks (boleh kosong)"><input name="cv" placeholder="CV (boleh kosong)"><input name="hs" placeholder="Hs m" required>
    <input name="te" placeholder="Te s" required><input name="persen" placeholder="Daya relatif % (kosong = otomatis)">
    <button class="btn" type="submit">Simpan titik</button><button class="btn2" type="button" data-reset>Baru</button>
  </form>

  <h4 style="margin:18px 0 6px">Desa acuan</h4>
  <div style="overflow:auto"><table id="tDesa"><thead><tr><th>Nama</th><th>Kecamatan</th><th>Lat</th><th>Lng</th><th>Penduduk</th><th>Aksi</th></tr></thead><tbody></tbody></table></div>
  <form id="fDesa" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin-top:8px">
    <input type="hidden" name="id"><input name="nama" placeholder="Nama desa" required><input name="kec" placeholder="Kecamatan, Kabupaten" required>
    <input name="lat" placeholder="Lat" required><input name="lng" placeholder="Lng" required><input name="penduduk" placeholder="Penduduk" required>
    <button class="btn" type="submit">Simpan desa</button><button class="btn2" type="button" data-reset>Baru</button>
  </form>

  <h4 style="margin:18px 0 6px">Bobot MCA (total harus 1,00)</h4>
  <form id="fBobot" style="display:flex;gap:8px;flex-wrap:wrap;align-items:end"></form>
</div>
</div>
</div>
<?php endif; ?>
<?php include __DIR__.'/includes/foot.php'; ?>
