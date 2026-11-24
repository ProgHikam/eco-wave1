<?php $page='teknologi'; $title='ECO-WAVE - Teknologi & Metode'; $libs=[]; $js=[]; include __DIR__.'/includes/head.php'; require_once __DIR__.'/includes/info_helper.php'; ?>
<link rel="stylesheet" href="assets/css/halaman-info.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-info.css') ?: 1 ?>">
<div class="info-wrap">

  <div class="page-head band">
    <h1>Teknologi, Rumus &amp; Metode</h1>
    <p>Penjelasan lengkap ECO-WAVE: teknologi yang dipakai, fungsi tiap bagian, rumus beserta parameternya, cara MCDA menilai lokasi, keamanan login, dan untuk apa data BMKG dipakai. Semua angka di halaman ini diambil dari kode dan data situs versi sekarang.</p>
  </div>

  <nav class="info-toc" aria-label="Isi halaman">
    <a href="#alur">Gambaran besar</a><a href="#stack">Teknologi</a><a href="#gelombang">Daya gelombang</a><a href="#listrik">Listrik &amp; rumah</a>
    <a href="#spasial">Jarak &amp; spasial</a><a href="#skor">Tabel skor</a><a href="#mcda">MCDA</a><a href="#eksklusi">Eksklusi</a>
    <a href="#uji">Uji sensitivitas</a><a href="#bmkg">BMKG</a><a href="#sumber">3 sumber gelombang</a><a href="#keamanan">Login &amp; keamanan</a>
    <a href="#halaman">Halaman &amp; API</a><a href="#glosarium">Istilah</a>
  </nav>

  <!-- ===================== FITUR WEB: ada di tentang_web.php ===================== -->
  <div class="tip" id="fitur-web"><b>Mencari daftar fitur?</b> Daftar semua fitur situs beserta tautan langsungnya ada di halaman <a href="tentang_web.php#fitur" style="color:#D5B893;text-decoration:underline">Tentang Web</a>. Sumber dan keandalan tiap data ada di <a href="tentang.php" style="color:#D5B893;text-decoration:underline">Tentang Data</a>.</div>

  <div class="tip" id="ringkas"><b>Ringkasan 1 menit:</b> ECO-WAVE menghitung <b>daya gelombang</b> (<code>P = 0,49·Hs²·Te</code>), mengubahnya menjadi <b>estimasi listrik dan jumlah rumah</b>, mengukur <b>jarak ke ekosistem, kedalaman, dan jaringan listrik</b>, lalu menggabungkan empat skor (Daya 40 %, Ekosistem 30 %, Kedalaman 15 %, Jarak 15 %) menjadi satu skor kelayakan. Titik yang berada di zona terlarang langsung digugurkan. Semua rumus ada di bagian 3 sampai 9, dan semua ambang adalah asumsi kelompok yang bisa diubah.</div>

  <!-- ===================== 1. GAMBARAN BESAR ===================== -->
  <section class="info-sec" id="alur">
    <h2><span class="no">1</span> Gambaran besar: dari gelombang ke keputusan lokasi</h2>
    <p class="lead">ECO-WAVE adalah WebGIS <b>penapisan awal</b> lokasi Pembangkit Listrik Tenaga Gelombang Laut (PLTGL) di pesisir selatan Banten. Artinya: web ini membantu menyaring lokasi yang <i>layak diperiksa lebih lanjut</i>, bukan memutuskan lokasi final. Prosesnya selalu berurutan seperti ini:</p>
    <div class="alur-info">
      <div class="stp"><i>1</i><b>Data gelombang</b><span>Hs &amp; periode dari CMEMS (acuan), BMKG dan Windy/Open-Meteo (prakiraan).</span></div>
      <div class="stp"><i>2</i><b>Daya gelombang</b><span>Hitung kW per meter muka gelombang: <code>P = 0,49·Hs²·Te</code>.</span></div>
      <div class="stp"><i>3</i><b>Estimasi listrik</b><span>Kalikan lebar tangkap, efisiensi, dan jumlah unit, lalu konversi ke jumlah rumah.</span></div>
      <div class="stp"><i>4</i><b>Analisis spasial</b><span>Ukur jarak ke mangrove, karang, lamun, konservasi, jalur pelayaran, kedalaman, gardu &amp; jalur listrik.</span></div>
      <div class="stp"><i>5</i><b>MCDA &amp; eksklusi</b><span>Ubah tiap kriteria jadi skor 1–5, gabungkan berbobot, gugurkan zona terlarang.</span></div>
      <div class="stp"><i>6</i><b>Peringkat</b><span>Peta skor, daftar Lokasi Terbaik, uji sensitivitas, unduh CSV/GeoJSON.</span></div>
    </div>
    <div class="tip"><b>Kenapa perlu begini?</b> Lokasi dengan gelombang terbesar belum tentu terbaik: bisa saja berada di atas terumbu karang, di kawasan konservasi, di alur kapal, atau sangat jauh dari jaringan listrik. Web ini menggabungkan semua pertimbangan itu dalam satu skor yang bisa diperiksa dan diubah bobotnya.</div>
  </section>

  <!-- ===================== 2. TEKNOLOGI ===================== -->
  <section class="info-sec" id="stack">
    <h2><span class="no">2</span> Teknologi yang dipakai dan fungsinya</h2>
    <p class="lead">Dikelompokkan menurut tempat berjalannya: di browser pengunjung, di server, saat mengolah data, dan layanan luar yang dipanggil.</p>

    <h3>Di browser (tampilan &amp; perhitungan)</h3>
    <?= tabel(['Teknologi','Fungsi di ECO-WAVE','Dipakai di'], [
      ['HTML + CSS + JavaScript murni', 'Kerangka halaman, tema &ldquo;Ocean Power&rdquo;, dan seluruh logika klik/hitung tanpa framework berat.', 'Semua halaman (<code>assets/css/tema.css</code>, <code>assets/js/*.js</code>)'],
      ['Leaflet 1.9.4', 'Peta interaktif: zoom, geser, layer GeoJSON, penanda, popup, dan klik untuk memilih titik.', 'Peta, Kalkulator'],
      ['Chart.js 4.4.1', 'Grafik garis/batang: tren daya, perbandingan lokasi, deret prakiraan BMKG &amp; Windy.', 'Peta, Kalkulator'],
      ['html2canvas 1.4.1', 'Menyimpan panel detail lokasi menjadi gambar PNG.', 'Peta (tombol Simpan PNG)'],
      ['Mesin ECO-WAVE <code>ecowave.js</code>', 'Pustaka hitung murni (tanpa DOM): jarak spasial, kedalaman, skor, MCDA, energi, zona grid, ekspor, dan pembaca JSON BMKG. Bisa dijalankan di Node untuk pengujian.', 'Peta, Kalkulator, Lokasi Terbaik, <code>tests/test_engine.js</code>'],
      ['Papan status bersama (localStorage + BroadcastChannel)', 'Bobot MCA, eksklusi, musim, parameter perangkat, dan cache BMKG disimpan di satu papan status (<code>ecowave_state_v1</code>) sehingga Peta, Kalkulator, Lokasi Terbaik, dan Beranda memakai nilai yang sama dan ikut berubah saat tab lain diubah. sessionStorage tetap ditulis sebagai cadangan.', '<code>assets/js/core.js</code>'],
      ['Peta dasar', 'Esri (Gelap, Laut, Satelit, Jalan, Topografi) dan OpenStreetMap. Pilihan peta dasar diingat di localStorage; bila Esri gagal dimuat, otomatis pindah ke OSM.', '<code>assets/js/peta_gaya.js</code>'],
      ['Salinan pustaka lokal (opsional)', 'Bila folder <code>assets/vendor/</code> berisi Leaflet, Chart.js, html2canvas, dan ikon (dibuat dengan <code>python scripts/unduh_vendor.py</code>), situs memakainya dan tetap jalan tanpa CDN. Bila tidak ada, pustaka dimuat dari CDN.', '<code>includes/head.php</code>'],
      ['Bootstrap Icons, Google Fonts', 'Ikon dan huruf (Plus Jakarta Sans, Inter, Sora). Tanpa internet, browser memakai font sistem cadangan.', 'Semua halaman'],
    ]) ?>

    <h3>Di server</h3>
    <?= tabel(['Teknologi','Fungsi di ECO-WAVE','Dipakai di'], [
      ['PHP', 'Merakit halaman (<code>includes/head.php</code>, <code>foot.php</code>), sesi login, dan endpoint API.', 'Semua <code>*.php</code>'],
      ['MySQL: PDO (data) dan mysqli (login)', 'Menyimpan lokasi kandidat, skor, data gelombang bulanan, bobot MCA, dan pengguna. API data memakai PDO prepared statement (mencegah SQL injection); login memakai mysqli prepared statement. Satu sumber pengaturan: <code>config/config.php</code>, dapat ditimpa <code>config/config.local.php</code> atau variabel lingkungan <code>ECOWAVE_DB_*</code>.', '<code>database.sql</code>, <code>config/</code>, <code>api/*.php</code>'],
      ['Sesi, peran, dan keamanan login', 'Halaman Kelola dan perubahan lokasi hanya untuk admin; dicek di server, bukan hanya disembunyikan di tampilan. Rinciannya di <a href="#keamanan">bagian 12</a>.', '<code>config/auth.php</code>, <code>admin.php</code>, <code>api/locations.php</code>'],
      ['Proxy API + cache berkas', 'Server yang memanggil BMKG/Windy, sehingga kunci API tidak terlihat di browser dan permintaan tidak berulang-ulang. Cache BMKG 30 menit, Windy/Open-Meteo 3 jam.', '<code>api/bmkg.php</code>, <code>api/windy.php</code>'],
    ]) ?>

    <h3>Saat mengolah data (offline, sebelum dipasang ke web)</h3>
    <?= tabel(['Teknologi','Fungsi di ECO-WAVE','Berkas'], [
      ['Python (xarray, numpy, pandas, rasterio)', 'Mengolah NetCDF ERA5 menjadi daya gelombang tahunan &amp; musiman (raster dan CSV). Disiapkan untuk tahap berikutnya.', '<code>scripts/process_era5.py</code>'],
      ['Python: penyederhanaan Douglas–Peucker', 'Memilih fitur GeoJSON mentah yang menyentuh kotak studi (bentuknya tidak dipotong), menyederhanakan geometri, dan membulatkan koordinat agar peta ringan. Berkas asli tidak diubah.', '<code>scripts/prepare_pltgl.py</code>'],
      ['Python: indeks pencarian', 'Membaca teks halaman lalu menulis <code>assets/data/cari_indeks.json</code> untuk pencarian kata kunci.', '<code>scripts/bangun_indeks_cari.py</code>'],
      ['GeoJSON (EPSG:4326) &amp; GeoTIFF', 'Format data spasial. Raster ETOPO1 diubah menjadi grid JSON kedalaman (151×122 sel).', '<code>assets/data/pltgl/</code>'],
      ['ArcGIS (rencana)', 'Reproject ke EPSG:32748, Clip, Reclassify 1–5, Euclidean Distance, Weighted Overlay.', '<code>03_arcgis/</code>'],
      ['Node.js', 'Menjalankan uji otomatis mesin hitung (termasuk deteksi daratan), pencarian, aksesibilitas, bahasa, impor, kandidat, dan konsistensi Peta–Kalkulator.', '<code>tests/test_engine.js</code>, <code>test_cari.js</code>, <code>test_aksesibilitas.js</code>, <code>test_bahasa.js</code>, <code>test_impor.js</code>, <code>test_kandidat.js</code>, <code>test_konsistensi.js</code>'],
    ]) ?>

    <h3>Layanan luar yang dipanggil</h3>
    <?= tabel(['Layanan','Fungsi','Catatan'], [
      ['BMKG Maritim', 'Prakiraan gelombang, angin, arus, cuaca per zona perairan (lihat <a href="#bmkg">bagian 10</a>).', 'Tanpa kunci; cache 30 menit.'],
      ['Windy Point Forecast / Open-Meteo Marine', 'Prakiraan Hs &amp; periode (model GFS Wave) per titik.', 'Windy butuh kunci di <code>config/windy.php</code>; bila kunci belum diisi, otomatis memakai Open-Meteo.'],
      ['Peta Windy tertanam', 'Tampilan peta gelombang Windy di panel Peta (hanya untuk dilihat, bukan masukan hitungan).', 'Butuh internet.'],
      ['Esri World Street Map, OpenStreetMap', 'Peta dasar.', 'Otomatis pindah ke OSM bila Esri gagal.'],
      ['CMEMS (Copernicus Marine)', 'Sumber data gelombang acuan 2015–2024.', 'Tertanam di <code>data.js</code> (4 titik).'],
    ]) ?>
  </section>

  <!-- ===================== 3. GELOMBANG ===================== -->
  <section class="info-sec" id="gelombang">
    <h2><span class="no">3</span> Rumus daya gelombang</h2>
    <p class="lead">Daya gelombang menyatakan seberapa besar energi yang lewat setiap <b>1 meter</b> lebar muka gelombang. Makin tinggi dan makin panjang periodenya, makin besar dayanya, dan tinggi gelombang berpengaruh <i>kuadrat</i>.</p>
    <div class="rumus">P = 0,49 × Hs² × Te        (satuan: kW per meter, kW/m)
