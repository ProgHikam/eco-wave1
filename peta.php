<?php $page='peta'; $title='ECO-WAVE - Peta Analisis'; $libs=['leaflet','chart','html2canvas']; $js=['data','windy','lokasi_form','peta_gaya','ecowave','ecowave_data','ekspor','peta_hasil','peta','peta_hud','pltgl_peta','bmkg_peta','deeplink']; include __DIR__.'/includes/head.php'; ?>
<link rel="stylesheet" href="assets/css/peta-hud.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-hud.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/bg-video.css?v=<?= @filemtime(__DIR__.'/assets/css/bg-video.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/peta-lega.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-lega.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/peta-gaya.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-gaya.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/peta-rapi.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-rapi.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/peta-bersih.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-bersih.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/peta-simpel.css?v=<?= @filemtime(__DIR__.'/assets/css/peta-simpel.css') ?: 1 ?>">
<section id="peta" class="hud">
  <!-- PETA FULLSCREEN (latar) -->
  <div class="hud-map"><div id="map"></div></div>
  <div class="hud-vignette"></div><div class="hud-scan"></div>

  <!-- HEADER TENGAH -->
  <header class="hud-top">
    <div class="hud-title"><b>Peta Analisis</b><i>PLTGL &middot; Banten Selatan</i></div>
    <div class="hud-top-r"><span>CMEMS 2015-2024</span></div>
  </header>

  <!-- PANEL KIRI -->
  <aside class="hud-panel hud-left" id="hudLeft">
    <div class="hud-box">
      <div class="hud-h"><i class="bi bi-search"></i> Pencarian Lokasi</div>
      <input id="cari" list="kota" placeholder="Cari lokasi">
      <datalist id="kota"><option>Bayah<option>Panimbang<option>Binuangeun<option>Sawarna<option>Ujung Kulon</datalist>
      <div class="hud-chips">
        <button class="hud-btn" onclick="tambahManual()"><i class="bi bi-plus-lg"></i> Tambah Manual</button>
        <button class="hud-btn" onclick="tambahDariCMEMS()"><i class="bi bi-database-add"></i> Dari CMEMS</button>
      </div>
    </div>

    <div class="hud-box hud-grow">
      <div class="hud-h" id="hudTabTitle"><i class="bi bi-layers"></i> Map / Layer</div>
      <div class="hud-scroll">
        <div class="tabpanel on" data-group="peta" data-panel="layer">
        <div class="card"><b>Layer</b><div class="layer-grid"><label><input type="checkbox" id="lPow" checked> Daya</label><label><input type="checkbox" id="lScore" checked> Skor</label></div><p class="text-xs mt-2 opacity-70">Musim:</p><div class="flex flex-wrap gap-1 mt-1" id="musim"></div></div>
        <div id="legenda" hidden></div>
        <div class="card"><b>Area studi</b>
          <label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer;margin-top:8px"><input type="checkbox" id="studyBoundary" checked><i style="width:13px;height:0;border-top:2px dashed #617891;display:inline-block"></i><span>Kotak batas area studi</span></label>
          <details id="studyBoundDetails" style="margin-top:8px"><summary style="cursor:pointer;font-size:12px">Atur kotak area studi manual</summary>
            <p class="text-xs mt-1 opacity-70">Ubah koordinat kotak biru. Titik dan zona di luar kotak ini tidak dihitung; cakupan maksimal tetap lintang −8…−6 dan bujur 104,5…107.</p>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px">
              <label style="font-size:11px">Lintang selatan<input id="studyBoundSouth" type="number" step="0.01" min="-8" max="-6" style="display:block;width:100%"></label>
              <label style="font-size:11px">Bujur barat<input id="studyBoundWest" type="number" step="0.01" min="104.5" max="107" style="display:block;width:100%"></label>
              <label style="font-size:11px">Lintang utara<input id="studyBoundNorth" type="number" step="0.01" min="-8" max="-6" style="display:block;width:100%"></label>
              <label style="font-size:11px">Bujur timur<input id="studyBoundEast" type="number" step="0.01" min="104.5" max="107" style="display:block;width:100%"></label>
            </div>
            <div class="flex gap-2 mt-2"><button id="studyBoundApply" type="button" class="btn2 !py-1 text-xs">Terapkan</button><button id="studyBoundReset" type="button" class="btn2 !py-1 text-xs">Kembali ke batas awal</button></div>
            <p id="studyBoundStatus" class="text-xs mt-1 opacity-70" aria-live="polite"></p>
          </details>
        </div>
        <div class="card"><b>Data PLTGL (ECO-WAVE)</b> <span class="text-xs opacity-70">data nyata</span><div id="ecoLayers" style="display:grid;gap:6px;margin-top:8px"></div><label style="display:flex;align-items:center;gap:6px;font-size:12.5px;cursor:pointer;margin-top:6px"><input type="checkbox" id="ecoBoundary" checked><i style="width:13px;height:0;border-top:2px dashed #D5B893;display:inline-block"></i><span>Batas cakupan data karang/lamun</span></label>
          <details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px">Atur posisi/lebar garis manual</summary><p class="text-xs mt-1 opacity-70">Koordinat desimal. Garis kuning menjadi batas area analisis. Area di luar data habitat asli tetap diberi peringatan.</p>
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px">
              <label style="font-size:11px">Lintang selatan<input id="ecoBoundSouth" type="number" step="0.01" min="-8" max="-6" style="display:block;width:100%"></label>
              <label style="font-size:11px">Bujur barat<input id="ecoBoundWest" type="number" step="0.01" min="104.5" max="107" style="display:block;width:100%"></label>
              <label style="font-size:11px">Lintang utara<input id="ecoBoundNorth" type="number" step="0.01" min="-8" max="-6" style="display:block;width:100%"></label>
              <label style="font-size:11px">Bujur timur<input id="ecoBoundEast" type="number" step="0.01" min="104.5" max="107" style="display:block;width:100%"></label>
            </div>
            <div class="flex gap-2 mt-2"><button id="ecoBoundaryApply" type="button" class="btn2 !py-1 text-xs" disabled>Terapkan</button><button id="ecoBoundaryReset" type="button" class="btn2 !py-1 text-xs" disabled>Kembali ke batas asli</button></div>
            <p id="ecoBoundaryStatus" class="text-xs mt-1 opacity-70" aria-live="polite"></p>
          </details>
          <details style="margin-top:8px"><summary style="cursor:pointer;font-size:12px">Layer tambahan ArcGIS</summary><p class="text-xs mt-1 opacity-70">Ekspor ArcGIS untuk wilayah studi Banten. Centang untuk melihat; layer ini hanya visualisasi dan tidak mengubah skor analisis.</p><div id="asikLayers" style="display:grid;gap:6px;margin-top:8px"></div></details>
          <div class="flex flex-wrap gap-2 mt-3"><button id="ecoZona" type="button" class="btn2 !py-1 text-sm">Zona ECO-WAVE</button><a href="kalkulator.php" class="btn !py-1 text-sm">Kalkulator</a></div><p id="ecoZonaInfo" class="text-xs mt-2 opacity-70"></p></div>
      </div>
      <div class="tabpanel" data-group="peta" data-panel="mca"><div class="card"><b>Panel MCA</b> <span class="text-xs opacity-70">(total 100%)</span><div id="sliders" class="space-y-2 mt-2 text-sm"></div><p class="text-xs mt-2 p-2 rounded bg-amber-50">Skor Eko dibalik: jauh = <b>5</b>, dekat = <b>1</b>.</p><div class="mca-aksi"><button id="reset" class="btn2 !py-1 text-sm">Reset</button><button id="uji" class="btn !py-1 text-sm">Uji ±10%</button></div><label class="block mt-2 text-sm"><input type="checkbox" id="mask" checked> Eksklusi ON</label><p id="ujiHasil" class="text-sm mt-2"></p></div>
        <div class="card"><b>Skor Sensitivitas</b><div class="table-wrap"><table class="w-full text-xs"><thead><tr><th>Jarak</th><th>Sensitif</th><th>Skor</th></tr></thead><tbody><tr><td>Eksklusi</td><td style="color:#632024;font-weight:bold">Sangat Tinggi</td><td>EXCLUDED</td></tr><tr><td>0 - 0.5 km</td><td>Sangat Tinggi</td><td>1</td></tr><tr><td>0.5 - 1 km</td><td>Tinggi</td><td>2</td></tr><tr><td>1 - 2 km</td><td>Sedang</td><td>3</td></tr><tr><td>2 - 5 km</td><td>Rendah</td><td>4</td></tr><tr><td>&gt; 5 km</td><td>Sangat Rendah</td><td>5</td></tr></tbody></table></div><p class="text-xs mt-2 opacity-70">Final = (Daya×0.40)+(Eko×0.30)+(Kedalaman×0.15)+(Jarak×0.15) × Mask.</p></div>
      </div>
      <div class="tabpanel" data-group="peta" data-panel="windy"><div class="card"><div class="flex justify-between items-center gap-2"><b>Windy Live</b><span id="wStat" class="chip on">memuat…</span></div><div id="wWarn" class="wwarn hidden"></div><div class="table-wrap windy-tbl"><table class="w-full text-sm"><thead><tr><th>#</th><th>Lokasi</th><th>Hs</th><th>Tp</th><th>kW/m</th></tr></thead><tbody id="wTbl"></tbody></table></div><p class="text-xs mt-2 opacity-70">gfsWave, <b>bukan</b> CMEMS. <span id="wNote"></span></p></div><div class="card mt-4"><b>Windy Map</b><button id="wBtn" class="btn !py-1 text-sm mt-2">Tampilkan peta Windy</button><div id="wFrame" class="mt-3 hidden"><iframe id="wIf" title="Windy" class="w-full rounded-lg" style="height:320px;border:0" loading="lazy"></iframe></div></div></div>
      <div class="tabpanel" data-group="peta" data-panel="bmkg" id="bmkgPanel"><div class="card"><div class="flex justify-between items-center gap-2"><b>BMKG Maritim</b><span id="bmkgStat" class="chip on">belum dimuat</span></div>
        <select id="bmkgZona" class="w-full mt-2" aria-label="Perairan BMKG"></select>
        <div class="flex gap-2 mt-2"><button id="bmkgMuat" type="button" class="btn2 !py-1 text-sm">Muat ulang</button></div>
        <p id="bmkgHint" class="text-xs mt-2" style="opacity:.75">Klik peta untuk menyarankan zona perairan terdekat.</p>
        <div id="bmkgIsi" class="table-wrap mt-2"></div></div></div>
      <div class="tabpanel" data-group="peta" data-panel="asumsi"><div class="card"><b>Asumsi Listrik</b><div class="table-wrap"><table class="w-full text-xs"><tbody><tr><td>Lebar tangkap</td><td><b>10 m</b></td></tr><tr><td>Efisiensi</td><td><b>30%</b></td></tr><tr><td>450 VA</td><td><b>113,5 kWh / bln</b></td></tr><tr><td>900 VA</td><td><b>164,6 kWh / bln</b></td></tr><tr><td>1300 VA</td><td><b>229,9 kWh / bln</b></td></tr><tr><td>Faktor kapasitas</td><td><b>15%</b></td></tr></tbody></table></div><p class="text-xs mt-2 opacity-70">P0: 25,57 x 10 x 30% = 76,7 kW → 170 / 85 / 59 rumah.</p></div></div>

      </div>
    </div>
  </aside>

  <!-- PANEL KANAN -->
  <aside class="hud-panel hud-right" id="hudRight">
    <div class="hud-box">
      <div class="hud-h"><i class="bi bi-geo-alt"></i> Titik Terpilih</div>
      <div class="hud-gauge-wrap">
        <div class="hud-gauge" id="hudGauge" style="--p:80">
          <svg viewBox="0 0 120 120"><circle class="g-bg" cx="60" cy="60" r="50"/><circle class="g-fg" id="hudArc" cx="60" cy="60" r="50" pathLength="100"/><circle class="g-in" cx="60" cy="60" r="38"/></svg>
          <div class="g-txt"><b id="hudPct">80%</b><span id="hudPctLbl">Final Score</span></div>
        </div>
        <div class="hud-big"><b id="hudKw">25,57</b> <small>kW/m</small><div id="hudKwLbl">Daya Gelombang - Titik P0 / Terbaik</div></div>
      </div>
      <div class="hud-stats">
        <div><span>Hs / Te</span><b id="hudHsTe">CMEMS 2015-2024</b></div>
      </div>
      <div class="hud-cards3">
        <div><b id="hudS0">-</b><span>Daya</span></div>
        <div><b id="hudS1">-</b><span>Eko</span></div>
        <div><b id="hudS3">-</b><span>Jarak</span></div>
      </div>
    </div>

    <details class="kh-grafik"><summary><i class="bi bi-graph-up"></i> Grafik kandidat (tren &amp; perbandingan)</summary>
    <div class="hud-box">
      <div class="hud-h"><i class="bi bi-graph-up"></i> Daya Gelombang - Trend</div>
      <canvas id="cLine" height="120"></canvas>
    </div>
    <div class="hud-box">
      <div class="hud-h"><i class="bi bi-bar-chart"></i> Perbandingan</div>
      <canvas id="cBar" height="110"></canvas>
      <canvas id="cWin" height="110"></canvas>
    </div>
    </details>
  </aside>

  <!-- INFO / HASIL KLIK (melayang di bawah-tengah) -->
  <div class="hud-info" id="hudInfo">
    <button class="hud-info-x" type="button" onclick="document.getElementById('hudInfo').classList.remove('open')" aria-label="Tutup">&times;</button>
    <div id="insight" class="hud-insight"></div>
    <details class="hud-det"><summary><i class="bi bi-info-circle"></i> Cara membaca hasil klik peta</summary>
      Klik titik di peta: interpolasi IDW dari titik CMEMS menghasilkan Hs, Te, dan P (CMEMS 2015-2024); kemudian dihitung <b>kW listrik, jumlah rumah 450 / 900 / 1300 VA, dan energi per tahun</b>, jarak ke desa terdekat, dan <b>Final Score</b>.
      <br><span class="hud-mut">Asumsi: lebar tangkap 10 m, efisiensi 30%, faktor kapasitas 15%. 450 VA = 113,5 kWh/bln, 900 VA = 164,6 kWh/bln, 1300 VA = 229,9 kWh/bln.</span>
    </details>
    <div id="hasilKlik" class="hidden"></div>
    <div id="bandingkan" class="hidden"></div>
  </div>

  <!-- DOCK BAWAH (ikon tab) -->
  <nav class="hud-dock" id="hudDock">
    <button class="on" data-tab="layer" title="Map / Layer" aria-label="Map / Layer"><i class="bi bi-layers"></i><span>Map / Layer</span></button>
    <button data-tab="mca" title="Bobot MCA" aria-label="Bobot MCA"><i class="bi bi-sliders"></i><span>Bobot MCA</span></button>
    <button data-tab="windy" title="Windy Live" aria-label="Windy Live"><i class="bi bi-wind"></i><span>Windy Live</span></button>
    <button data-tab="bmkg" title="BMKG Maritim" aria-label="BMKG Maritim"><i class="bi bi-broadcast"></i><span>BMKG Maritim</span></button>
    <button data-tab="asumsi" title="Asumsi" aria-label="Asumsi"><i class="bi bi-calculator"></i><span>Asumsi</span></button>
    <button data-act="info" title="Info Titik" aria-label="Info Titik"><i class="bi bi-info-square"></i><span>Info Titik</span></button>
    <button data-act="panels" title="Tampil/sembunyikan panel" aria-label="Panel"><i class="bi bi-layout-sidebar-inset"></i><span>Panel</span></button>
  </nav>
</section>
<aside id="detail">
  <div class="flex justify-between"><h3 id="dName" class="font-extrabold text-lg"></h3><button id="tutup" class="text-2xl leading-none">×</button></div>
  <p id="dCoord" class="text-xs opacity-70"></p>
  <div class="flex items-center gap-3 my-3"><span id="dScore" class="text-5xl font-extrabold"></span><span id="dBadge" class="px-3 py-1 rounded-full text-sm font-bold"></span></div>
  <div id="dBars" class="space-y-2 text-sm"></div>
  <p id="dExp" class="my-3 text-sm p-2 rounded bg-slate-100 dark:bg-slate-800"></p>
  <p id="dLive" class="text-sm mb-1"></p><p id="dLive2" class="text-sm mb-2"></p>
  <div class="flex gap-2 mt-3 flex-wrap"><button id="bBand" class="btn !py-1">Bandingkan</button>
    <button id="bPdf" class="btn2 !py-1">Download PDF</button><button id="bPng" class="btn2 !py-1">Simpan PNG</button></div>
</aside>
<?php include __DIR__.'/includes/modal_lokasi.php'; ?>
<?php include __DIR__.'/includes/foot.php'; ?>
