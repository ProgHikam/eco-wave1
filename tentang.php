<?php $page='tentang'; $title='ECO-WAVE - Tentang Data'; $libs=[]; $js=['tentang']; include __DIR__.'/includes/head.php'; require_once __DIR__.'/includes/info_helper.php'; ?>
<link rel="stylesheet" href="assets/css/halaman-info.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-info.css') ?: 1 ?>">
<link rel="stylesheet" href="assets/css/halaman-data.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-data.css') ?: 1 ?>">
<?php
/* ---------------------------------------------------------------------------
   KATALOG LAYER SPASIAL. Angka jumlah fitur & ukuran berkas dibaca dari assets/data/pltgl/manifest.json
   (otomatis ikut berubah bila data diperbarui). Luas/panjang/cakupan dihitung dari berkas GeoJSON yang
   dipasang di web (hasil penyederhanaan), BUKAN dari berkas mentah 01_raw. Luas = hampiran proyeksi lokal.
   --------------------------------------------------------------------------- */
$MANIFEST = @json_decode(@file_get_contents(__DIR__.'/assets/data/pltgl/manifest.json'), true) ?: [];
$BBOX_STUDI = $MANIFEST['bbox_studi'] ?? [104.5, -8.0, 107.0, -6.0];   // [minBT, minLS, maxBT, maxLS]
function id_n($n, $d = 0) { return number_format((float)$n, $d, ',', '.'); }
function id_lat($v) { return id_n(abs($v), 2).($v < 0 ? '°LS' : '°LU'); }   // lintang negatif = selatan
$LAYER = [
 'batimetri' => ['nama'=>'Batimetri (kelas kedalaman)', 'ikon'=>'bi-water', 'kat'=>'Dasar laut', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Poligon', 'ukur'=>'1.664 km² (jumlah luas poligon)', 'bbox'=>[105.21,-7.08,106.49,-6.70],
   'attr'=>'class_id (1–6), depth_range (teks, mis. “-50 s/d -20 m”)',
   'sumber'=>'ETOPO1 (resolusi ±1 menit busur ≈ 1,85 km) dari berkas Batimetri_Banten_Selatan_ETOPO1.tif. BATNAS/GEBCO belum dipakai.',
   'peran'=>['Skor Kedalaman 1–5 (kelas −50 s/d −20 m = skor 5, tertinggi; terlalu dalam atau terlalu dangkal lebih rendah).','Kedalaman sebuah titik dibaca dari grid raster <code>batimetri_grid.json</code> (151×122 sel, 18.422 nilai), bukan dari poligon ini; poligon dipakai untuk tampilan peta.'],
   'aturan'=>'Tidak ada eksklusi; hanya skor.',
   'batas'=>['Kasar di pesisir: banyak sel dekat pantai terbaca sebagai daratan. Titik yang terbaca daratan tidak diberi nilai di Peta dan Kalkulator.','Poligon kelas hanya mencakup 105,21–106,49°BT dan 7,08–6,70°LS, lebih sempit daripada kotak studi (grid raster menutup seluruh kotak studi).'],
   'berkas'=>'batimetri.geojson + batimetri_grid.json', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'mangrove' => ['nama'=>'Mangrove', 'ikon'=>'bi-tree', 'kat'=>'Ekosistem', 'status'=>'nyata', 'asal'=>'manual', 'warna'=>'#617891',
   'geom'=>'Poligon', 'ukur'=>'19,8 km²', 'bbox'=>[105.10,-6.84,106.99,-6.00],
   'attr'=>'nama (semua bernilai “Ekosistem Mangrove”)',
   'sumber'=>'<b>Hasil manual dari kelompok kami</b> (berkas <code>hasil_data_mangrove.geojson</code> di paket Data_PLTGL).',
   'peran'=>['Skor Ekosistem: jarak ke <b>tepi</b> poligon terdekat (≤0,5 km = 1, 0,5–1 = 2, 1–2 = 3, 2–5 = 4, &gt;5 km = 5).','Zona eksklusi bila jarak &lt; 1 km.'],
   'aturan'=>'Buffer eksklusi 1 km (asumsi tim).',
   'batas'=>['Hanya satu atribut generik; tidak ada kelas kerapatan, tahun, atau sumber per poligon.'],
   'berkas'=>'mangrove.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'karang' => ['nama'=>'Terumbu karang', 'ikon'=>'bi-flower1', 'kat'=>'Ekosistem', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Poligon', 'ukur'=>'13,1 km²', 'bbox'=>[105.21,-7.03,105.82,-6.70], 'asli'=>2197,
   'attr'=>'class (“Coral/Algae”)',
   'sumber'=>'Allen Coral Atlas, kelas atribut Coral/Algae.',
   'peran'=>['Skor Ekosistem (jarak ke tepi poligon terdekat) dan zona eksklusi bila &lt; 1 km.'],
   'aturan'=>'Buffer eksklusi 1 km (asumsi tim).',
   'batas'=>['Dari 2.197 poligon asli, 872 poligon yang sangat kecil dibuang saat penyederhanaan, jadi karang kecil bisa tidak terhitung dalam jarak.','Hanya mencakup 105,21–105,82°BT. Di luar itu (mis. Bayah 106,24°BT, Sawarna 106,32°BT) berarti <b>tidak ada data</b>, bukan berarti tidak ada karang.'],
   'berkas'=>'karang.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'lamun' => ['nama'=>'Lamun (seagrass)', 'ikon'=>'bi-flower2', 'kat'=>'Ekosistem', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Poligon', 'ukur'=>'4,0 km²', 'bbox'=>[105.21,-7.02,105.82,-6.70], 'asli'=>1264,
   'attr'=>'class (“Seagrass”)',
   'sumber'=>'Allen Coral Atlas, kelas atribut Seagrass.',
   'peran'=>['Skor Ekosistem dan zona eksklusi bila &lt; 0,5 km (buffer lebih kecil daripada karang/mangrove).'],
   'aturan'=>'Buffer eksklusi 0,5 km (asumsi tim).',
   'batas'=>['Dari 1.264 poligon asli, 544 dibuang saat penyederhanaan.','Cakupan sama dengan karang (105,21–105,82°BT); di luarnya berarti tidak ada data.'],
   'berkas'=>'lamun.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'reef' => ['nama'=>'Reef extent', 'ikon'=>'bi-bullseye', 'kat'=>'Ekosistem', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Poligon', 'ukur'=>'63,1 km²', 'bbox'=>[105.21,-7.03,105.82,-6.67],
   'attr'=>'class (“Reef”)',
   'sumber'=>'Allen Coral Atlas, kelas atribut Reef (batas luas paparan terumbu).',
   'peran'=>['Skor Ekosistem dan zona eksklusi bila &lt; 1 km. Memberi gambaran paparan terumbu yang lebih luas daripada poligon karang.'],
   'aturan'=>'Buffer eksklusi 1 km (asumsi tim).',
   'batas'=>['Cakupan sama dengan karang dan lamun (105,21–105,82°BT).'],
   'berkas'=>'reef.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'konservasi' => ['nama'=>'Kawasan konservasi', 'ikon'=>'bi-shield-check', 'kat'=>'Kawasan lindung', 'status'=>'nyata', 'asal'=>'manual', 'warna'=>'#D5B893',
   'geom'=>'Poligon', 'ukur'=>'2.633,9 km²', 'bbox'=>[105.07,-7.43,107.00,-6.00],
   'attr'=>'nama (semua bernilai “Konservasi Laut”)',
   'sumber'=>'<b>Hasil manual dari kelompok kami</b> (berkas <code>hasil_kawasan_konservasi.geojson</code> di paket Data_PLTGL).',
   'peran'=>['Titik <b>di dalam</b> kawasan langsung gugur (skor 0). Jarak ke tepinya juga masuk skor Ekosistem.'],
   'aturan'=>'Eksklusi: di dalam poligon (tanpa buffer).',
   'batas'=>['Nama kawasan generik sehingga tiap poligon belum bisa ditelusuri ke kawasan resminya (mis. taman nasional).'],
   'berkas'=>'konservasi.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'perairan5km' => ['nama'=>'Perairan pesisir 5 km', 'ikon'=>'bi-bounding-box-circles', 'kat'=>'Batas wilayah', 'status'=>'nyata', 'asal'=>'manual', 'warna'=>'#617891',
   'geom'=>'Poligon', 'ukur'=>'1.614,8 km² (jumlah luas poligon, lubang dikurangkan)', 'bbox'=>[105.06,-7.06,106.40,-6.24], 'asli'=>1,
   'attr'=>'nama (semua bernilai “Perairan Pesisir 5km”)',
   'sumber'=>'<b>Hasil manual dari kelompok kami</b> (berkas <code>perairan.geojson</code>, folder Batas administrasi dan garis pantai): 1 fitur MultiPolygon yang dipecah menjadi 14 poligon saat penyederhanaan.',
   'peran'=>['Menentukan sel mana yang dinilai pada <b>Zona ECO-WAVE</b> (grid ±1 km hanya di dalam perairan ini dan di selatan lintang −6,60).'],
   'aturan'=>'Bukan eksklusi; hanya batas area penilaian zona.',
   'batas'=>['Cakupan 105,06–106,40°BT: sisi timur kotak studi (sampai 107°BT) tidak ikut dinilai pada zona grid.'],
   'berkas'=>'perairan5km.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Zona grid','kalkulator.php#k-zona']]],
 'jalur_listrik' => ['nama'=>'Jalur listrik', 'ikon'=>'bi-lightning-charge', 'kat'=>'Infrastruktur', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Garis', 'ukur'=>'±178 km (jumlah panjang)', 'bbox'=>[105.71,-7.24,107.00,-6.02], 'asli'=>227,
   'attr'=>'voltage (144 fitur: 137 segmen 150 kV dan 7 segmen 70 kV), operator (14: PLN / Perusahaan Listrik Negara dan ICON+), name (3)',
   'sumber'=>'Berkas jalurlistrik.geojson (Data PLTGL), atribut bergaya OpenStreetMap (power, voltage, operator).',
   'peran'=>['Skor Jarak Infrastruktur: jarak ke gardu atau jalur listrik terdekat (≤5 km = 5, 5–10 = 4, 10–20 = 3, 20–40 = 2, &gt;40 km = 1).'],
   'aturan'=>'Tidak ada eksklusi; hanya skor.',
   'batas'=>['Dari 227 garis asli, 78 garis yang seluruhnya di luar kotak studi tidak dipakai; sisanya ada yang menjulur keluar kotak (data asli sampai 108,20°BT).','Data sukarelawan OSM: kelengkapan dan tegangan tidak dijamin.'],
   'berkas'=>'jalur_listrik.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'gardu' => ['nama'=>'Gardu listrik', 'ikon'=>'bi-plug', 'kat'=>'Infrastruktur', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Titik', 'ukur'=>'1 titik (Gardu Listrik Kp. Campaka Barat)', 'bbox'=>[105.62,-6.64,105.62,-6.64],
   'attr'=>'name (Gardu Listrik Kp. Campaka Barat), power (substation)',
   'sumber'=>'Berkas gardu.geojson (Data PLTGL), atribut bergaya OpenStreetMap (power=substation).',
   'peran'=>['Skor Jarak Infrastruktur bersama jalur listrik. Mode jarak bisa <i>grid</i>, <i>desa</i>, atau <i>rata-rata</i> (Parameter lanjutan).'],
   'aturan'=>'Tidak ada eksklusi; hanya skor.',
   'batas'=>['Hanya 1 titik gardu distribusi, jadi jarak ke gardu praktis hanya berlaku di sekitar Pandeglang; skor jarak infrastruktur lebih banyak ditentukan oleh jalur listrik.'],
   'berkas'=>'gardu.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
 'pelabuhan' => ['nama'=>'Pelabuhan / dermaga', 'ikon'=>'bi-geo-alt', 'kat'=>'Infrastruktur', 'status'=>'nyata', 'warna'=>'#D5B893',
   'geom'=>'Titik', 'ukur'=>'1 titik (Dermaga Sumur)', 'bbox'=>[105.58,-6.66,105.58,-6.66],
   'attr'=>'name, amenity (ferry_terminal)',
   'sumber'=>'Berkas pelabuhan.geojson (Data PLTGL), atribut bergaya OpenStreetMap (amenity=ferry_terminal).',
   'peran'=>['Hanya ditampilkan di Peta sebagai acuan; tidak ikut skor maupun eksklusi.'],
   'aturan'=>'Tidak dipakai dalam perhitungan.',
   'batas'=>['Hanya 1 titik; tidak lengkap untuk seluruh pesisir selatan Banten.'],
   'berkas'=>'pelabuhan.geojson', 'pakai'=>[['Peta','peta.php#layer']]],
 'jalur_pelayaran' => ['nama'=>'Jalur pelayaran', 'ikon'=>'bi-signpost-split', 'kat'=>'Infrastruktur', 'status'=>'nyata', 'warna'=>'#632024',
   'geom'=>'Garis', 'ukur'=>'±6.840 km (jumlah panjang, termasuk rute antarpulau)', 'bbox'=>[98.68,-6.60,107.63,3.81], 'asli'=>46,
   'attr'=>'route (24, semuanya ferry), name (15), operator (4: Pelni dan Dinas Perhubungan DKI Jakarta)',
   'sumber'=>'Berkas jalurkapal.geojson (Data PLTGL), atribut bergaya OpenStreetMap (route=ferry), termasuk rute antarpulau.',
   'peran'=>['Zona eksklusi bila jarak &lt; 0,5 km, supaya struktur tidak berada di lintasan kapal.'],
   'aturan'=>'Buffer eksklusi 0,5 km (asumsi tim).',
   'batas'=>['Bukan alur pelayaran resmi (belum dari Kemenhub/BIG).','Dari 46 garis asli, 22 yang seluruhnya di luar kotak studi tidak dipakai; rute yang tersisa masih membentang 98,68–107,63°BT sehingga hanya sebagian kecil yang relevan.'],
   'berkas'=>'jalur_pelayaran.geojson', 'pakai'=>[['Peta','peta.php#layer'],['Kalkulator','kalkulator.php#k-jarak']]],
];
foreach ($LAYER as $k => &$L) {              // isi jumlah fitur & ukuran berkas dari manifest
  $L['fitur'] = $MANIFEST['layer'][$k]['fitur'] ?? null;
  $L['kb']    = $MANIFEST['layer'][$k]['kb'] ?? null;
} unset($L);
$TOT_FITUR = 0; $TOT_KB = 0;
foreach ($LAYER as $L) { $TOT_FITUR += (int)$L['fitur']; $TOT_KB += (float)$L['kb']; }