<small>Hs = tinggi gelombang signifikan (m) · Te = periode energi (detik)</small></div>
    <?= tabel(['Parameter','Arti','Asal nilai'], [
      ['Hs','Rata-rata sepertiga gelombang tertinggi. Ukuran standar &ldquo;tinggi gelombang&rdquo;.','CMEMS, BMKG (<code>wave_height</code>), Windy/Open-Meteo'],
      ['Te','Periode energi: waktu antar gelombang yang membawa energi. Makin besar makin kuat.','CMEMS: langsung (VTM10). Windy/Open-Meteo: <code>Te = 0,9 × Tp</code> (asumsi proyek). BMKG: <b>tidak ada</b>, diisi pengguna.'],
      ['0,49','Konstanta gabungan <code>ρ·g² / (64π)</code> dengan ρ air laut ≈ 1025 kg/m³ dan g = 9,81 m/s². Hasil hitung: 0,4906.','Fisika gelombang air dalam'],
    ]) ?>
    <div class="contoh"><b class="t">Contoh hitung (titik P0)</b>Hs = 2,13 m, Te = 10,76 s → 0,49 × 2,13² × 10,76 ≈ <b>23,9 kW/m</b> dari rata-rata Hs &amp; Te. Angka yang dipakai web (<b>25,57 kW/m</b>) adalah rata-rata daya dari seluruh deret waktu 2015–2024; keduanya berbeda karena rata-rata dari <i>hasil kali</i> tidak sama dengan hasil kali dari <i>rata-rata</i>.</div>
    <div class="warn"><b>Batas rumus:</b> ini rumus <b>air dalam</b>. Ia akurat bila kedalaman lebih dari ± setengah panjang gelombang (≈ 90 m untuk Te 11 detik). Di dekat pantai yang dangkal, gelombang berubah (refraksi/shoaling) dan rumus ini hanya perkiraan kasar. Web ini belum memodelkan perubahan itu.</div>

    <h3>Interpolasi IDW: menebak daya di titik yang diklik</h3>
    <p>Data CMEMS hanya ada di 4 titik. Saat peta diklik, nilai Hs, Te, dan P di titik itu ditebak dari keempat titik dengan <b>IDW (Inverse Distance Weighting)</b>: titik acuan yang lebih dekat diberi pengaruh lebih besar.</p>
    <div class="rumus">bobot_i = 1 / d_i²        nilai = Σ (bobot_i × nilai_i) / Σ bobot_i
