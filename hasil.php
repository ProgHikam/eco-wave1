<?php $page='hasil'; $title='ECO-WAVE - Hasil CMEMS'; $libs=['chart']; $js=['data','ecowave','hasil']; include __DIR__.'/includes/head.php'; ?>
<div class="wrap">
  <div class="page-head band"><h1>Hasil CMEMS 2015-2024</h1><p>Analisis Potensi Energi Gelombang Laut - Banten Selatan | Sumber: CMEMS Copernicus Marine. Semua angka di halaman ini dihitung dari data CMEMS dan memakai parameter perangkat/bobot yang sama dengan Peta &amp; Kalkulator.</p></div>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3" id="hasilKpi"></div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
    <div class="card"><b>Tren Gelombang 10 Tahun (2015-2024)</b><p class="muted">Rata-rata dan median tahunan daya gelombang di titik P0 (kW/m)</p><canvas id="chartTren" height="220"></canvas><p class="note" id="trenNote"></p></div>
    <div class="card"><b>Klimatologi bulanan 2015-2024</b><p class="muted">Rata-rata per bulan, 12 bulan penuh (bukan seri satu tahun tertentu)</p>
    <table><thead><tr><th>Bulan</th><th>Hs (m)</th><th>Daya (kW/m)</th><th>Listrik / perangkat (kW)</th></tr></thead><tbody id="tblBulan"></tbody></table><p class="note" id="bulanNote"></p></div>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
    <div class="card"><b>Sebaran daya (P0)</b><p class="muted">Persentase waktu dan energi per kelas daya</p><canvas id="chDistribusi" height="200"></canvas></div>
    <div class="card"><b>Rata-rata musiman</b><p class="muted">Muson barat (DJF) hingga muson timur (JJA)</p><canvas id="chMusiman" height="200"></canvas></div>
  </div>
  <div class="card mt-4" id="hasilDetail"><b>Interpretasi Singkat</b><p id="interpretasi"></p></div>
</div>
<?php include __DIR__.'/includes/foot.php'; ?>
