<?php
// FOOT - versi bersih, tombol Login floating kanan bawah UDAH DIAPUS
// Login tetep bisa lewat tombol Login di navbar atas
?>
</main>
<footer class="footer">
  <div class="wrap" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:20px 16px;color:#D5B893;font-size:13px">
    <span><b style="color:#F5EFE6">ECO-WAVE</b> - Peta Interaktif Zona PLTGL Ramah Ekosistem, Pesisir Selatan Banten</span>
    <span>Data CMEMS 2015-2024 · BMKG Maritim · peta &copy; <a href="https://www.openstreetmap.org/copyright" style="color:#D5B893">OpenStreetMap</a> &amp; Esri · ekosistem: <a href="https://allencoralatlas.org" style="color:#D5B893">Allen Coral Atlas</a></span>
  </div>
</footer>

<?php
// Pustaka (CDN) + skrip inti dimuat sebelum skrip tiap halaman
$libs = $libs ?? []; $js = (array)($js ?? []);
foreach ($libs as $l) if (in_array($l, ['leaflet','chart','html2canvas'], true)) echo '<script src="'.lib_url($l).'"></script>'."\n";
?>
<script src="assets/js/ecowave.js?v=<?= @filemtime(__DIR__.'/../assets/js/ecowave.js') ?: 1 ?>"></script>
<script src="assets/js/core.js?v=<?= @filemtime(__DIR__.'/../assets/js/core.js') ?: 1 ?>"></script>
<?php foreach (array_diff(array_unique($js), ['ecowave']) as $j): ?>
<script src="assets/js/<?= htmlspecialchars($j) ?>.js?v=<?= @filemtime(__DIR__.'/../assets/js/'.$j.'.js') ?: 1 ?>"></script>
<?php endforeach; ?>
<script src="assets/js/ui.js"></script>
<script src="assets/js/aksesibilitas.js?v=<?= @filemtime(__DIR__.'/../assets/js/aksesibilitas.js') ?: 1 ?>"></script>
<script src="assets/js/interaktif.js?v=<?= @filemtime(__DIR__.'/../assets/js/interaktif.js') ?: 1 ?>"></script>
<script src="assets/js/faq.js?v=<?= @filemtime(__DIR__.'/../assets/js/faq.js') ?: 1 ?>"></script>
<script src="assets/js/cari.js?v=<?= @filemtime(__DIR__.'/../assets/js/cari.js') ?: 1 ?>"></script>
<script src="assets/js/bahasa.js?v=<?= @filemtime(__DIR__.'/../assets/js/bahasa.js') ?: 1 ?>"></script>
</body>
</html>