<small>d_i = jarak titik klik ke titik acuan i (dalam derajat, minimum 0,001) · berlaku untuk Hs, Te, P, median</small></div>
    <?= tabel(['Titik acuan','Lintang','Bujur','P rata-rata (kW/m)','Hs (m)','Te (s)'], [
      ['P0 Utama','−8,00','104,60','25,57','2,13','10,76'],
      ['P1 Ujung Kulon','−7,20','105,20','23,90','2,04','10,91'],
      ['P2 Binuangeun','−7,30','106,00','22,59','1,97','11,09'],
      ['P3 Bayah–Sawarna','−7,35','106,30','20,48','1,84','11,44'],
    ], 'rata') ?>
    <div class="warn"><b>Batas IDW:</b> keempat titik berada di lepas pantai. Nilai di dekat pantai, di dalam teluk, atau di Selat Sunda adalah <b>ekstrapolasi</b>, bukan pengukuran. Karena itu zona grid tidak menilai perairan di utara lintang −6,60.</div>

    <h3>Pola musiman dan estimasi saat peta diklik</h3>
    <p>Daya tertinggi terjadi saat <b>musim timur (Jun–Agu): ±36,35 kW/m</b>, terendah saat musim barat (Des–Feb): ±18,06 kW/m. Peralihan I (Mar–Mei) ±23,00 dan peralihan II (Sep–Nov) ±24,72. Bulan tertinggi adalah Juli (39,14 kW/m) dan terendah Februari (17,51 kW/m).</p>
    <p>Hasil klik pada peta menampilkan estimasi <b>bulanan dan musiman</b> di titik itu, lengkap dengan listrik dan rumah 450 VA tiap musim. Caranya: klimatologi P0 dikalikan rasio <code>daya IDW titik ÷ daya P0</code>. Asumsinya, pola musiman sama di seluruh area; ini perkiraan, bukan deret ukur di titik tersebut.</p>
  </section>

  <!-- ===================== 4. LISTRIK ===================== -->
  <section class="info-sec" id="listrik">
    <h2><span class="no">4</span> Rumus estimasi listrik dan jumlah rumah</h2>
    <p class="lead">Daya gelombang (kW/m) baru berupa potensi di laut. Untuk membayangkan manfaatnya, web mengubahnya menjadi perkiraan listrik dari perangkat yang dipasang dan jumlah rumah yang bisa dilayani.</p>
    <div class="rumus">P_muka_gelombang = P × Lebar tangkap
P_listrik        = P_muka_gelombang × Efisiensi × Jumlah unit      (kW)
Energi_tahunan   = P_listrik × 8760 jam × Faktor kapasitas        (kWh/tahun)