?>
<?php
/* ---------------------------------------------------------------------------
   DAFTAR SUMBER DATA - satu baris per data yang dipakai situs ini.
   Hanya mencatat apa yang memang tertulis di berkas proyek (README, inventaris_data.csv,
   atribut GeoJSON, kode). Bila sumber/tanggal unduh belum tercatat, ditulis apa adanya.
   Status: nyata | live | acuan | demo | asumsi | belum
   --------------------------------------------------------------------------- */
$STATUS = [
  'nyata'  => ['Data nyata',        'Berkas data asli'],
  'live'   => ['Prakiraan live',    'Diambil saat halaman dibuka; bukan klimatologi'],
  'acuan'  => ['Data acuan',        'Angka acuan yang tertanam di kode'],
  'simulasi' => ['Data Simulasi', 'Angka realistis buatan tim, BUKAN data aktual; tidak boleh dikutip sebagai fakta'],
  'demo'   => ['Demo / ilustrasi',  'Contoh prototipe; jangan dikutip sebagai hasil penelitian'],
  'asumsi' => ['Asumsi',            'Nilai ditetapkan tim; perlu dasar literatur/AHP/pakar'],
  'belum'  => ['Belum tersedia',    'Direncanakan, belum dimasukkan'],
];
$DATA = [
 ['Gelombang & cuaca', [
  ['Gelombang CMEMS titik P0–P3 (Hs, Te, P) 2015–2024', 'Peta (estimasi saat klik), Kalkulator, Beranda',
   'Copernicus Marine Service (CMEMS), Te = VTM10 (periode energi).',
   'assets/js/data.js (objek CMEMS)', '4 titik', 'acuan',
   'Rata-rata bulanan/musiman/tahunan dipakai grafik; interpolasi IDW dari 4 titik untuk setiap klik peta.'],
  ['Gelombang ERA5 2010–2024', 'Belum dipakai', 'ECMWF/Copernicus Climate Data Store.',
   'scripts/process_era5.py', '–', 'belum', 'Direncanakan untuk tahap berikutnya (lihat bagian 10).'],
  ['Prakiraan BMKG Maritim (perairan)', 'Peta (tab BMKG), Kalkulator',
   'BMKG Maritim, maritim.bmkg.go.id/marine2026-data/perairan/&lt;KODE&gt;.json (dokumentasi: maritim.bmkg.go.id/apidoc).',
   'api/bmkg.php (cache 30 menit)', '3 zona terverifikasi', 'live',
   'P.I.04, P.I.05, P.I.06. Hanya Hs, angin, arus, cuaca; tanpa periode gelombang, sehingga tidak mengubah skor MCA.'],
  ['Prakiraan gelombang Windy gfsWave / Open-Meteo Marine', 'Peta (tab Windy Live), Kalkulator',
   'Windy Point Forecast API (model gfsWave) bila kunci diisi di config/windy.php; bila kosong memakai GFS Wave via Open-Meteo Marine. Jika keduanya gagal, panel menampilkan SIMULASI.',
   'api/windy.php (cache 3 jam)', 'per titik', 'live', 'Te = 0,9·Tp (asumsi). Bukan pengganti klimatologi.'],
 ]],
 ['Batimetri', [
  ['Batimetri ETOPO1', 'Kalkulator, Peta (zona ECO-WAVE)',
   'ETOPO1 (resolusi ~1 menit busur ≈ 1,85 km), sesuai nama berkas. BATNAS/GEBCO belum dipakai.',
   'batimetri_grid.json (151×122 sel); batimetri.geojson', '119 poligon (6 kelas)', 'nyata',
   'Kasar di pesisir: banyak sel dekat pantai terbaca daratan.'],
 ]],
 ['Ekosistem & kawasan lindung', [
  ['Mangrove', 'Peta, Kalkulator', 'Hasil manual dari kelompok kami (berkas hasil_data_mangrove.geojson).',
   'assets/data/pltgl/mangrove.geojson', '247 poligon', 'nyata', 'Penyangga eksklusi 1 km (asumsi).', 'manual'],
  ['Terumbu karang', 'Peta, Kalkulator', 'Allen Coral Atlas (kelas atribut "Coral/Algae").',
   'assets/data/pltgl/karang.geojson', '1.325 dari 2.197 poligon', 'nyata',
   'Poligon sangat kecil dibuang saat penyederhanaan. Cakupan hanya 105,21–105,82°BT.'],
  ['Lamun', 'Peta, Kalkulator', 'Allen Coral Atlas (kelas atribut "Seagrass").',
   'assets/data/pltgl/lamun.geojson', '720 dari 1.264 poligon', 'nyata', 'Cakupan sama dengan karang (105,21–105,82°BT). Penyangga 0,5 km.'],
  ['Reef extent', 'Peta, Kalkulator', 'Allen Coral Atlas (kelas atribut "Reef").',
   'assets/data/pltgl/reef.geojson', '155 poligon', 'nyata', 'Penyangga 1 km.'],
  ['Kawasan konservasi', 'Peta, Kalkulator', 'Hasil manual dari kelompok kami (berkas hasil_kawasan_konservasi.geojson). Semua atribut bernama generik "Konservasi Laut".',
   'assets/data/pltgl/konservasi.geojson', '67 poligon', 'nyata', 'Nama kawasan belum bisa ditelusuri.', 'manual'],
  ['Perairan pesisir 5 km', 'Peta, Kalkulator', 'Hasil manual dari kelompok kami (berkas perairan.geojson).',
   'assets/data/pltgl/perairan5km.geojson', '14 poligon (dari 1 fitur asli)', 'nyata', 'Cakupan 105,06–106,40°BT.', 'manual'],
 ]],
 ['Infrastruktur', [
  ['Jalur listrik', 'Peta, Kalkulator (skor jarak)', 'Atribut bergaya OpenStreetMap (power, voltage, operator).',
   'assets/data/pltgl/jalur_listrik.geojson', '149 dari 227 garis', 'nyata', 'Sebagian garis menjulur keluar dari kotak studi.'],
  ['Gardu listrik', 'Peta, Kalkulator (skor jarak)', 'Atribut bergaya OpenStreetMap (power=substation).',
   'assets/data/pltgl/gardu.geojson', '1 titik', 'nyata', 'Hanya 1 gardu (Kp. Campaka Barat).'],
  ['Pelabuhan', 'Peta', 'Atribut bergaya OpenStreetMap (amenity=ferry_terminal).',
   'assets/data/pltgl/pelabuhan.geojson', '1 titik (Dermaga Sumur)', 'nyata', 'Tidak lengkap untuk seluruh pesisir.'],
  ['Jalur pelayaran', 'Peta, Kalkulator (eksklusi 0,5 km)', 'Berkas jalurkapal.geojson. Atribut bergaya OpenStreetMap (route=ferry), termasuk rute antarpulau.',
   'assets/data/pltgl/jalur_pelayaran.geojson', '24 dari 46 garis', 'nyata', 'Bukan alur pelayaran resmi (belum dari sumber Kemenhub/BIG).'],
 ]],
 ['Titik, desa & kandidat', [
  ['Desa acuan (12 desa) dan jumlah penduduk', 'Peta (jarak & skor jarak), Kalkulator', 'Hasil manual dari kelompok kami, diketik langsung di kode. Koordinat dan jumlah penduduk belum dirujuk ke BPS/BIG.',
   'assets/js/data.js (DESA)', '12 desa', 'simulasi', 'Data Simulasi: koordinat dan jumlah penduduk tidak dapat ditelusuri ke BPS/BIG. Hanya koordinat dipakai (cadangan skor jarak); penduduk hanya ditampilkan di popup.', 'manual'],
  ['Lokasi kandidat & skor MCA', 'Peta, Lokasi Terbaik, Admin', 'Dipilih otomatis oleh scripts/hitung_kandidat.js: sel terbaik tiap ruas pesisir dari grid Zona ECO-WAVE. Skor dari data nyata (CMEMS + layer PLTGL); bobot dan ambang masih asumsi.',
   'database.sql; assets/data/contoh_kandidat.geojson; assets/data/ringkasan_zona.json', '5 lokasi', 'asumsi', 'Bayah dan Sawarna berada di luar cakupan data karang/lamun; bobot belum divalidasi (AHP/pakar).', 'manual'],
 ]],
 ['Peta dasar & asumsi', [
  ['Peta dasar', 'Peta, Kalkulator', 'Esri World Street Map (utama); OpenStreetMap contributors (cadangan).', 'tile online', '–', 'live', 'Perlu internet.'],
  ['Asumsi konversi listrik', 'Peta, Kalkulator, Tentang', 'Ditetapkan kelompok kami: lebar tangkap 10 m, efisiensi 30%, faktor kapasitas 15%, 450/900/1300 VA = 113,5/164,6/229,9 kWh per bulan. Rujukan: Babarit (2015) untuk efisiensi/CWR, Bozzi dkk., Guillou &amp; Chapalain (2018), Jarocki (2010) untuk faktor kapasitas, skripsi Unigoro dan CNBC Indonesia (2019) untuk konsumsi rumah tangga (lihat Teknologi &amp; Metode, bagian Rujukan).',
   'assets/js/data.js (hitungEstimasiListrik); assets/js/ecowave.js (PARAM_DEFAULT)', '–', 'asumsi', 'P = 0,49·Hs²·Te; potensi gelombang bukan daya listrik terbangkit.', 'manual'],
  ['Bobot & ambang MCA', 'Peta, Kalkulator, Lokasi Terbaik', 'Awal 40/30/15/15; ambang jarak 0,5/1/2/5 km; buffer eksklusi. Ditetapkan kelompok kami.',
   'tabel mca_weights; assets/js/ecowave.js', '–', 'asumsi', 'Perlu AHP/pakar dan uji sensitivitas.', 'manual'],
 ]],
];
?>
<?php
$CNT = array_fill_keys(array_keys($STATUS), 0);
foreach ($DATA as $g) foreach ($g[1] as $r) $CNT[$r[5]]++;
$TOT_DATA = array_sum($CNT);
$VIEW = ['x0'=>104.3,'x1'=>108.4,'y0'=>-8.2,'y1'=>-5.7,'w'=>640];           // jendela peta skema (derajat)
$VIEW['h'] = round(($VIEW['y1']-$VIEW['y0'])/($VIEW['x1']-$VIEW['x0'])*$VIEW['w']);
function vx($lng){ global $VIEW; return round(($lng-$VIEW['x0'])/($VIEW['x1']-$VIEW['x0'])*$VIEW['w'],1); }
function vy($lat){ global $VIEW; return round(($VIEW['y1']-$lat)/($VIEW['y1']-$VIEW['y0'])*$VIEW['h'],1); }
$TITIK_CMEMS = [['P0',-8.00,104.60],['P1',-7.20,105.20],['P2',-7.30,106.00],['P3',-7.35,106.30]];
$DESA_PETA = [['Bayah',-6.95,106.24],['Sawarna',-6.99,106.32],['Binuangeun',-6.84,105.90],['Panimbang',-6.55,105.78],['Labuan',-6.38,105.62],['Pelabuhan Ratu',-6.99,106.55],['Ujung Kulon',-6.78,105.55]];
?>
<div class="info-wrap" id="dtRoot">

  <div class="page-head band">
    <h1>Tentang Data</h1>
    <p>Katalog lengkap data yang dipakai ECO-WAVE: dari mana asalnya, siapa yang menyiapkan, seberapa banyak, wilayah mana yang tercakup, atribut apa yang ada, dipakai untuk apa di analisis, dan seberapa bisa dipercaya. Angka jumlah fitur dan ukuran dibaca langsung dari berkas data di situs, jadi selalu cocok dengan yang tampil di Peta dan Kalkulator.</p>
    <div class="tip"><b>Cara membaca halaman ini:</b> mulai dari <a href="#ringkasan" style="color:#D5B893">Ringkasan</a> (angka kunci dan asal data), lihat <a href="#katalog" style="color:#D5B893">Katalog layer</a> untuk rincian tiap data, lalu <a href="#kualitas" style="color:#D5B893">Kualitas &amp; keterbatasan</a> sebelum mengutip. Tabel sumber lengkap ada di <a href="#sumber-data" style="color:#D5B893">bagian 6</a>.</div>
  </div>

  <nav class="info-toc" aria-label="Isi halaman">
    <a href="#ringkasan">Ringkasan</a><a href="#cakupan">Cakupan wilayah</a><a href="#katalog">Katalog layer</a><a href="#tabular">Data non-spasial</a>
    <a href="#alur-data">Alur data</a><a href="#sumber-data">Tabel sumber</a><a href="#metode">Metode estimasi</a><a href="#literatur">Studi literatur</a><a href="#kualitas">Kualitas &amp; keterbatasan</a><a href="#pengembangan">Pengembangan &amp; pemeliharaan</a><a href="#kutip">Cara memakai &amp; mengutip</a>
  </nav>

  <!-- ============ RINGKASAN ============ -->
  <section class="info-sec" id="ringkasan">
    <h2><span class="no">1</span> Ringkasan data</h2>
    <p class="lead">Situs ini memadukan <b>data spasial nyata</b> (ekosistem, kawasan lindung, kedalaman, infrastruktur), <b>data gelombang</b> (acuan historis dan prakiraan), dan <b>asumsi tim</b> (bobot, ambang, konversi listrik). Hanya sebagian yang sudah berupa data terverifikasi; sisanya ditandai jelas agar tidak salah kutip.</p>
    <div class="dt-kpi">
      <div><b><?= count($LAYER) ?></b><span>layer spasial (GeoJSON, EPSG:4326)</span></div>
      <div><b><?= id_n($TOT_FITUR) ?></b><span>fitur (poligon, garis, titik) di web</span></div>
      <div><b>±<?= id_n($TOT_KB/1024, 1) ?> MB</b><span>ukuran seluruh layer setelah disederhanakan</span></div>
      <div><b>4</b><span>titik gelombang CMEMS, 2015–2024</span></div>
      <div><b>3</b><span>zona BMKG Maritim terverifikasi</span></div>
      <div><b>12</b><span>desa acuan untuk jarak cadangan</span></div>
      <div><b>18.422</b><span>nilai kedalaman di grid ETOPO1 (151×122)</span></div>
      <div><b>5</b><span>lokasi kandidat (data nyata, penapisan awal)</span></div>
    </div>
    <h3>Asal data: siapa yang menyiapkan?</h3>
    <p>Supaya jelas mana data yang dibuat sendiri dan mana yang berasal dari luar, semua data dikelompokkan menurut asalnya. Penanda <span class="src-chip src-manual">Hasil manual kelompok</span> muncul pada data yang disiapkan sendiri oleh kelompok kami.</p>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Hasil manual kelompok kami</span><h4>Dibuat dan diolah sendiri</h4><p>Mangrove, kawasan konservasi, dan perairan pesisir 5 km (paket <code>Data_PLTGL</code>); 12 desa acuan beserta jumlah penduduknya; 5 lokasi kandidat contoh; serta bobot, ambang, buffer, dan asumsi konversi listrik. Sebut sebagai <b>hasil manual kelompok</b>.</p></div>
      <div class="info-card"><span class="tag">Sumber luar</span><h4>Diunduh lalu diolah</h4><p>Batimetri ETOPO1, terumbu karang/lamun/reef dari Allen Coral Atlas, jalur listrik, gardu, pelabuhan, dan jalur pelayaran bergaya OpenStreetMap, serta 4 titik gelombang CMEMS.</p></div>
      <div class="info-card"><span class="tag">Layanan langsung</span><h4>Diambil saat halaman dibuka</h4><p>Prakiraan BMKG Maritim, prakiraan Windy/Open-Meteo, dan peta dasar Esri/OpenStreetMap. Butuh internet dan nilainya berubah-ubah.</p></div>
      <div class="info-card"><span class="tag">Belum dipakai</span><h4>Masih rencana</h4><p>Gelombang ERA5 2010–2024 dan batimetri BATNAS, direncanakan untuk tahap berikutnya. Lihat <a href="#era5" style="color:#D5B893">tahap pengembangan</a>.</p></div>
    </div>
    <h3>Status keandalan <?= $TOT_DATA ?> entri data</h3>
    <div class="dt-status">
      <?php foreach ($STATUS as $k => $v): ?>
        <div class="dt-st"><span class="src-chip src-<?= $k ?>"><?= htmlspecialchars($v[0]) ?></span><b><?= $CNT[$k] ?></b><small><?= htmlspecialchars($v[1]) ?></small></div>
      <?php endforeach; ?>
    </div>
    <div class="warn"><b>Baca dulu:</b> prototipe ini <b>belum</b> memakai ERA5 maupun BATNAS karena masih di tahap awal (<a href="#era5" style="color:#D5B893">lihat rencananya</a>), dan skor kandidat adalah penapisan awal (bobot dan ambang masih asumsi). Data gelombang memakai angka acuan CMEMS 2015–2024 di 4 titik. Jangan mengutip hasil situs ini sebagai hasil ERA5, BATNAS, Allen Coral Atlas, atau ArcGIS sebelum diverifikasi dari berkas aslinya.</div>
  </section>

  <!-- ============ CAKUPAN ============ -->
  <section class="info-sec" id="cakupan">
    <h2><span class="no">2</span> Cakupan wilayah: kotak studi dan jangkauan tiap layer</h2>
    <p class="lead">Kotak studi: <b><?= id_n(abs($BBOX_STUDI[1]),1) ?>–<?= id_n(abs($BBOX_STUDI[3]),1) ?>°LS</b> dan <b><?= id_n($BBOX_STUDI[0],1) ?>–<?= id_n($BBOX_STUDI[2],1) ?>°BT</b> (garis putus-putus). Setiap persegi di bawah adalah <i>kotak pembatas</i> sebuah layer (bukan bentuk sebenarnya). Klik nama layer pada legenda untuk menampilkan atau menyembunyikannya. Perhatikan karang, lamun, dan reef yang hanya menutup bagian barat.</p>
    <div class="dt-peta">
      <svg viewBox="0 0 <?= $VIEW['w'] ?> <?= $VIEW['h'] ?>" role="img" aria-label="Skema cakupan layer data terhadap kotak studi">
        <rect width="<?= $VIEW['w'] ?>" height="<?= $VIEW['h'] ?>" fill="#25344F"/>
        <?php foreach ([105,106,107,108] as $g): ?><line x1="<?= vx($g) ?>" y1="0" x2="<?= vx($g) ?>" y2="<?= $VIEW['h'] ?>" stroke="#F5EFE6" stroke-opacity=".08"/><text x="<?= vx($g)+4 ?>" y="<?= $VIEW['h']-6 ?>" fill="#D5B893" font-size="11"><?= $g ?>°BT</text><?php endforeach; ?>
        <?php foreach ([-8,-7,-6] as $g): ?><line x1="0" y1="<?= vy($g) ?>" x2="<?= $VIEW['w'] ?>" y2="<?= vy($g) ?>" stroke="#F5EFE6" stroke-opacity=".08"/><text x="6" y="<?= vy($g)-4 ?>" fill="#D5B893" font-size="11"><?= abs($g) ?>°LS</text><?php endforeach; ?>
        <?php
        $urut = $LAYER; uasort($urut, function($a,$b){ $la=($a['bbox'][2]-$a['bbox'][0])*($a['bbox'][3]-$a['bbox'][1]); $lb=($b['bbox'][2]-$b['bbox'][0])*($b['bbox'][3]-$b['bbox'][1]); return $lb <=> $la; });
        foreach ($urut as $k => $L):
          $b = $L['bbox'];
          $x1 = max($b[0], $VIEW['x0']); $x2 = min($b[2], $VIEW['x1']); $y1 = min($b[3], $VIEW['y1']); $y2 = max($b[1], $VIEW['y0']);
          $titik = ($b[0] === $b[2]);
        ?>
          <g class="dt-bb" data-k="<?= $k ?>">
          <?php if ($titik): ?><circle cx="<?= vx($b[0]) ?>" cy="<?= vy($b[1]) ?>" r="5" fill="<?= $L['warna'] ?>" stroke="#F5EFE6" stroke-width="1"><title><?= htmlspecialchars($L['nama']) ?></title></circle>
          <?php else: ?><rect x="<?= vx($x1) ?>" y="<?= vy($y1) ?>" width="<?= max(2, vx($x2)-vx($x1)) ?>" height="<?= max(2, vy($y2)-vy($y1)) ?>" fill="<?= $L['warna'] ?>" fill-opacity=".1" stroke="<?= $L['warna'] ?>" stroke-width="1.6"><title><?= htmlspecialchars($L['nama']) ?>: <?= id_n($b[0],2) ?>–<?= id_n($b[2],2) ?>°BT, <?= id_lat($b[3]) ?> sampai <?= id_lat($b[1]) ?></title></rect><?php endif; ?>
          </g>
        <?php endforeach; ?>
        <rect x="<?= vx($BBOX_STUDI[0]) ?>" y="<?= vy($BBOX_STUDI[3]) ?>" width="<?= vx($BBOX_STUDI[2])-vx($BBOX_STUDI[0]) ?>" height="<?= vy($BBOX_STUDI[1])-vy($BBOX_STUDI[3]) ?>" fill="none" stroke="#F5EFE6" stroke-width="2" stroke-dasharray="7 5"/>
        <text x="<?= vx($BBOX_STUDI[0])+6 ?>" y="<?= vy($BBOX_STUDI[3])+15 ?>" fill="#F5EFE6" font-size="12" font-weight="700">Kotak studi</text>
        <?php foreach ($DESA_PETA as $d): ?><circle cx="<?= vx($d[2]) ?>" cy="<?= vy($d[1]) ?>" r="2.6" fill="#F5EFE6"/><text x="<?= vx($d[2])+5 ?>" y="<?= vy($d[1])+3 ?>" fill="#F5EFE6" font-size="9.5"><?= $d[0] ?></text><?php endforeach; ?>
        <?php foreach ($TITIK_CMEMS as $t): ?><rect x="<?= vx($t[2])-4 ?>" y="<?= vy($t[1])-4 ?>" width="8" height="8" transform="rotate(45 <?= vx($t[2]) ?> <?= vy($t[1]) ?>)" fill="#D5B893" stroke="#25344F"/><text x="<?= vx($t[2])+8 ?>" y="<?= vy($t[1])+4 ?>" fill="#D5B893" font-size="10" font-weight="700"><?= $t[0] ?></text><?php endforeach; ?>
      </svg>
      <div class="dt-legend" id="dtLegend">
        <?php foreach ($LAYER as $k => $L): ?><button type="button" class="on" data-k="<?= $k ?>"><i style="background:<?= $L['warna'] ?>"></i><?= htmlspecialchars($L['nama']) ?></button><?php endforeach; ?>
        <span class="dt-leg-note"><b style="color:#D5B893">◆</b> titik CMEMS P0–P3 &nbsp; <b style="color:#F5EFE6">●</b> desa acuan</span>
      </div>
    </div>
    <?= tabel(['Layer','Jangkauan bujur','Jangkauan lintang','Terhadap kotak studi'], array_map(function($L) use ($BBOX_STUDI){
        $b=$L['bbox']; $dalam = ($b[0] >= $BBOX_STUDI[0]-0.05 && $b[2] <= $BBOX_STUDI[2]+0.05 && $b[1] >= $BBOX_STUDI[1]-0.05 && $b[3] <= $BBOX_STUDI[3]+0.05);
        $sebagian = ($b[0] > $BBOX_STUDI[0]+0.3 || $b[2] < $BBOX_STUDI[2]-0.3);
        $ket = !$dalam ? '<b>Melebihi</b> kotak studi' : ($sebagian ? 'Menutup <b>sebagian</b> kotak studi' : 'Hampir menutup seluruh kotak studi');
        return [htmlspecialchars($L['nama']), id_n($b[0],2).' – '.id_n($b[2],2).'°BT', id_lat($b[3]).' – '.id_lat($b[1]), $ket];
      }, array_values($LAYER)), 'rata') ?>
  </section>

  <!-- ============ KATALOG ============ -->
  <section class="info-sec" id="katalog">
    <h2><span class="no">3</span> Katalog layer spasial</h2>
    <p class="lead">Satu kartu per layer: sumber, ukuran, atribut, peran dalam analisis, aturan eksklusi, dan keterbatasannya. Gunakan pencarian atau tombol status untuk menyaring kartu <i>dan</i> tabel sumber data di bawah.</p>
    <div class="dt-filter" id="dtFilter">
      <input type="search" id="dtCari" placeholder="Cari data (mis. mangrove, OSM, karang, BMKG, manual)…" aria-label="Cari data">
      <div class="dt-fchips">
        <button type="button" class="on" data-st="semua">Semua</button>
        <?php foreach ($STATUS as $k => $v): ?><button type="button" data-st="<?= $k ?>" class="src-chip src-<?= $k ?>"><?= htmlspecialchars($v[0]) ?></button><?php endforeach; ?>
      </div>
      <span class="dt-count" id="dtCount" aria-live="polite"></span>
    </div>
    <div class="dt-grid">
      <?php foreach ($LAYER as $k => $L): $st = $STATUS[$L['status']]; $teks = strtolower($L['nama'].' '.$L['kat'].' '.$L['sumber'].' '.$L['attr'].' '.$L['berkas']); ?>
      <article class="dt-card" id="l-<?= $k ?>" data-status="<?= $L['status'] ?>" data-teks="<?= htmlspecialchars($teks) ?>">
        <header>
          <span class="dt-ic" style="--c:<?= $L['warna'] ?>"><i class="bi <?= $L['ikon'] ?>"></i></span>
          <div class="dt-tt"><h3><?= htmlspecialchars($L['nama']) ?></h3><small><?= htmlspecialchars($L['kat']) ?> · <?= $L['geom'] ?></small></div>
          <span class="src-chip src-<?= $L['status'] ?>" title="<?= htmlspecialchars($st[1]) ?>"><?= htmlspecialchars($st[0]) ?></span>
        </header>
        <dl class="dt-meta">
          <div><dt>Jumlah fitur</dt><dd><?= $L['fitur'] !== null ? id_n($L['fitur']) : '–' ?><?php if (!empty($L['asli'])): ?> <small>dari <?= id_n($L['asli']) ?> asli</small><?php endif; ?></dd></div>
          <div><dt>Luas / panjang</dt><dd><?= $L['ukur'] ?></dd></div>
          <div><dt>Cakupan</dt><dd><?= $L['bbox'][0]===$L['bbox'][2] ? id_n($L['bbox'][0],2).'°BT, '.id_lat($L['bbox'][1]) : id_n($L['bbox'][0],2).'–'.id_n($L['bbox'][2],2).'°BT · '.id_lat($L['bbox'][3]).' – '.id_lat($L['bbox'][1]) ?></dd></div>
          <div><dt>Ukuran berkas</dt><dd><?= $L['kb'] !== null ? id_n($L['kb'],1).' KB' : '–' ?></dd></div>
        </dl>
        <p class="dt-row"><b>Atribut</b><?= $L['attr'] ?></p>
        <p class="dt-row"><b>Sumber</b><?= $L['sumber'] ?></p>
        <div class="dt-row"><b>Dipakai untuk</b><ul><?php foreach ($L['peran'] as $p): ?><li><?= $p ?></li><?php endforeach; ?></ul></div>
        <p class="dt-row"><b>Aturan</b><?= $L['aturan'] ?></p>
        <div class="dt-row dt-batas"><b>Keterbatasan</b><ul><?php foreach ($L['batas'] as $p): ?><li><?= $p ?></li><?php endforeach; ?></ul></div>
        <footer>
          <code>assets/data/pltgl/<?= $L['berkas'] ?></code>
          <span class="dt-buka"><?php foreach ($L['pakai'] as $u): ?><a href="<?= $u[1] ?>"><?= $u[0] ?> <i class="bi bi-arrow-up-right"></i></a><?php endforeach; ?></span>
        </footer>
      </article>
      <?php endforeach; ?>
    </div>
    <p class="note" id="dtKosong" hidden>Tidak ada layer yang cocok dengan penyaringan ini. Coba kata kunci lain atau pilih &ldquo;Semua&rdquo;.</p>
  </section>

  <!-- ============ DATA NON-SPASIAL ============ -->
  <section class="info-sec" id="tabular">
    <h2><span class="no">4</span> Data non-spasial: gelombang, desa, kandidat, BMKG</h2>
    <p class="lead">Data berikut tertanam di kode atau diambil lewat API, bukan berkas GeoJSON. Klik judul untuk membuka rincian.</p>

    <details class="dt-det" open>
      <summary><span><i class="bi bi-water"></i> Gelombang CMEMS: 4 titik acuan, 2015–2024</span><span class="src-chip src-acuan">Data acuan</span></summary>
      <p>Copernicus Marine Service (CMEMS); Te = VTM10 (periode energi). Rata-rata bulanan/musiman/tahunan dipakai grafik; setiap klik peta diinterpolasi IDW dari keempat titik ini.</p>
      <?= tabel(['Titik','Lintang','Bujur','P rata-rata (kW/m)','Hs (m)','Te (s)'], [
        ['P0 Utama','−8,00','104,60','25,57','2,13','10,76'],
        ['P1 Ujung Kulon','−7,20','105,20','23,90','2,04','10,91'],
        ['P2 Binuangeun','−7,30','106,00','22,59','1,97','11,09'],
        ['P3 Bayah–Sawarna','−7,35','106,30','20,48','1,84','11,44'],
      ], 'rata') ?>
      <p class="note">Pola musiman (rata-rata daya P0): musim timur Jun–Agu ±36,35 kW/m, peralihan II (Sep–Nov) ±24,72, peralihan I (Mar–Mei) ±23,00, musim barat Des–Feb ±18,06. Hanya 4 titik lepas pantai: nilai di dekat pantai adalah interpolasi, bukan pengukuran.</p>
    </details>

    <details class="dt-det">
      <summary><span><i class="bi bi-broadcast"></i> Prakiraan BMKG Maritim: 3 zona terverifikasi</span><span class="src-chip src-live">Prakiraan live</span></summary>
      <p>Diambil lewat <code>api/bmkg.php</code> (cache 30 menit) dari <code>maritim.bmkg.go.id/marine2026-data/perairan/&lt;KODE&gt;.json</code>. Memuat tinggi gelombang, angin, arus, dan cuaca; <b>tidak memuat periode gelombang</b>, sehingga tidak mengubah skor MCA. Hari ke-1 per jam, hari ke-2 sampai ke-4 per 3 jam.</p>
      <?= tabel(['Kode','Zona perairan'], [['P.I.04','Selat Sunda Barat Pandeglang'],['P.I.05','Perairan Selatan Pandeglang'],['P.I.06','Perairan Selatan Lebak']]) ?>
    </details>

    <details class="dt-det">
      <summary><span><i class="bi bi-wind"></i> Prakiraan Windy / Open-Meteo Marine</span><span class="src-chip src-live">Prakiraan live</span></summary>
      <p>Lewat <code>api/windy.php</code> (cache 3 jam): Windy Point Forecast (model gfsWave) bila kunci diisi di <code>config/windy.php</code>; bila kosong memakai GFS Wave via Open-Meteo Marine. Jika keduanya gagal, panel menampilkan <b>SIMULASI</b>. Periode puncak Tp dikonversi dengan Te = 0,9·Tp (asumsi).</p>
    </details>

    <details class="dt-det">
      <summary><span><i class="bi bi-houses"></i> Desa acuan: 12 desa dan jumlah penduduk</span><span class="src-chip src-simulasi">Data Simulasi</span></summary>
      <p>Ditulis langsung di <code>assets/js/data.js</code> (<code>DESA</code>); sumber koordinat dan penduduk tidak tercatat dan tidak dapat ditelusuri, sehingga seluruh tabel ini <b>Data Simulasi</b> (bukan data aktual BPS/BIG). Dipakai untuk jarak ke desa terdekat (Haversine) sebagai cadangan skor jarak.</p>
      <?= tabel(['Desa','Kecamatan, kabupaten','Lintang','Bujur','Penduduk'], [
        ['Bayah','Bayah, Lebak','−6,95','106,24','8.500'],['Sawarna','Bayah, Lebak','−6,99','106,32','3.200'],['Binuangeun','Wanasalam, Lebak','−6,84','105,90','6.800'],
        ['Panimbang','Panimbang, Pandeglang','−6,55','105,78','12.400'],['Cibaliung','Cibaliung, Pandeglang','−6,78','105,70','9.100'],['Cikeusik','Cikeusik, Pandeglang','−6,73','105,88','5.400'],
        ['Ujung Kulon (Tamanjaya)','Sumur, Pandeglang','−6,78','105,55','4.100'],['Cilograng','Cilograng, Lebak','−6,92','106,12','7.300'],['Malingping','Malingping, Lebak','−6,78','106,05','15.200'],
        ['Labuan','Labuan, Pandeglang','−6,38','105,62','18.300'],['Caringin','Caringin, Pandeglang','−6,48','105,70','9.800'],['Pelabuhan Ratu','Pelabuhan Ratu, Sukabumi','−6,99','106,55','22.600'],
      ], 'rata') ?>
    </details>

    <details class="dt-det">
      <summary><span><i class="bi bi-geo-alt"></i> Lokasi kandidat &amp; skor MCA: 5 lokasi (data nyata, penapisan awal)</span><span class="src-chip src-asumsi">Asumsi bobot</span></summary>
      <p>Berasal dari <code>database.sql</code> (tabel <code>locations</code>, <code>site_scores</code>, <code>wave_data</code>), dibangkitkan oleh <code>scripts/hitung_kandidat.js</code>. Kandidat dipilih sebagai <b>sel dengan skor tertinggi di tiap ruas pesisir</b> dari grid Zona ECO-WAVE (perairan 5 km, tidak tereksklusi; sel di dalam cakupan data karang/lamun didahulukan). Daya dari IDW CMEMS, gelombang bulanan dari pola CMEMS, dan skor Ekosistem/Kedalaman/Jarak dari layer PLTGL. Bobot, ambang, dan buffer tetap <b>asumsi tim</b>. Kandidat peringkat 1 juga dipakai oleh <b>animasi di Beranda</b>.</p>
      <?= tabel(['Kandidat','Lintang','Bujur','Wilayah','Daya','Eko','Kedalaman','Jarak','Eksklusi','Skor akhir'], [
        ['Cikeusik / Ujung Kulon','−6,665','105,265','Pandeglang','3,29','4','5','2','tidak','3,56'],
        ['Panimbang','−6,885','105,615','Pandeglang','2,93','5','5','2','tidak','3,72'],
        ['Binuangeun','−6,875','105,825','Lebak','2,58','4','5','2','tidak','3,28'],
        ['Bayah','−6,875','106,065','Lebak','2,27','5','5','5','tidak','3,91 *'],
        ['Sawarna','−6,935','106,215','Lebak','2,03','5','5','5','tidak','3,81 *'],
      ], 'rata') ?>
      <p class="note">* Di luar cakupan data karang/lamun: skor Ekosistem 5 berarti <b>tidak ada data</b>, bukan tidak ada ekosistem. Verifikasi sebelum dikutip.</p>
    </details>

    <details class="dt-det">
      <summary><span><i class="bi bi-sliders"></i> Asumsi tim: konversi listrik, bobot, dan ambang</span><span class="src-chip src-asumsi">Asumsi</span></summary>
      <?= tabel(['Asumsi','Nilai awal','Bisa diubah di'], [
        ['Lebar tangkap perangkat','10 m','Kalkulator (Parameter perangkat)'],['Efisiensi konversi','30 %','Kalkulator'],['Faktor kapasitas','30 %','Kalkulator'],
        ['450 / 900 / 1300 VA','113,5 / 164,6 / 229,9 kWh per bulan','Kalkulator (Parameter lanjutan)'],
        ['Bobot MCDA (Daya / Ekosistem / Kedalaman / Jarak)','40 / 30 / 15 / 15 %','Peta (tab Bobot MCA) dan Kalkulator'],
        ['Ambang jarak ekosistem','0,5 / 1 / 2 / 5 km','Kalkulator (Parameter lanjutan)'],['Buffer eksklusi','mangrove 1, karang 1, reef 1, lamun 0,5, pelayaran 0,5 km; konservasi = di dalam','Kalkulator (Parameter lanjutan)'],
      ]) ?>
      <p class="note">Semua nilai ini ditetapkan tim dan perlu dasar literatur, AHP, atau pakar sebelum dipakai di laporan.</p>
    </details>
  </section>

  <!-- ============ ALUR DATA ============ -->
  <section class="info-sec" id="alur-data">
    <h2><span class="no">5</span> Dari berkas mentah sampai ke layar</h2>
    <p class="lead">Perjalanan satu layer spasial sebelum tampil di Peta dan dihitung di Kalkulator.</p>
    <div class="alur-info">
      <div class="stp"><i>1</i><b>Data mentah</b><span>GeoJSON/GeoTIFF asli disimpan di <code>01_raw/</code> dan tidak diedit.</span></div>
      <div class="stp"><i>2</i><b>Penyederhanaan</b><span><code>scripts/prepare_pltgl.py</code>: algoritma Douglas–Peucker dan pembuangan poligon sangat kecil, ±13 MB menjadi ±<?= id_n($TOT_KB/1024,0) ?> MB.</span></div>
      <div class="stp"><i>3</i><b>Berkas web</b><span><code>assets/data/pltgl/*.geojson</code> beserta <code>manifest.json</code> (jumlah fitur, ukuran, kotak studi).</span></div>
      <div class="stp"><i>4</i><b>Analisis di browser</b><span><code>ecowave.js</code>: jarak ke tepi, point-in-polygon, baca grid kedalaman, skor 1–5, MCDA.</span></div>
      <div class="stp"><i>5</i><b>Hasil</b><span>Skor titik, peta zona, peringkat kandidat, dan CSV yang bisa diunduh.</span></div>
    </div>
    <div class="tip"><b>Catatan:</b> penyederhanaan membuat berkas ringan tetapi mengubah data: lihat kolom <i>Jumlah fitur</i> dan <i>Keterbatasan</i> pada karang dan lamun.</div>
  </section>

  <!-- ============ TABEL SUMBER ============ -->
  <section class="info-sec" id="sumber-data">
    <h2><span class="no">6</span> Tabel sumber data lengkap</h2>
    <p class="lead">Setiap data yang dipakai oleh peta, kalkulator, atau grafik. Kolom <b>Sumber / asal</b> hanya memuat yang benar-benar tercatat di berkas proyek.</p>
    <div class="src-legend">
      <?php foreach ($STATUS as $k => $v): ?>
        <span class="src-chip src-<?= $k ?>" title="<?= htmlspecialchars($v[1]) ?>"><?= htmlspecialchars($v[0]) ?></span>
      <?php endforeach; ?>
    </div>
    <div class="src-scroll">
      <table class="src-table" id="dtTabel">
        <thead><tr><th>Data</th><th>Dipakai di</th><th>Sumber / asal</th><th>Berkas di proyek</th><th>Jumlah</th><th>Status</th><th>Catatan</th></tr></thead>
        <?php foreach ($DATA as $grup): ?>
        <tbody>
          <tr class="src-grup"><td colspan="7"><?= htmlspecialchars($grup[0]) ?></td></tr>
          <?php foreach ($grup[1] as $r): $st = $STATUS[$r[5]]; ?>
          <tr data-status="<?= $r[5] ?>" data-teks="<?= htmlspecialchars(strtolower(strip_tags($r[0].' '.$r[1].' '.$r[2].' '.$r[3].' '.$r[6]))) ?>">
            <td><b><?= htmlspecialchars($r[0]) ?></b></td>
            <td><?= htmlspecialchars($r[1]) ?></td>
            <td><?= $r[2] /* sudah berisi entitas HTML yang disengaja */ ?><?php if (!empty($r[7])): ?><br><span class="src-chip src-manual">Hasil manual kelompok</span><?php endif; ?></td>
            <td><code><?= htmlspecialchars($r[3]) ?></code></td>
            <td class="nowrap"><?= htmlspecialchars($r[4]) ?></td>
            <td><span class="src-chip src-<?= $r[5] ?>"><?= htmlspecialchars($st[0]) ?></span></td>
            <td><?= htmlspecialchars($r[6]) ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
        <?php endforeach; ?>
      </table>
    </div>
    <p class="note">Prototipe ini belum memakai data ERA5 maupun BATNAS. Angka CMEMS, desa, kandidat, dan skor bawaan tidak boleh dikutip sebagai hasil ERA5, BATNAS, Allen Coral Atlas, atau analisis ArcGIS sebelum diverifikasi dari berkas aslinya.</p>

  </section>

  <!-- ============ METODE ============ -->
  <section class="info-sec" id="metode">
    <h2><span class="no">7</span> Data &amp; metode estimasi</h2>
    <p class="lead">Ringkasan rumus yang dipakai pada data di atas. Penjelasan lengkap beserta contoh hitung ada di halaman <a href="teknologi.php#gelombang" style="color:#D5B893">Teknologi &amp; Metode</a>.</p>
    <div class="info-card" style="max-width:none">
