<?php $page='terbaik'; $title='ECO-WAVE - Lokasi Terbaik'; $libs=[]; $js=['data','ecowave','terbaik']; include __DIR__.'/includes/head.php'; ?>
<section id="terbaik" class="page wrap active">
  <div class="page-head band"><h1>Lokasi Terbaik</h1><p>Tiga lokasi kandidat dengan skor kelayakan tertinggi menurut bobot MCA yang aktif di halaman Peta. Skor akhir = (Daya×0.40)+(Eko×0.30)+(Kedalaman×0.15)+(Jarak×0.15) × Mask Eksklusi.</p></div>
  <div class="tb-live" id="tbLive"></div>
  <div class="demo-banner"><b>PENAPISAN AWAL.</b> Kelima kandidat adalah sel terbaik di tiap ruas pesisir, dipilih dari grid Zona ECO-WAVE dengan data nyata (CMEMS dan layer PLTGL). Bobot dan ambang masih asumsi, dan Bayah&ndash;Sawarna di luar cakupan data mangrove/lamun/karang, jadi skor Ekosistemnya tinggi karena datanya belum ada (<a href="tentang.php#data-ekosistem">baca penjelasannya</a>). Setiap kartu menampilkan <b>validasi data nyata</b> (kedalaman, eksklusi, cakupan data). Telusuri titik lain lewat <a href="kalkulator.php">Zona ECO-WAVE</a>.</div>
  <div class="tb-top" id="top3"></div>
  <div class="card mt-4" id="validasi"></div>
  <style>.demo-banner{margin:0 0 16px;padding:12px 16px;border-radius:14px;background:rgba(var(--tan-rgb),.1);border:1px solid rgba(var(--tan-rgb),.4);color:var(--tan);font-size:13.5px}.demo-banner a{color:var(--tan)}
  .vd{font-size:12px;line-height:1.5;margin-top:8px;padding:8px 10px;border-radius:10px;background:rgba(var(--slate-gray-rgb),.07);border:1px solid rgba(var(--tan-rgb),.2)}.vd .bad{color:var(--cream)}.vd .warn{color:var(--tan)}</style>
</section>
<link rel="stylesheet" href="assets/css/terbaik-baru.css?v=<?= @filemtime(__DIR__.'/assets/css/terbaik-baru.css') ?: 1 ?>">
<?php include __DIR__.'/includes/foot.php'; ?>