Rumah (puncak)   = ⌊ P_listrik × 1000 ÷ VA ⌋
Rumah (tahunan)  = ⌊ Energi_tahunan ÷ (kWh per bulan × 12) ⌋</div>
    <?= tabel(['Parameter','Nilai awal','Arti','Bisa diubah?'], [
      ['Lebar tangkap','10 m','Lebar muka gelombang yang ditangkap satu perangkat.','Ya (Kalkulator → Parameter lanjutan)'],
      ['Efisiensi','30 %','Bagian energi gelombang yang berhasil menjadi listrik.','Ya'],
      ['Faktor kapasitas (CF)','15 %','Energi nyata setahun dibanding energi maksimum. Literatur yang dirujuk melaporkan sekitar 6–22%, jadi 15% dipilih konservatif (lihat Rujukan di bawah).','Ya'],
      ['Jumlah unit','1','Berapa perangkat yang dipasang.','Ya'],
      ['450 VA / 900 VA / 1300 VA','113,5 / 164,6 / 229,9 kWh per bulan','Pemakaian rata-rata rumah tangga per golongan dari satu penelitian (Unigoro). Kelas 1300 VA memakai angka golongan 1200 VA. Pembanding nasional: 900 VA RTM rata-rata 104,61 kWh/bulan (CNBC Indonesia, 2019).','Ya'],
    ], 'rata') ?>
    <div class="contoh"><b class="t">Contoh hitung (P0 = 25,57 kW/m, 1 unit)</b>
      25,57 × 10 m = 255,7 kW di muka gelombang → × 30 % = <b>76,7 kW listrik</b>.<br>
      Rumah (puncak): 76.710 W ÷ 450 = <b>170</b>, ÷ 900 = <b>85</b>, ÷ 1300 = <b>59</b> rumah.<br>
      Energi tahunan: 76,71 × 8760 × 15 % ≈ <b>100.797 kWh</b> → rumah (tahunan): 450 VA ≈ <b>74</b>, 900 VA ≈ <b>51</b>, 1300 VA ≈ <b>36</b>.</div>
    
    <h3 id="rujukan-konversi" style="margin:22px 0 8px">Rujukan untuk asumsi konversi listrik</h3>
    <?= tabel(['Asumsi','Rujukan','Yang dipakai / catatan','Status pengecekan'], [
      ['Daya gelombang P = 0,49·Hs²·Te','<a href="https://arxiv.org/pdf/1806.02654" target="_blank" rel="noopener">Tesis (arXiv 1806.02654)</a>; <a href="https://projects.noc.ac.uk/windwavesSIG/sites/windwaves/files/documents/T06_Kamranzad.pdf" target="_blank" rel="noopener">Kamranzad (ERA5)</a>; <a href="https://tethys-engineering.pnnl.gov/publications/global-wave-energy-resource-assessment" target="_blank" rel="noopener">Cornett (2008)</a>','Rumus potensi gelombang laut dalam (kW/m). Te = 0,9·Tp adalah asumsi tambahan.','Rujukan dari tim; rumus umum.'],
      ['Efisiensi 30% (capture width ratio)','<a href="https://tethys-engineering.pnnl.gov/publications/database-capture-width-ratio-wave-energy-converters" target="_blank" rel="noopener">Babarit (2015)</a>; <a href="https://mdpi.com/1996-1073/12/22/4329/htm" target="_blank" rel="noopener">Review WEC (MDPI)</a>; <a href="https://tethys-engineering.pnnl.gov/sites/default/files/publications/Ning_et_al_2021.pdf" target="_blank" rel="noopener">Ning dkk. (2021)</a>; <a href="https://tethys-engineering.pnnl.gov/sites/default/files/publications/Ticona-Rollano-et-al-2025.pdf" target="_blank" rel="noopener">Ticona Rollano dkk. (2025)</a>','Babarit mendefinisikan CWR = daya terserap ÷ (daya gelombang × lebar perangkat) sebagai rata-rata tahunan, sama dengan cara web ini mengalikan efisiensi dengan lebar tangkap. Angka sekitar 29% berasal dari sumber sekunder (ResearchGate) dan belum dicek langsung di tabel Babarit.','Definisi CWR terverifikasi. Angka 30% perlu dicek di tabel Babarit.'],
      ['Faktor kapasitas 15%','<a href="https://re.public.polimi.it/bitstream/11311/1049407/4/11311-1049407_Bozzi.pdf" target="_blank" rel="noopener">Bozzi dkk. (Mediterania)</a>; <a href="https://hal.archives-ouvertes.fr/hal-01897275" target="_blank" rel="noopener">Guillou &amp; Chapalain (2018)</a>; <a href="https://tethys-engineering.pnnl.gov/sites/default/files/publications/Majidi_et_al_2025.pdf" target="_blank" rel="noopener">Majidi dkk. (2025)</a>; <a href="https://core.ac.uk/download/19136673.pdf" target="_blank" rel="noopener">Jarocki (2010)</a>; <a href="https://www.ufpe.br/en/ppgem/todas-as-noticias/-/asset_publisher/DnjTMnUgWWon/content/artigo-escrito-por-pesquisadores-do-ppgem-e-publicado-em-periodico-internacional-qualis-a1/39838" target="_blank" rel="noopener">UFPE (PLOS ONE)</a>','Rentang yang dirujuk: sekitar 6–15% (pontoon), 18% (Pelamis, Jarocki), dan 21,85% (Pelamis, Brasil). Nilai 15% dipilih konservatif. Faktor kapasitas literatur biasanya terhadap daya terpasang, sedangkan web ini mengalikannya dengan daya rata-rata sehingga hasil energi cenderung konservatif (batas bawah).','Angka dikutip dari daftar rujukan tim dan belum dicek di dokumen aslinya. Cek sebelum dikutip di laporan.'],
      ['Konsumsi rumah tangga','<a href="https://repository.unigoro.ac.id/4457/6/bab5.pdf" target="_blank" rel="noopener">Skripsi Unigoro (bab 5)</a>; <a href="https://www.cnbcindonesia.com/news/20190705105234-4-82901/pengguna-listrik-900-watt-bebani-apbn-tahun-depan-naik-tarif" target="_blank" rel="noopener">CNBC Indonesia (2019)</a>','Unigoro: 450 VA 113,5; 900 VA 164,6; 1200 VA 229,9 kWh/bulan (sampel penelitian kecil). CNBC (data Ditjen Ketenagalistrikan ESDM): rata-rata 900 VA RTM 104,61 kWh/bulan secara nasional. Memakai angka nasional untuk 900 VA akan menaikkan jumlah rumah terlayani sekitar 57%.','Kedua angka sudah dicek di dokumen sumber.'],
    ], 'rata') ?>
    <div class="warn"><b>Batas klaim:</b> semua angka di atas adalah asumsi literatur, bukan hasil pengukuran di perairan Banten Selatan. Jumlah rumah terlayani adalah perkiraan kasar dan belum memakai data perangkat tertentu.</div>
    <div class="tip"><b>Dua cara menghitung rumah:</b> &ldquo;puncak&rdquo; membagi daya dengan VA (anggap semua rumah memakai penuh dayanya bersamaan), sedangkan &ldquo;tahunan&rdquo; membagi energi setahun dengan pemakaian bulanan. Hasil tahunan lebih realistis, hasil puncak lebih besar. Angka &ldquo;450&rdquo; pada Beranda adalah <b>golongan VA</b>, bukan jumlah rumah.</div>
    <div class="warn"><b>Belum termasuk:</b> rugi kabel, waktu henti perawatan, efisiensi inverter, dan profil beban harian. Untuk perencanaan detail perlu studi kelayakan dan survei lapangan.</div>
  </section>

  <!-- ===================== 5. SPASIAL ===================== -->
  <section class="info-sec" id="spasial">
    <h2><span class="no">5</span> Rumus jarak &amp; analisis spasial</h2>
    <p class="lead">Mesin ECO-WAVE mengukur posisi sebuah titik terhadap data nyata (mangrove, karang, lamun, reef, konservasi, batimetri, gardu, jalur listrik, jalur pelayaran).</p>
    <?= tabel(['Teknik','Fungsi','Cara kerja singkat'], [
      ['Haversine','Jarak antara dua titik di permukaan bumi (titik klik ke desa terdekat).','<code>d = 2R·asin(√(sin²(Δφ/2) + cosφ₁·cosφ₂·sin²(Δλ/2)))</code>, R = 6371 km.'],
      ['Proyeksi lokal (km)','Menghitung jarak titik ke <b>tepi</b> poligon atau ke garis.','Derajat diubah ke km: 1° lintang ≈ 110,574 km; 1° bujur ≈ 111,320 × cos(lintang) km. Lalu dicari jarak terpendek titik ke setiap ruas garis.'],
      ['Point-in-polygon (ray casting)','Memeriksa apakah titik berada <b>di dalam</b> poligon (misal kawasan konservasi).','Tarik garis horizontal dari titik; jumlah perpotongan ganjil = di dalam. Lubang poligon dikeluarkan.'],
      ['Bounding box pruning','Mempercepat: poligon yang kotak pembatasnya sudah lebih jauh dari kandidat terdekat dilewati.','Penting karena ada ±2.200 poligon karang, lamun, dan reef.'],
      ['Baca kedalaman raster','Kedalaman di titik mana pun dari grid ETOPO1.','Indeks sel = ⌊(bujur − x0)/dx⌋, ⌊(y0 − lintang)/dy⌋. Resolusi sel ±1,85 km. Bila sel bernilai di atas 0 m, titik dianggap <b>daratan</b>: Peta dan Kalkulator tidak menampilkan nilai atau skor, hanya pemberitahuan bahwa titik itu daratan (fungsi <code>daratan(lat, lng)</code> di <code>ecowave.js</code>). Karena sel ±1,85 km, titik di garis pantai bisa keliru.'],
      ['Cek cakupan data habitat','Menandai titik yang berada di luar area yang pernah dipetakan data karang/lamun/reef.','Kotak cakupan = gabungan batas semua fitur layer habitat. Di luar kotak itu, &ldquo;tidak ada karang/lamun&rdquo; berarti <b>tidak ada data</b>, dan skor Ekosistem bisa terlalu tinggi.'],
      ['Zona grid ECO-WAVE','Menilai seluruh perairan sebagai sel-sel kecil, lalu diwarnai di peta.','Grid 0,01° (±1,1 km), hanya sel di dalam perairan pesisir 5 km dan di selatan lintang −6,60 (Selat Sunda/Teluk Banten dilewati). Hasilnya bisa diunduh sebagai GeoJSON.'],
    ]) ?>
    <h3>Data spasial yang dipakai (paket PLTGL terbaru)</h3>
    <?= tabel(['Layer','Jumlah fitur','Dipakai untuk'], [
      ['Mangrove','247','Eksklusi (&lt; 1 km) dan skor Ekosistem'],
      ['Terumbu karang','1.325','Eksklusi (&lt; 1 km) dan skor Ekosistem'],
      ['Reef extent','155','Eksklusi (&lt; 1 km) dan skor Ekosistem'],
      ['Lamun','720','Eksklusi (&lt; 0,5 km) dan skor Ekosistem'],
      ['Kawasan konservasi','67','Eksklusi (di dalam kawasan) dan skor Ekosistem'],
      ['Batimetri (poligon kelas) + grid ETOPO1','119 poligon + 151×122 sel','Skor Kedalaman'],
      ['Perairan pesisir 5 km','14','Batas zona grid'],
      ['Jalur listrik','149','Skor Jarak (jaringan listrik)'],
      ['Gardu listrik','1','Skor Jarak (jaringan listrik)'],
      ['Jalur pelayaran (feri)','24','Eksklusi (&lt; 0,5 km)'],
      ['Pelabuhan / dermaga','1','Informasi (tidak masuk skor)'],
    ], 'rata') ?>
    <div class="warn"><b>Perhatikan:</b> layer gardu hanya berisi 1 titik dan pelabuhan 1 titik, sehingga skor Jarak mode &ldquo;jaringan&rdquo; praktis ditentukan oleh jalur listrik. Karang, lamun, dan reef hanya mencakup sebagian pesisir barat (sekitar 105,21–105,82 BT), jadi Bayah–Sawarna tidak punya data habitat sama sekali. Jalur pelayaran berasal dari rute feri OSM, bukan alur pelayaran resmi. Rincian keandalan tiap layer ada di <a href="tentang.php#kualitas">Tentang Data</a>.</div>
  </section>

  <!-- ===================== 6. SKOR ===================== -->
  <section class="info-sec" id="skor">
    <h2><span class="no">6</span> Tabel skor 1–5: mengubah satuan berbeda jadi satu skala</h2>
    <p class="lead">Daya (kW/m), jarak (km), dan kedalaman (m) tidak bisa dijumlahkan langsung. Karena itu tiap kriteria diubah menjadi skor 1 (buruk) sampai 5 (baik). <b>Seluruh ambang adalah asumsi awal yang ditetapkan kelompok kami</b>; bisa diubah di Kalkulator (Parameter lanjutan) dan perlu dasar literatur/AHP/pakar.</p>

    <h3>Kriteria Daya: dua mode</h3>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Mode relatif (bawaan)</span>
        <div class="rumus">Skor = 1 + 4 × (P − 20,48) ÷ (25,57 − 20,48)