<ol class="dt-metode">
        <li><b>Gelombang acuan.</b> Data CMEMS 2015–2024 di 4 titik (Hs dan Te = VTM10), dengan <code>P = 0,49 × Hs² × Te</code> (kW/m). Untuk setiap titik yang diklik, nilainya ditebak dengan interpolasi IDW (bobot 1/jarak²) dari keempat titik itu.</li>
        <li><b>Estimasi listrik.</b> <code>P_listrik = P × lebar tangkap (10 m) × efisiensi (30 %) × jumlah unit (1)</code>. Contoh titik P0: 25,57 × 10 × 30 % = 76,7 kW per perangkat.</li>
        <li><b>Estimasi rumah.</b> Rumah (puncak) = P_listrik dalam watt ÷ golongan VA; di P0: 450 VA → 170 rumah, 900 VA → 85, 1300 VA → 59. Rumah (tahunan) = (P_listrik × 8760 jam × faktor kapasitas 15 %) ÷ (kWh per bulan × 12), dengan asumsi 450 VA = 113,5, 900 VA = 164,6, 1300 VA = 229,9 kWh per bulan.</li>
        <li><b>Skor Daya.</b> Mode bawaan memakai skor <i>relatif</i>: <code>1 + 4 × (P − 20,48) ÷ (25,57 − 20,48)</code>, dibatasi 1–5, supaya bobot Daya (40 %) benar-benar membedakan lokasi. Mode <i>absolut</i> (ambang 20 / 15 / 10 / 5 kW/m) tersedia di Parameter lanjutan sebagai pembanding.</li>
        <li><b>Skor Ekosistem.</b> Jarak ke tepi poligon terdekat di antara mangrove, karang, reef, lamun, dan kawasan konservasi: ≤ 0,5 km = 1, 0,5–1 = 2, 1–2 = 3, 2–5 = 4, &gt; 5 km = 5.</li>
        <li><b>Skor Kedalaman.</b> Dibaca dari grid ETOPO1 lalu diubah ke kelas 1–6 (kelas −50 s/d −20 m bernilai tertinggi, yaitu 5).</li>
        <li><b>Skor Jarak.</b> Bawaan: jarak ke gardu atau jalur listrik terdekat (≤ 5 km = 5, 5–10 = 4, 10–20 = 3, 20–40 = 2, &gt; 40 km = 1). Cadangan: jarak Haversine ke desa terdekat (&lt; 2 km = 5, &lt; 5 = 4, &lt; 10 = 3, &lt; 20 = 2, selainnya 1), bisa dipilih lewat mode <i>desa</i> atau <i>rata-rata</i>.</li>
        <li><b>MCDA.</b> <code>Skor akhir = (Daya × 0,40) + (Ekosistem × 0,30) + (Kedalaman × 0,15) + (Jarak × 0,15)</code>, lalu dikali mask eksklusi (0 bila titik terlarang). Kelas: ≥ 4,2 Sangat Layak; 3,4–4,2 Layak; 2,6–3,4 Cukup Layak; 1,8–2,6 Kurang Layak; &lt; 1,8 Tidak Layak; 0 = Gugur.</li>
        <li><b>Eksklusi.</b> Titik gugur bila berada di dalam kawasan konservasi, kurang dari 1 km dari mangrove, karang, atau reef, kurang dari 0,5 km dari lamun atau jalur pelayaran. Jarak selalu diukur ke <b>tepi</b> poligon/garis. Semua buffer adalah asumsi kelompok yang bisa diubah di Parameter lanjutan.</li>
        <li><b>Prakiraan BMKG Maritim.</b> JSON perairan dari BMKG memuat Hs, angin, arus, dan cuaca, tetapi tidak memuat periode gelombang. Karena Te diisi sendiri, daya dari BMKG hanyalah estimasi untuk seluruh zona perairan, dan tidak mengubah skor MCDA.</li>
        <li><b>Keterbatasan.</b> Estimasi rumah masih kasar (belum termasuk rugi kabel, waktu henti, efisiensi inverter, dan profil beban harian), dan semua skor, ambang, serta bobot belum divalidasi. Untuk perencanaan detail perlu studi kelayakan dan survei lapangan.</li>
      </ol>
    </div>
  </section>

  <!-- ============ STUDI LITERATUR ============ -->
  <?php
  $REF = json_decode(@file_get_contents(__DIR__.'/assets/data/referensi.json'), true) ?: ['referensi'=>[]];
  $IND = [
   ['daya','Daya gelombang','40 %','Besar energi gelombang per meter muka gelombang (kW/m) dari CMEMS 2015–2024; sumber energi utama sebuah PLTGL, sehingga diberi bobot terbesar.','Falcão (2010); Nobre dkk. (2009); IDW: Shepard (1968)'],
   ['eko','Ekosistem','30 %','Jarak ke mangrove, karang, reef, lamun, dan kawasan konservasi; makin jauh makin aman. Lokasi terlalu dekat gugur lewat mask eksklusi.','Nobre dkk. (2009); sumber data karang: Lyons dkk. (2020)'],
   ['ked','Kedalaman','15 %','Kedalaman dasar laut dari ETOPO1; menentukan kelayakan pemasangan dan penambatan perangkat.','Nobre dkk. (2009); Amante &amp; Eakins (2009)'],
   ['jar','Jarak infrastruktur','15 %','Jarak ke gardu, jalur listrik (cadangan: desa) yang memengaruhi biaya sambungan listrik.','Nobre dkk. (2009)']
  ];
  ?>
  <section class="info-sec" id="literatur">
    <h2><span class="no">8</span> Studi Literatur dan Referensi Akademis</h2>
    <p class="lead">Dasar akademis pemilihan empat indikator dan bobotnya. Bagian ini sengaja jujur tentang batas dukungan literatur: <b>tidak ada makalah yang kami temukan yang menetapkan rasio 40:30:15:15</b> untuk lokasi PLTGL.</p>

    <div class="lit-catatan" role="note">
      <b>Status bobot 40:30:15:15: asumsi metodologis tim, belum tervalidasi.</b>
      Urutan prioritasnya (daya &gt; ekosistem &gt; kedalaman = jarak) mengikuti logika kesesuaian lokasi, tetapi angkanya bukan hasil dari satu studi tertentu. Pendekatan analisis multikriteria berbasis SIG dengan faktor serupa memang terdokumentasi (Nobre dkk., 2009; Malczewski, 2006). Angka bobot untuk Banten selatan perlu divalidasi, misalnya dengan AHP oleh pakar (Saaty, 2008) dan analisis sensitivitas. Kalkulator sudah menyediakan uji ketahanan untuk melihat apakah peringkat berubah bila bobot digeser.
    </div>

    <h3 class="lit-h">Empat indikator dan dasar pemilihannya</h3>
    <div class="lit-ind">
      <?php foreach ($IND as [$k,$nm,$bw,$uraian,$rujuk]): ?>
      <article class="lit-kartu">
        <header><b><?= $nm ?></b><span class="lit-bobot"><?= $bw ?></span></header>
        <p><?= $uraian ?></p>
        <small>Rujukan: <?= $rujuk ?></small>
      </article>
      <?php endforeach; ?>
    </div>

    <h3 class="lit-h">Pertimbangan untuk bobot</h3>
    <ul class="lit-pert">
      <li><b>Metode gabungan.</b> Skor akhir adalah kombinasi linear terbobot dari skor 1–5 (Malczewski, 2006), dengan mask eksklusi yang menggugurkan lokasi terlarang sebelum bobot berlaku.</li>
      <li><b>Daya terbesar (40 %).</b> Tanpa sumber daya yang memadai, lokasi tidak layak walau ekosistem dan jaringan baik. Ini pertimbangan teknis, bukan hasil kuantitatif.</li>
      <li><b>Ekosistem kedua (30 %).</b> Selaras dengan tujuan situs, yaitu zona yang ramah ekosistem. Sebagian perlindungan sudah ditangani oleh eksklusi (buffer), jadi bobot ini berlaku di antara lokasi yang lolos.</li>
      <li><b>Kedalaman dan jarak (masing-masing 15 %).</b> Dianggap sebagai faktor biaya/teknis yang bisa diatasi rekayasa, sehingga bobotnya lebih rendah. Pembagian sama rata antar keduanya adalah penyederhanaan.</li>
      <li><b>Validasi yang disarankan.</b> (1) AHP dengan pakar energi laut dan ekologi pesisir beserta rasio konsistensi; (2) analisis sensitivitas bobot; (3) pengecekan lapangan pada lokasi berperingkat atas.</li>
    </ul>

    <h3 class="lit-h">Pembanding bobot dari jurnal</h3>
    <p class="lit-ket">Angka di bawah dikutip apa adanya dari makalah yang disebut; bobot situs ini <b>bukan</b> salinan satu makalah. Hasil pembandingan: semua studi memberi bobot terbesar pada sumber daya (daya) dan bobot lebih kecil pada jarak infrastruktur, sejalan dengan urutan 40:30:15:15.</p>
    <div class="lit-ref">
      <article class="lit-kartu"><h4>Kaldellis &amp; Chrysikos (2018), PLTGL, Laut Ionia</h4><dl><dt>Bobot</dt><dd>Gelombang 65 %, jaringan listrik 15 %, pantai 10 %, pelabuhan 10 %.</dd><dt>Catatan</dt><dd><a href="#ref-kaldellis2018">Lihat referensi</a>. Tanpa faktor ekosistem berbobot.</dd></dl></article>
      <article class="lit-kartu"><h4>Feng dkk. (2026), PLTS lepas pantai, Fuzzy-AHP</h4><dl><dt>Bobot</dt><dd>Daya 0,3498 (peringkat 1), kedalaman 0,1880 (peringkat 2).</dd><dt>Catatan</dt><dd><a href="#ref-feng2026">Lihat referensi</a>. Teknologi berbeda; hanya pembanding urutan.</dd></dl></article>
    </div>

    <h3 class="lit-h">Daftar referensi</h3>
    <p class="lit-ket">Diperiksa keberadaannya pada <?= htmlspecialchars($REF['diperiksa'] ?? '') ?>. Kolom relevansi dan keterbatasan adalah penilaian tim, bukan kutipan penulis.</p>
    <div class="lit-ref">
      <?php foreach ($REF['referensi'] as $r): ?>
      <article class="lit-kartu" id="ref-<?= htmlspecialchars($r['id']) ?>">
        <h4><?= htmlspecialchars($r['penulis']) ?> (<?= (int)$r['tahun'] ?>). <i><?= htmlspecialchars($r['judul']) ?></i>. <?= htmlspecialchars($r['sumber']) ?>.</h4>
        <p class="lit-tautan"><?= $r['doi'] ? 'DOI: ' : 'Tautan: ' ?><a href="<?= htmlspecialchars($r['tautan']) ?>" target="_blank" rel="noopener"><?= htmlspecialchars($r['doi'] ?: $r['tautan']) ?></a></p>
        <dl>
          <dt>Relevansi</dt><dd><?= htmlspecialchars($r['relevansi']) ?></dd>
          <dt>Keterbatasan &amp; asumsi</dt><dd><?= htmlspecialchars($r['batasan']) ?></dd>
        </dl>
      </article>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- ============ KUALITAS ============ -->
  <section class="info-sec" id="kualitas">
    <h2><span class="no">9</span> Kualitas data &amp; keterbatasan</h2>
    <p class="lead">Temuan di bawah diperoleh dengan memeriksa langsung berkas data (jumlah fitur, kotak pembatas, atribut). Tingkat: <b>tinggi</b> = bisa mengubah peringkat lokasi, <b>sedang</b> = perlu dicatat di laporan, <b>rendah</b> = informasi tambahan.</p>
    <?php
    $KUAL = [
      ['tinggi','Karang, lamun, dan reef hanya mencakup 105,21–105,82°BT','Di sebelah timurnya (mis. Bayah, Sawarna) tidak ada data. Titik di sana tidak punya karang/lamun terdekat di data, sehingga skor Ekosistem bisa tampak terlalu baik padahal hanya data yang tidak ada. Kalkulator sudah memberi peringatan &ldquo;di luar cakupan data&rdquo;.'],
      ['tinggi','Kandidat Bayah dan Sawarna di luar cakupan data karang/lamun','Skor Ekosistem 5 di dua lokasi itu berarti tidak ada data, bukan tidak ada ekosistem, sehingga peringkat teratas (Bayah, Sawarna) belum terverifikasi.'],
      ['tinggi','Gelombang hanya dari 4 titik CMEMS yang tertanam di kode','Berkas mentah tidak ada sehingga tidak bisa diverifikasi; nilai di dekat pantai hanya interpolasi IDW.'],
      ['sedang','Penyederhanaan membuang poligon kecil','Karang: 872 dari 2.197 poligon dibuang (±40%); lamun: 544 dari 1.264 (±43%). Jarak ke karang/lamun bisa terhitung lebih jauh dari kenyataan.'],
      ['sedang','Jalur pelayaran tidak dipotong ke kotak studi dan bukan alur resmi','Hanya garis yang menyentuh kotak studi yang dipertahankan, tetapi bentuknya tidak dipotong: rute yang tersisa membentang 98,68–107,63°BT (termasuk rute antarpulau seperti Jakarta–Medan). Datanya bergaya OSM, bukan dari Kemenhub/BIG.'],
      ['sedang','Batimetri ETOPO1 kasar (±1,85 km)','Banyak sel dekat pantai terbaca daratan; kedalaman perairan dangkal tidak dapat diandalkan. Poligon kelas juga hanya menutup sebagian kotak studi.'],
      ['sedang','Nama kawasan konservasi generik','Ke-67 poligon bernama sama (&ldquo;Konservasi Laut&rdquo;), jadi status hukum tiap kawasan tidak dapat ditelusuri.'],
      ['rendah','Pelabuhan dan gardu masing-masing hanya 1 titik','Tidak lengkap sebagai gambaran infrastruktur. Pelabuhan tidak masuk perhitungan, dan skor Jarak praktis ditentukan oleh jalur listrik.'],
      ['rendah','Perairan 5 km hanya sampai 106,40°BT','Zona grid ECO-WAVE tidak menilai bagian timur kotak studi (sampai 107°BT).'],
    ];
    ?>
    <div class="dt-kual">
      <?php foreach ($KUAL as $q): ?>
      <details class="dt-q dt-q-<?= $q[0] ?>">
        <summary><span class="dt-tag"><?= $q[0] ?></span><b><?= $q[1] ?></b></summary>
        <div class="dt-q-isi"><p><b>Temuan.</b> <?= $q[2] ?></p></div>
      </details>
      <?php endforeach; ?>
    </div>
    <p class="note">Keterbatasan estimasi listrik: belum termasuk rugi kabel, downtime, efisiensi inverter, dan profil beban harian; untuk perencanaan detail perlu studi kelayakan dan survei lapangan.</p>
  </section>

  <!-- ============ ERA5 & PEMELIHARAAN ============ -->
  <section class="info-sec" id="pengembangan">
    <h2><span class="no">10</span> Tahap pengembangan: data yang belum lengkap dan pemeliharaan</h2>
    <p class="lead">ECO-WAVE masih berada di tahap awal (prototipe), jadi ada data yang belum lengkap: data ekosistem (mangrove, lamun, karang) belum mencakup seluruh pesisir, dan data gelombang ERA5 belum dimasukkan. Bagian ini menjelaskan dampaknya pada skor, rencana tahap berikutnya, dan pemeliharaan yang akan dilakukan seiring berjalannya web.</p>

    <h3 id="data-ekosistem">Data mangrove, lamun, dan karang belum mencakup seluruh pesisir</h3>
    <p>Data ekosistem yang kami olah hanya mencakup sebagian wilayah studi, karena sumber yang tersedia saat ini memang hanya memberi data sebanyak itu. Untuk titik di luar cakupan, peta tidak menemukan mangrove, lamun, atau karang di dekatnya, sehingga skor Ekosistem otomatis bernilai tinggi (5 = jauh dari ekosistem sensitif). <b>Skor tinggi di sana berarti datanya belum ada, bukan berarti lokasi itu pasti aman bagi ekosistem.</b></p>
    <?= tabel(['Data','Cakupan saat ini','Belum tercakup'], [
      ['Terumbu karang (1.325 poligon)','Bujur 105,21–105,82°BT, sekitar Ujung Kulon sampai Binuangeun','Pesisir di sebelah timurnya: Bayah, Sawarna, Cilograng, dan sekitarnya'],
      ['Lamun (720 poligon)','Bujur 105,21–105,82°BT, sama dengan karang','Pesisir di sebelah timur 105,82°BT'],
      ['Reef (155 poligon)','Bujur 105,21–105,82°BT, sama dengan karang','Pesisir di sebelah timur 105,82°BT'],
      ['Mangrove (247 poligon)','Hanya di utara 6,84°LS','Pesisir selatan Banten di bawah 6,84°LS, termasuk Bayah dan Sawarna'],
    ]) ?>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Dampak</span><h4>Mengapa ada lokasi yang poinnya sangat tinggi?</h4><p>Bayah dan Sawarna berada di luar cakupan keempat data di atas, sehingga skor Ekosistemnya 5. Karena bobot Ekosistem 30%, nilai ini ikut mendorong keduanya ke peringkat teratas di Lokasi Terbaik.</p></div>
      <div class="info-card"><span class="tag">Cara membaca</span><h4>Anggap &ldquo;belum diketahui&rdquo;</h4><p>Di luar cakupan, baca skor Ekosistem sebagai &ldquo;belum diketahui&rdquo;. Peta dan Kalkulator menampilkan garis batas cakupan data karang/lamun, dan Lokasi Terbaik memberi label &ldquo;di luar cakupan data&rdquo; pada kandidat seperti ini.</p></div>
      <div class="info-card"><span class="tag">Rencana</span><h4>Melengkapi data</h4><p>Data mangrove, lamun, dan karang untuk pesisir timur akan dilengkapi pada tahap berikutnya, dari sumber dengan cakupan lebih luas atau survei lapangan. Setelah itu skor dan peringkat kandidat dihitung ulang.</p></div>
    </div>

    <h3 id="era5">Data gelombang ERA5 belum dimasukkan</h3>
    <p>Pada tahap ini data gelombang memakai CMEMS 2015–2024 di 4 titik acuan, sedangkan data ERA5 belum dimasukkan.</p>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Tentang ERA5</span><h4>Apa itu ERA5?</h4><p>Reanalisis iklim global generasi kelima dari ECMWF yang diterbitkan Copernicus Climate Change Service (C3S). Datanya tersedia per jam sejak 1940 sampai sekarang, termasuk tinggi dan periode gelombang pada grid 0,5° (sekitar 55 km), dan diperbarui setiap hari.</p></div>
      <div class="info-card"><span class="tag">Status</span><h4>Mengapa belum dimasukkan?</h4><p>Tahap awal difokuskan untuk membangun alur analisis: peta, skor MCDA, kalkulator, dan data ekosistem. Agar rumus dan tampilan bisa diuji lebih dulu, dipakai data acuan CMEMS yang ringkas. Data ERA5 berukuran besar dan perlu diolah serta diperiksa sebelum bisa menggantikan angka yang ada.</p></div>
      <div class="info-card"><span class="tag">Manfaat</span><h4>Apa yang berubah nanti?</h4><p>Rentang data lebih panjang (rencananya 2010–2024) dan titik grid lebih banyak di sepanjang pesisir selatan Banten, sehingga estimasi daya gelombang tidak lagi bergantung pada 4 titik saja. ERA5 juga dipakai untuk memeriksa ulang angka CMEMS.</p></div>
    </div>
    <h3>Tahapan pengembangan</h3>
    <div class="alur-info">
      <div class="stp"><i>1</i><b>Sekarang: prototipe</b><span>CMEMS 4 titik, data ekosistem sebagian, data infrastruktur, skor MCDA, serta kalkulator sudah berjalan.</span></div>
      <div class="stp"><i>2</i><b>Melengkapi data</b><span>Mangrove, lamun, dan karang pesisir timur dilengkapi; ERA5 2010–2024 diolah menjadi daya gelombang (kW/m).</span></div>
      <div class="stp"><i>3</i><b>Memeriksa</b><span>Data baru dicek di peta, dan angka ERA5 dibandingkan dengan CMEMS di lokasi yang sama sebelum dipakai.</span></div>
      <div class="stp"><i>4</i><b>Dipakai di web</b><span>Data ekosistem yang lebih lengkap dan titik ERA5 masuk ke Peta, Kalkulator, dan peringkat; sumber tiap data tetap dicantumkan.</span></div>
      <div class="stp"><i>5</i><b>Pemeliharaan</b><span>Data, layanan, dan asumsi diperbarui berkala sesuai tabel di bawah.</span></div>
    </div>
    <h3>Pemeliharaan berkala</h3>
    <?= tabel(['Yang dipelihara','Kapan','Tujuan'], [
      ['Data gelombang (CMEMS, lalu ERA5)','Setahun sekali','Menambah tahun terbaru agar rata-rata dan pola musiman tetap mutakhir.'],
      ['Layer ekosistem dan infrastruktur','Saat ada rilis data baru','Memperbarui mangrove, karang, lamun, dan jaringan listrik, termasuk memperluas cakupan ke Bayah–Sawarna.'],
      ['Prakiraan BMKG Maritim dan Windy','Rutin, terutama awal tahun','Memastikan prakiraan tetap tersambung dan zona perairannya masih sesuai.'],
      ['Bobot dan ambang skor','Setelah validasi pakar (AHP)','Mengganti asumsi tim dengan dasar yang sudah teruji.'],
      ['Keamanan dan pustaka web','Berkala','Memperbarui pustaka peta dan grafik serta memeriksa akses admin.'],
      ['Pengecekan hasil','Setiap kali ada pembaruan','Memastikan Peta dan Kalkulator tetap memberi angka yang sama.'],
    ]) ?>
    <p class="note">Selama ERA5 belum dimasukkan, semua angka gelombang di web ini berasal dari CMEMS dan tidak boleh dikutip sebagai hasil ERA5. Bila data sudah diperbarui, sumber dan rentang tahunnya akan disesuaikan di halaman ini.</p>
  </section>

  <!-- ============ CARA MEMAKAI & MENGUTIP ============ -->
  <section class="info-sec" id="kutip">
    <h2><span class="no">11</span> Cara memakai dan mengutip data ini</h2>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Boleh</span><h4>Penapisan awal</h4><p>Membandingkan lokasi secara relatif, melihat pengaruh bobot, dan menemukan area yang layak diperiksa lebih lanjut.</p></div>
      <div class="info-card"><span class="tag">Hati-hati</span><h4>Menyebut sumber</h4><p>Sebut asal dan statusnya: &ldquo;hasil manual kelompok&rdquo; (mangrove, konservasi, perairan 5 km, desa, kandidat), &ldquo;data acuan CMEMS&rdquo;, &ldquo;data nyata&rdquo;, atau &ldquo;asumsi kelompok&rdquo;. Jangan menyebut ERA5, BATNAS, atau ArcGIS karena belum dipakai.</p></div>
      <div class="info-card"><span class="tag">Jangan</span><h4>Keputusan final</h4><p>Skor, ambang, dan bobot belum divalidasi. Potensi gelombang (kW/m) bukan listrik terbangkit. Keputusan lokasi butuh survei dan studi kelayakan.</p></div>
    </div>
    <div class="tip"><b>Memverifikasi sendiri:</b> aktifkan layer di Peta (tab Map / Layer), bandingkan dengan data aslinya, lalu periksa jarak sebuah titik di <a href="kalkulator.php#k-jarak" style="color:#D5B893">Kalkulator</a>. Jarak selalu dihitung ke <b>tepi</b> poligon/garis, bukan ke pusatnya.</div>
  </section>

  <!-- ============ TIM ============ -->
  <section class="info-sec" id="tim">
    <h2>Pembagian tugas</h2>
    <?= tabel(['Anggota','Bagian'], [['Anggota 1','ERA5 / CMEMS / Python'],['Anggota 2','Ekosistem / ArcGIS'],['Anggota 3','Database / WebGIS']]) ?>
  </section>

</div>
<?php include __DIR__.'/includes/foot.php'; ?>