<small>dibatasi 1 sampai 5 · 20,48 dan 25,57 kW/m = daya terkecil dan terbesar di antara 4 titik CMEMS</small></div>
        <?= tabel(['Titik acuan','Daya (kW/m)','Skor'], [['P0 Utama','25,57','5,00'],['P1 Ujung Kulon','23,90','3,69'],['P2 Binuangeun','22,59','2,66'],['P3 Bayah–Sawarna','20,48','1,00']], 'rata') ?>
        <p style="font-size:12.5px;color:var(--o-mut)">Dipakai agar kriteria Daya (bobot 40 %) benar-benar membedakan lokasi. Skor musiman memakai rentang yang diskalakan dengan faktor musim yang sama.</p></div>
      <div class="info-card"><span class="tag">Mode absolut (opsional)</span>
        <?= tabel(['Daya (kW/m)','Skor'], [['≥ 20','5'],['15 – &lt;20','4'],['10 – &lt;15','3'],['5 – &lt;10','2'],['&lt; 5','1']], 'rata') ?>
        <p style="font-size:12.5px;color:var(--o-mut)">Dengan ambang ini, semua titik CMEMS (20,48–25,57 kW/m) mendapat skor 5, sehingga kriteria Daya tidak membedakan lokasi. Mode ini dipertahankan sebagai pembanding.</p></div>
    </div>
    <div class="warn"><b>Catatan mode relatif:</b> skor 1 dan 5 hanya berarti &ldquo;terendah&rdquo; dan &ldquo;tertinggi&rdquo; di antara titik acuan yang ada, bukan standar kelayakan mutlak.</div>

    <h3>Kriteria lain</h3>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Ekosistem (dibalik: jauh = bagus)</span>
        <?= tabel(['Jarak ke ekosistem terdekat','Skor','Sensitivitas'], [['≤ 0,5 km','1','Sangat tinggi'],['0,5 – 1 km','2','Tinggi'],['1 – 2 km','3','Sedang'],['2 – 5 km','4','Rendah'],['&gt; 5 km','5','Sangat rendah']], 'rata') ?>
        <p style="font-size:12.5px;color:var(--o-mut)">Ekosistem = mangrove, karang, reef, lamun, dan kawasan konservasi; yang terdekat yang dipakai.</p></div>
      <div class="info-card"><span class="tag">Jarak ke jaringan listrik</span>
        <?= tabel(['Jarak gardu / jalur listrik','Skor'], [['≤ 5 km','5'],['5 – 10 km','4'],['10 – 20 km','3'],['20 – 40 km','2'],['&gt; 40 km','1']], 'rata') ?>
        <p style="font-size:12.5px;color:var(--o-mut)">Cadangan memakai jarak ke desa: &lt;2 km = 5, &lt;5 = 4, &lt;10 = 3, &lt;20 = 2, selainnya 1. Mode bisa <i>grid</i> (bawaan), <i>desa</i>, atau <i>rata-rata</i>. Bila data jaringan tidak termuat, skor memakai cadangan dan diberi peringatan.</p></div>
      <div class="info-card"><span class="tag">Kedalaman (kelas batimetri)</span>
        <?= tabel(['Kedalaman','Kelas','Skor'], [['&lt; −200 m','1','1'],['−200 s/d −100','2','2'],['−100 s/d −50','3','3'],['−50 s/d −20','4','<b>5</b>'],['−20 s/d −10','5','4'],['−10 s/d 0','6','2'],['Daratan menurut ETOPO1','memakai kelas 6','2 (+ peringatan)'],['Tak diketahui','–','3']], 'rata') ?>
        <p style="font-size:12.5px;color:var(--o-mut)">Anggapan: perairan menengah (20–50 m) paling cocok untuk pemasangan; terlalu dalam sulit ditambat, terlalu dangkal rawan gelombang pecah dan ekosistem.</p></div>
    </div>
  </section>

  <!-- ===================== 7. MCDA ===================== -->
  <section class="info-sec" id="mcda">
    <h2><span class="no">7</span> MCDA: apa itu dan untuk apa?</h2>
    <p class="lead"><b>MCDA (Multi-Criteria Decision Analysis)</b>, di web kadang ditulis <b>MCA</b>, adalah cara menilai pilihan (di sini: lokasi) berdasarkan <i>banyak kriteria sekaligus</i>. Metode yang dipakai adalah <b>Weighted Linear Combination (jumlah berbobot)</b>, sama seperti Weighted Overlay di ArcGIS.</p>
    <div class="rumus">Skor mentah = (Daya × 0,40) + (Ekosistem × 0,30) + (Kedalaman × 0,15) + (Jarak × 0,15)
Skor akhir  = Skor mentah × Mask eksklusi        (Mask = 0 bila lokasi terlarang, 1 bila boleh)
<small>Bobot dinormalisasi agar total 100 %: bobot_i = bobot_i ÷ Σ bobot</small></div>
    <?= tabel(['Kriteria','Bobot awal','Kenapa penting'], [
      ['Daya gelombang','40 %','Tanpa gelombang yang cukup besar, pembangkit tidak ekonomis.'],
      ['Ekosistem','30 %','Menjaga mangrove, karang, dan lamun; makin jauh makin aman.'],
      ['Kedalaman','15 %','Menentukan jenis dan biaya pemasangan perangkat.'],
      ['Jarak infrastruktur','15 %','Makin dekat gardu/jalur listrik, makin murah kabel penyalur.'],
    ], 'rata') ?>
    <h3>Klasifikasi skor akhir</h3>
    <?= tabel(['Skor akhir','Kelas'], [['≥ 4,2','Sangat Layak'],['3,4 – &lt;4,2','Layak'],['2,6 – &lt;3,4','Cukup Layak'],['1,8 – &lt;2,6','Kurang Layak'],['&lt; 1,8','Tidak Layak'],['0 (kena eksklusi)','Gugur']], 'rata') ?>
    <div class="contoh"><b class="t">Contoh hitung (titik dengan daya 23,90 kW/m)</b>Skor Daya (mode relatif) 3,69; Ekosistem 3; Kedalaman 4; Jarak 3 → 3,69×0,40 + 3×0,30 + 4×0,15 + 3×0,15 = 1,48 + 0,90 + 0,60 + 0,45 = <b>3,43 → Layak</b>. Bila titik itu ternyata berada dalam kawasan konservasi, skor akhir menjadi <b>0 (Gugur)</b> berapa pun skor mentahnya.</div>
    <div class="tip"><b>Fungsi bobot:</b> bobot menyatakan prioritas. Menaikkan bobot Ekosistem membuat web lebih ketat melindungi lingkungan; menaikkan bobot Daya membuat web lebih mengejar produksi listrik. Slider bobot di panel <i>Bobot MCA</i> mengubah peringkat secara langsung, dan nilainya dibagikan ke halaman lain lewat papan status bersama.</div>
    <div class="warn"><b>Penapisan awal:</b> lima kandidat di database dipilih oleh <code>scripts/hitung_kandidat.js</code> (sel terbaik tiap ruas pesisir dari grid Zona ECO-WAVE) dan skornya dihitung dari data nyata. Bobot, ambang, dan buffer masih asumsi, serta Bayah&ndash;Sawarna di luar cakupan data karang/lamun.</div>
  </section>

  <!-- ===================== 8. EKSKLUSI ===================== -->
  <section class="info-sec" id="eksklusi">
    <h2><span class="no">8</span> Zona eksklusi: syarat wajib sebelum dihitung skor</h2>
    <p class="lead">Eksklusi bersifat &ldquo;ya/tidak&rdquo;, bukan skor. Titik yang melanggar salah satu aturan langsung digugurkan (skor 0) dan keluar dari peringkat. Jarak diukur dari <b>tepi</b> poligon/garis. Semua buffer di bawah adalah nilai awal yang bisa diubah di Kalkulator.</p>
    <?= tabel(['Data','Aturan gugur (buffer)','Alasan'], [
      ['Kawasan konservasi','Di dalam kawasan','Dilarang untuk pembangunan.'],
      ['Mangrove','&lt; 1 km','Melindungi ekosistem pesisir.'],
      ['Terumbu karang','&lt; 1 km','Karang rapuh dan lambat pulih.'],
      ['Reef extent','&lt; 1 km','Sama dengan karang.'],
      ['Lamun','&lt; 0,5 km','Habitat penting; buffer lebih kecil.'],
      ['Jalur pelayaran (feri)','&lt; 0,5 km','Menghindari tabrakan kapal dengan struktur.'],
    ], 'rata') ?>
    <p>Tombol <b>Eksklusi ON/OFF</b> di panel MCA memperlihatkan perbedaannya: bila OFF, skor mentah tetap tampil walau lokasi terlarang. Ada juga opsi <i>wajib perairan 5 km</i> (mati secara bawaan) yang menggugurkan titik di luar perairan pesisir.</p>
    <div class="warn"><b>Keterbatasan:</b> di luar cakupan data karang/lamun/reef, tidak ada eksklusi habitat karena datanya memang tidak ada. Web menandai titik seperti itu dengan peringatan &ldquo;di luar cakupan data&rdquo;.</div>
  </section>

  <!-- ===================== 9. UJI ===================== -->
  <section class="info-sec" id="uji">
    <h2><span class="no">9</span> Uji sensitivitas ±10 poin bobot</h2>
    <p class="lead">Bobot ditetapkan oleh manusia, jadi hasil perlu dicek: <i>apakah juara 1 berubah kalau bobot sedikit digeser?</i></p>
    <ol>
      <li>Untuk tiap kriteria, bobotnya dinaikkan 10 poin lalu diturunkan 10 poin (total 8 skenario).</li>
      <li>Bobot kriteria lain diskalakan proporsional supaya total tetap 100 %.</li>
      <li>Peringkat 1 dihitung ulang di tiap skenario.</li>
      <li>Hasil: &ldquo;Peringkat 1 bertahan di <b>n/8</b> skenario&rdquo;. 8/8 berarti <b>robust</b>; kurang dari itu berarti pemenang bergantung pada bobot.</li>
    </ol>
    <p>Tombol <i>Uji ±10%</i> ada di panel <i>Bobot MCA</i> (Peta, untuk kandidat database) dan di Kalkulator (untuk peringkat berdasarkan data nyata).</p>
  </section>

  <!-- ===================== 10. BMKG ===================== -->
  <section class="info-sec" id="bmkg">
    <h2><span class="no">10</span> Integrasi BMKG Maritim: untuk apa?</h2>
    <p class="lead">BMKG Maritim menerbitkan <b>prakiraan 4 hari</b> per zona perairan. Di ECO-WAVE data ini berfungsi sebagai <b>pembanding kondisi laut saat ini dan beberapa hari ke depan</b> dengan data klimatologi, bukan sebagai penentu skor lokasi.</p>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Fungsi 1</span><h4>Cek kondisi terkini</h4><p>Menampilkan tinggi gelombang, angin, arus permukaan, dan cuaca dari sumber resmi Indonesia di zona dekat lokasi yang dipilih. Navbar dan Beranda menampilkan Hs terbaru zona P.I.06 (Perairan Selatan Lebak).</p></div>
      <div class="info-card"><span class="tag">Fungsi 2</span><h4>Pembanding sumber lain</h4><p>Hs BMKG dibandingkan dengan Windy/Open-Meteo (model GFS Wave) dan dengan rata-rata CMEMS, untuk melihat apakah kondisi hari ini lebih tenang atau lebih ganas dari biasanya.</p></div>
      <div class="info-card"><span class="tag">Fungsi 3</span><h4>Estimasi daya jangka pendek</h4><p>Di Kalkulator, sumber &ldquo;BMKG Maritim&rdquo; menghitung <code>P = 0,49·Hs²·Te</code> dari deret Hs BMKG. Karena BMKG tidak memuat periode, <b>Te diisi pengguna</b>.</p></div>
      <div class="info-card"><span class="tag">Fungsi 4</span><h4>Informasi keselamatan operasi</h4><p>Angin (knot dan hembusan), arus, dan cuaca relevan untuk pemasangan, perawatan, dan akses kapal ke lokasi.</p></div>
    </div>

    <h3>Alur data BMKG di dalam web</h3>
    <div class="alur-info">
      <div class="stp"><i>1</i><b>Pilih zona</b><span>Dropdown atau klik peta (web menyarankan zona terdekat).</span></div>
      <div class="stp"><i>2</i><b>api/bmkg.php</b><span>Memeriksa format kode (mis. <code>P.I.06</code>) agar bukan proxy terbuka, lalu mencoba alamat BMKG tahun berjalan dan tahun sebelumnya.</span></div>
      <div class="stp"><i>3</i><b>Cache 30 menit</b><span>Bila masih segar dipakai; bila BMKG gagal, cache lama dipakai (ditandai &ldquo;stale&rdquo;). Browser juga menyimpan hasil terbaru 5 menit dan membaginya antar halaman.</span></div>
      <div class="stp"><i>4</i><b>parseBMKG()</b><span>Menyatukan hari ke-1 (per jam) dan hari 2–4 (per 3 jam) jadi satu deret waktu.</span></div>
      <div class="stp"><i>5</i><b>Tampil</b><span>Tabel ringkas + grafik 4 hari; waktu UTC diubah ke WIB (+7).</span></div>
    </div>

    <h3>Data yang diambil dari BMKG</h3>
    <?= tabel(['Besaran','Satuan','Dipakai untuk'], [
      ['Tinggi gelombang (<code>wave_height</code>) &amp; kategori','meter','Hs saat ini, rata-rata/min/maks; dasar hitung P bila Te diisi.'],
      ['Angin (<code>wind_speed</code>, <code>wind_gust</code>, arah)','knot (×0,514444 = m/s)','Kondisi operasi dan keselamatan.'],
      ['Arus permukaan (<code>current_speed</code>, arah)','knot','Informasi pelengkap beban pada struktur.'],
      ['Cuaca &amp; suhu','teks, °C','Informasi umum.'],
      ['Metadata: kode, nama zona, stasiun, terbit, berlaku','–','Menunjukkan zona dan masa berlaku prakiraan.'],
    ]) ?>
    <h3>Zona yang tersedia di peta</h3>
    <?= tabel(['Kode','Zona'], [['P.I.04','Selat Sunda Barat Pandeglang'],['P.I.05','Perairan Selatan Pandeglang'],['P.I.06','Perairan Selatan Lebak'],['M.09','Samudra Hindia selatan Jawa Barat']]) ?>
    <p>Kode lain (mis. <code>M.19</code> Laut Jawa bagian barat) bisa dimasukkan lewat opsi &ldquo;Kode lain&rdquo; di Kalkulator.</p>
    <div class="warn"><b>Batasan penting:</b> (1) BMKG hanya prakiraan jangka pendek, bukan klimatologi, jadi <b>tidak mengubah skor MCA</b>. (2) Tidak ada periode gelombang, sehingga P dari BMKG hanyalah estimasi campuran untuk seluruh zona perairan, bukan satu titik. (3) Zona terdekat yang disarankan saat klik peta adalah perkiraan, bukan batas resmi BMKG. (4) Bila BMKG tidak terjangkau, chip di navbar menampilkan &ldquo;BMKG tidak terjangkau&rdquo;.</div>
  </section>

  <!-- ===================== 11. SUMBER GELOMBANG ===================== -->
  <section class="info-sec" id="sumber">
    <h2><span class="no">11</span> Tiga sumber gelombang: apa bedanya?</h2>
    <p class="lead">Web memakai beberapa sumber gelombang dengan peran berbeda. Jangan dicampur dalam satu kesimpulan.</p>
    <?= tabel(['','CMEMS (acuan)','BMKG Maritim','Windy / Open-Meteo'], [
      ['Jenis','Data historis / analisis rata-rata','Prakiraan resmi','Prakiraan model GFS Wave'],
      ['Rentang waktu','2015–2024 (rata-rata bulanan, musiman, tahunan)','4 hari ke depan','Beberapa hari ke depan, per jam'],
      ['Lingkup ruang','4 titik lepas pantai (P0–P3), diinterpolasi IDW','Per zona perairan','Per titik koordinat (di dalam kotak studi)'],
      ['Periode gelombang','Ada (Te = VTM10)','<b>Tidak ada</b>','Ada (Tp → Te = 0,9·Tp)'],
      ['Cache server','Tertanam di kode','30 menit','3 jam'],
      ['Dipakai untuk','Skor Daya MCA, estimasi bulanan/musiman saat peta diklik, estimasi listrik','Kondisi terkini, keselamatan, estimasi cepat','Panel Windy Live, pembanding BMKG'],
      ['Mengubah skor MCA?','<b>Ya</b>','Tidak','Tidak'],
    ]) ?>
    <div class="tip"><b>Windy atau Open-Meteo?</b> Bila kunci Windy Point Forecast belum diisi di <code>config/windy.php</code>, server otomatis memakai Open-Meteo Marine (model GFS Wave yang sama). Dengan kunci paket uji, hasil diberi label &ldquo;DATA UJI&rdquo;.</div>
    <div class="tip"><b>ERA5 2010–2024</b> direncanakan untuk menggantikan atau memvalidasi CMEMS pada tahap berikutnya. Alasan dan rencananya ada di <a href="tentang.php#era5" style="color:#D5B893">Tentang Data</a>.</div>
  </section>

  <!-- ===================== 12. LOGIN & KEAMANAN ===================== -->
  <section class="info-sec" id="keamanan">
    <h2><span class="no">12</span> Login &amp; keamanan akun</h2>
    <p class="lead">Login dipakai untuk membedakan <b>admin</b> (kendali penuh, termasuk mengelola pengguna dan lokasi) dan <b>user</b> (boleh memakai fitur analisis tambahan, tetapi tidak boleh mengubah data). Pengunjung tanpa login tetap bisa melihat peta, menghitung di Kalkulator, dan membaca semua halaman Informasi. Tidak ada akun bawaan di kode; akun pertama dibuat sendiri oleh pemilik situs.</p>
    <?= tabel(['Bagian','Cara kerja','Berkas'], [
      ['Kata sandi','Disimpan sebagai hash (<code>password_hash</code>), tidak pernah sebagai teks biasa. Hash lama otomatis diperbarui saat login berhasil.','<code>config/auth.php</code>'],
      ['Admin pertama','Dibuat lewat halaman setup yang hanya berfungsi selama belum ada admin di database. Kata sandi minimal 10 karakter.','<code>config/setup_admin.php</code>'],
      ['Lupa kata sandi / admin lama tidak bisa masuk','Halaman pemulihan untuk mengganti kata sandi atau membuat admin baru. Hanya bisa dibuka dari komputer server (localhost); dari internet selalu ditolak. Hapus berkas ini di server produksi.','<code>config/reset_admin.php</code>'],
      ['CSRF','Setiap formulir POST membawa token acak yang dicocokkan dengan sesi; token salah ditolak.','<code>csrf_field()</code>, <code>cek_csrf()</code>'],
      ['Batas percobaan','5 kali gagal dalam 10 menit per alamat IP akan mengunci login sementara; pesan menyebut sisa menitnya. Kegagalan karena database mati tidak dihitung.','<code>login_terkunci()</code>'],
      ['Sesi','Cookie <code>httponly</code> dan <code>SameSite=Lax</code> (plus <code>secure</code> bila HTTPS). ID sesi diganti saat login; sesi berakhir setelah 8 jam tanpa aktivitas.','<code>config/auth.php</code>'],
      ['Peran dicek di server','Halaman Kelola dan API perubahan data memeriksa peran admin di server, bukan hanya menyembunyikan tombol.','<code>wajib_admin()</code>, <code>api/locations.php</code>'],
      ['Fitur yang butuh login','Membandingkan lokasi, unduh PDF, simpan PNG, uji sensitivitas di Peta, dan mematikan mode Eksklusi (Peta dan Kalkulator). Mengelola pengguna dan lokasi kandidat khusus admin.','<code>assets/js/core.js</code> (<code>perlu()</code>), <code>peta.js</code>, <code>kalkulator.js</code>'],
      ['Pesan kegagalan yang jelas','Login membedakan: username/sandi salah, database tidak tersambung, terlalu banyak percobaan, formulir kedaluwarsa, dan sesi berakhir.','<code>includes/head.php</code>'],
    ]) ?>
  </section>

  <!-- ===================== 13. FITUR PENUNJANG ===================== -->
  <section class="info-sec" id="penunjang">
    <h2>Fitur penunjang</h2>
    <?= tabel(['Fitur','Fungsi','Cara pakai / berkas'], [
      ['Pencarian kata kunci','Mencari bagian halaman, fitur, lokasi/desa, dan layer data dari indeks teks yang dibangun skrip Python.','Tombol kaca pembesar atau Ctrl+K; <code>assets/js/cari.js</code>'],
      ['Mode aksesibilitas','Ukuran teks 100–200 %, kontras gelap/terang, pilihan jenis font (Verdana, Lexend, Atkinson Hyperlegible, OpenDyslexic, Serif), empat palet warna tambahan (Ubur-ubur biru, Pistachio &amp; Iced Denim, Pantone Cerulean, Galaksi), jarak teks, sorot tautan, kurangi gerak, penanda fokus, dan baca nyaring. Pengaturan tersimpan di browser dan menghormati preferensi &ldquo;kurangi gerak&rdquo; dari sistem.','Tombol aksesibilitas atau Alt+A; <code>assets/js/aksesibilitas.js</code>, <code>assets/css/aksesibilitas.css</code>'],
      ['Pilihan bahasa (Indonesia / English)','Kamus terjemahan manual per halaman (<code>assets/js/kamus/</code>): teks yang cocok dengan entri kamus diganti, lainnya dibiarkan berbahasa Indonesia (tidak ada terjemahan mesin). Kamus English hanya dimuat saat bahasa English dipilih. Pilihan disimpan di browser, berlaku di semua halaman, dan diatur di tab Tampilan.','Menu aksesibilitas, tab Tampilan; <code>assets/js/bahasa.js</code> (kunci <code>ecowave_lang</code>)'],
      ['FAQ melayang','Tombol di pojok kanan bawah semua halaman; 11 tanya-jawab ringkas dengan kolom cari. Hanya bantuan tampilan, tidak mengubah data atau hitungan.','<code>assets/js/faq.js</code>, <code>assets/css/faq.css</code>'],
      ['Latar video &amp; layar loading','Video latar (WebM/MP4; versi 720p untuk layar kecil, berhenti bila gerak dikurangi) dan video kecil saat berpindah halaman.','<code>assets/video/</code>, <code>nav.js</code>, <code>loading.js</code>'],
      ['Kartu ringkasan Beranda','Tiga kartu di hero membaca data situs: bulan gelombang puncak (klimatologi CMEMS), jumlah tahun data, dan rumah 450 VA dari parameter perangkat Kalkulator. Tiap kartu menautkan ke bagian terkait.','<code>assets/js/beranda.js</code>'],
      ['Ekspor hasil','Peta: simpan PNG dan unduh PDF. Kalkulator: unduh CSV (peringkat dan hasil) dan GeoJSON zona untuk ArcGIS/QGIS, dengan parameter yang dipakai ikut disimpan.','Peta, Kalkulator'],
      ['Uji otomatis','Memeriksa mesin hitung, pencarian, aksesibilitas, bahasa, dan konsistensi Peta–Kalkulator tanpa membuka browser.','<code>node tests/test_engine.js</code> (dan <code>test_cari.js</code>, <code>test_aksesibilitas.js</code>, <code>test_bahasa.js</code>, <code>test_konsistensi.js</code>)'],
    ]) ?>
  </section>

  <!-- ===================== 14. HALAMAN & API ===================== -->
  <section class="info-sec" id="halaman">
    <h2><span class="no">13</span> Halaman dan API: apa fungsinya masing-masing</h2>
    <h3>Halaman</h3>
    <?= tabel(['Halaman','Fungsi'], [
      ['Beranda','Pengantar, kartu ringkasan yang terhubung ke data, pantauan langsung, alur cara kerja, dan menu cepat.'],
      ['Peta','Peta analisis: layer data, klik titik untuk skor &amp; estimasi listrik (termasuk estimasi bulanan dan musiman), bobot MCA, Windy, BMKG, asumsi, perbandingan lokasi, dan ekspor. Klik di daratan hanya memberi pemberitahuan. Panel kiri bisa dilebarkan (tombol Perlebar). Tata letaknya diatur di <code>assets/css/peta-simpel.css</code>.'],
      ['Kalkulator','Alat ECO-WAVE: hitung satu titik (daya, listrik, rumah, MCDA, jarak ke data nyata), peringkat kandidat, uji ±10 %, zona grid, parameter lanjutan, unduh CSV/GeoJSON. Titik di daratan tidak dihitung.'],
      ['Lokasi Terbaik','Tiga kandidat teratas menurut bobot MCA yang aktif, beserta validasi data nyata dan peringkat ulang semua kandidat.'],
      ['Tentang Web','Tujuan, daftar fitur, cara memakai, peran pengguna, batasan, dan tanya-jawab.'],
      ['Tentang Data','Katalog tiap data: sumber, jumlah fitur, cakupan, atribut, peran di analisis, status keandalan, dan keterbatasannya.'],
      ['Teknologi &amp; Metode (halaman ini)','Penjelasan teknologi, rumus, parameter, dan keamanan login.'],
      ['Kelola (khusus admin)','Menambah pengguna, mengubah peran (admin/user), dan menghapus akun; mengimpor data gelombang (titik CMEMS), layer, dan lokasi; serta mengedit data acuan (titik CMEMS, desa, bobot MCA).'],
    ]) ?>
    <h3>Endpoint API dan skrip server</h3>
    <?= tabel(['Endpoint','Fungsi'], [
      ['<code>api/calculate.php</code>','Menghitung skor semua lokasi dengan bobot tersimpan atau bobot kiriman pengguna; menerapkan mask eksklusi dan mengurutkan.'],
      ['<code>api/get_weights.php</code>','Membaca bobot MCA dari tabel <code>mca_weights</code>.'],
      ['<code>api/get_location.php</code>','Mengambil lokasi kandidat terdekat dari titik klik beserta data bulanannya.'],
      ['<code>api/locations.php</code>','CRUD lokasi kandidat (khusus admin); lokasi baru dibatasi di kotak studi lintang −8…−6, bujur 104,5…107.'],
      ['<code>api/bmkg.php</code>','Proxy + cache prakiraan BMKG Maritim.'],
      ['<code>api/windy.php</code>','Proxy + cache prakiraan Windy atau Open-Meteo (kunci tidak terlihat di browser).'],
      ['<code>api/auth.php</code>','Status akun (<code>?aksi=me</code>) dan keluar (POST). Login memakai formulir di navbar yang dikirim ke <code>config/auth.php</code>.'],
      ['<code>config/setup_admin.php</code>, <code>config/reset_admin.php</code>','Membuat admin pertama dan memulihkan akses admin (lihat <a href="#keamanan">bagian 12</a>).'],
    ]) ?>
  </section>

  <!-- ===================== 15. GLOSARIUM ===================== -->
  <section class="info-sec" id="glosarium">
    <h2><span class="no">14</span> Istilah singkat</h2>
    <?= tabel(['Istilah','Arti sederhana'], [
      ['Hs','Tinggi gelombang signifikan: rata-rata sepertiga gelombang tertinggi.'],
      ['Tp / Te','Periode puncak / periode energi gelombang (detik).'],
      ['kW/m','Kilowatt per meter muka gelombang; ukuran potensi daya gelombang, <b>bukan</b> listrik yang sudah terbangkit.'],
      ['PLTGL','Pembangkit Listrik Tenaga Gelombang Laut.'],
      ['MCDA / MCA','Analisis keputusan banyak kriteria: nilai tiap kriteria digabung berbobot menjadi satu skor.'],
      ['Skor relatif','Skor yang dihitung dengan membandingkan nilai terhadap rentang terkecil–terbesar di antara titik acuan, bukan terhadap ambang tetap.'],
      ['IDW','Interpolasi jarak terbalik: menebak nilai di antara titik data, titik terdekat berpengaruh lebih besar.'],
      ['Klimatologi','Pola rata-rata jangka panjang (di sini rata-rata 2015–2024 per bulan/musim).'],
      ['Buffer','Zona penyangga di sekeliling objek (mis. 1 km dari mangrove).'],
      ['Eksklusi / mask','Aturan gugur: lokasi di zona terlarang mendapat skor 0.'],
      ['Batimetri / ETOPO1','Kedalaman dasar laut / model ketinggian global beresolusi ±1,85 km.'],
      ['GeoJSON','Format teks untuk titik, garis, dan poligon yang dibaca peta web.'],
      ['VA','Volt-ampere: golongan daya listrik rumah tangga (450, 900, 1300 VA).'],
      ['Faktor kapasitas (CF)','Perbandingan energi yang benar-benar dihasilkan dengan energi maksimum teoretis.'],
      ['CMEMS / ERA5','Layanan data laut Copernicus / reanalisis atmosfer-gelombang ECMWF.'],
      ['Hash kata sandi','Sidik jari satu arah dari kata sandi; tersimpan di database sehingga kata sandi asli tidak bisa dibaca.'],
      ['CSRF','Serangan yang memanfaatkan sesi login pengguna; dicegah dengan token acak di setiap formulir.'],
      ['Cache','Salinan sementara hasil panggilan API agar tidak memanggil layanan luar berulang-ulang.'],
      ['UTC / WIB','Waktu universal / waktu Indonesia barat (UTC + 7).'],
    ]) ?>
    <div class="warn"><b>Ingat:</b> hasil web ini adalah <b>penapisan awal</b>. Potensi gelombang (kW/m) bukan daya listrik terbangkit, dan semua skor, ambang, serta bobot adalah asumsi yang masih perlu divalidasi. Keterbatasan tiap data dijelaskan di <a href="tentang.php#kualitas" style="color:#D5B893;text-decoration:underline">Tentang Data</a>.</div>
  </section>

</div>
<?php include __DIR__.'/includes/foot.php'; ?>
