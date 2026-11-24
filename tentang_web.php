<?php $page='tentang_web'; $title='ECO-WAVE - Tentang Web'; $libs=[]; $js=[]; include __DIR__.'/includes/head.php'; require_once __DIR__.'/includes/info_helper.php'; ?>
<link rel="stylesheet" href="assets/css/halaman-info.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-info.css') ?: 1 ?>">
<div class="info-wrap">

  <div class="page-head band">
    <h1>Tentang Web ECO-WAVE</h1>
    <p>Gambaran umum situs ini: untuk apa dibuat, fitur apa saja yang ada dan ke mana membukanya, cara memakainya, siapa boleh melakukan apa, dari mana datanya, serta batasan yang perlu diketahui sebelum hasilnya dipakai.</p>
  </div>

  <nav class="info-toc" aria-label="Isi halaman">
    <a href="#tujuan">Tujuan</a><a href="#fitur">Fitur web</a><a href="#cara-pakai">Cara memakai</a><a href="#peran">Peran pengguna</a>
    <a href="#tampilan">Tampilan &amp; akses</a><a href="#batasan">Batasan</a><a href="#pasang">Memasang</a><a href="#faq">Tanya jawab</a><a href="#tim">Tim</a>
  </nav>

  <!-- ===== 1 TUJUAN ===== -->
  <section class="info-sec" id="tujuan">
    <h2><span class="no">1</span> Apa itu ECO-WAVE dan untuk apa?</h2>
    <p class="lead"><b>ECO-WAVE</b> (<i>Ecosystem-aware Wave Energy</i>) adalah peta interaktif zona Pembangkit Listrik Tenaga Gelombang (PLTGL) yang ramah ekosistem di pesisir selatan Banten. Sistem ini berupa WebGIS <b>penapisan awal</b> lokasi. Web ini membantu menyaring lokasi yang <i>layak diperiksa lebih lanjut</i>, bukan memutuskan lokasi final.</p>
    <div class="tip"><b>Baca cepat:</b> klik titik di <a href="peta.php" style="color:#D5B893">Peta</a> untuk melihat daya gelombang dan skor kelayakannya, atur bobot sesuai prioritas, hitung rinci di <a href="kalkulator.php" style="color:#D5B893">Kalkulator</a>, lalu lihat tiga kandidat teratas di <a href="terbaik.php" style="color:#D5B893">Lokasi Terbaik</a>. Hasilnya penapisan awal, bukan keputusan final.</div>
    <div class="info-grid">
      <div class="info-card"><span class="tag">Pertanyaan 1</span><h4>Seberapa besar potensi gelombangnya?</h4><p>Daya gelombang (kW/m) dari data CMEMS 2015–2024, dengan pembanding prakiraan BMKG dan Windy/Open-Meteo.</p></div>
      <div class="info-card"><span class="tag">Pertanyaan 2</span><h4>Berapa listrik dan rumah yang terlayani?</h4><p>Estimasi daya listrik per perangkat, energi tahunan, dan jumlah rumah 450 / 900 / 1300 VA.</p></div>
      <div class="info-card"><span class="tag">Pertanyaan 3</span><h4>Apakah ramah ekosistem?</h4><p>Jarak ke mangrove, terumbu karang, lamun, dan kawasan konservasi, serta zona yang harus dihindari (eksklusi).</p></div>
      <div class="info-card"><span class="tag">Pertanyaan 4</span><h4>Apakah dekat jaringan dan layak dipasang?</h4><p>Jarak ke gardu dan jalur listrik, kedalaman laut, serta jalur pelayaran, digabung menjadi satu skor MCDA.</p></div>
    </div>
  </section>

  <!-- ===== 2 FITUR (dipindah dari halaman Teknologi) ===== -->
  <?php
  /* Daftar fitur situs. Tiap kartu = satu halaman; tiap "chip" = tautan langsung ke bagian/tab fitur itu.
     Tautan #layer/#mca/... di Peta dibuka oleh assets/js/deeplink.js; #k-... di Kalkulator memakai id kartu. */
  $FITUR = [
    ['beranda','index.php','bi-house-door','Beranda','Pengantar & ringkasan',
     'Pintu masuk situs: angka ringkas potensi gelombang, pantauan BMKG langsung, penjelasan cara kerja empat langkah, dan menu cepat ke fitur lain, serta bilah pencarian kata kunci di bagian atas.',
     [['Pantauan langsung (BMKG, parameter aktif, analisis terakhir)','index.php#langsung'],['Cara kerja: gelombang → listrik → rumah','index.php#cara-kerja'],['Menu cepat','index.php#jelajahi'],['Zona ECO-WAVE','index.php#ecowave']], ''],
    ['peta','peta.php','bi-map','Peta Analisis','Klik peta, lihat skor',
     'Peta layar penuh. Klik sebuah titik untuk mendapat daya gelombang (IDW dari P0–P3), estimasi bulanan dan musiman dari klimatologi CMEMS 2015–2024, estimasi listrik, rumah terlayani, jarak ke desa, dan skor MCDA. Panel kiri (kartu Titik Terpilih dan Map / Layer) bisa dilebarkan dengan tombol Perlebar; dock di bagian bawah berisi lima tab (Layer, Bobot MCA, Windy, BMKG, Asumsi) ditambah tombol Info titik; grafik tren dan perbandingan ada di panel kanan. Bila yang diklik adalah daratan, peta hanya memberi tahu bahwa titik itu daratan, tanpa nilai atau skor.',
     [['Layer & data PLTGL (mangrove, karang, lamun, konservasi, dst.)','peta.php#layer'],['Bobot MCA & uji sensitivitas','peta.php#mca'],['Windy Live','peta.php#windy'],['BMKG Maritim','peta.php#bmkg'],['Asumsi listrik','peta.php#asumsi'],['Info titik terpilih','peta.php#info']],
     'Juga ada: pencarian lokasi, serta bandingkan lokasi, unduh PDF, simpan PNG, dan uji sensitivitas (perlu login). Tambah/ubah lokasi kandidat khusus admin.'],
    ['kalkulator','kalkulator.php','bi-calculator','Kalkulator ECO-WAVE','Hitung satu titik secara rinci',
     'Alat hitung langkah demi langkah untuk satu titik: pilih lokasi, pilih sumber gelombang, atur perangkat, lalu baca hasil daya, listrik, rumah, skor MCDA, dan jarak ke data nyata.',
     [['1. Pilih titik analisis','kalkulator.php#k-titik'],['2. Sumber gelombang (CMEMS / BMKG / manual)','kalkulator.php#k-sumber'],['3. Parameter perangkat PLTGL','kalkulator.php#k-perangkat'],['MCDA skor kelayakan','kalkulator.php#k-mcda'],['Jarak ke data PLTGL','kalkulator.php#k-jarak'],['Listrik & rumah terlayani','kalkulator.php#k-energi'],['Peringkat kandidat & uji ±10%','kalkulator.php#k-rank'],['Zona grid ECO-WAVE','kalkulator.php#k-zona'],['Parameter lanjutan','kalkulator.php#k-lanjutan'],['Unduh CSV','kalkulator.php#k-csv']],
     'Bagian hasil (MCDA dan seterusnya) muncul setelah tombol Hitung ditekan. Daftar layer di peta memakai ceklis yang sama dengan Peta. Dua garis putus-putus di peta (biru = kotak area studi, kuning = batas area analisis) bisa diatur manual lewat panel "Garis batas di peta" dan tersimpan bersama Peta. Titik di daratan tidak dihitung; Kalkulator hanya memberi tahu bahwa titik itu daratan. Mematikan mode Eksklusi perlu login.'],
    ['terbaik','terbaik.php','bi-trophy','Lokasi Terbaik','Tiga kandidat teratas',
     'Tiga lokasi kandidat dengan skor tertinggi menurut bobot MCA yang aktif, ditambah validasi dengan data nyata (kedalaman, eksklusi, cakupan data). Kandidat bawaan masih data demo.',
     [['Tiga kandidat teratas','terbaik.php#top3'],['Validasi data nyata','terbaik.php#validasi']], ''],
    ['cari','#fitur','bi-search','Pencarian Kata Kunci','Ada di navbar semua halaman',
     'Cari kata apa pun di seluruh isi situs: rumus, glosarium, metode, FAQ, temuan, fitur, lokasi/desa, dan layer data. Buka dengan tombol kaca pembesar di navbar, bilah cari di Beranda, Ctrl+K, atau tombol /.',
     [['Contoh: mangrove','#fitur',' data-cari data-cari-q="mangrove"'],['Contoh: rumus daya gelombang','#fitur',' data-cari data-cari-q="rumus daya gelombang"'],['Contoh: MCDA','#fitur',' data-cari data-cari-q="MCDA"'],['Contoh: Sawarna','#fitur',' data-cari data-cari-q="Sawarna"']],
     'Kata kunci boleh lebih dari satu; semua kata harus ada. Huruf besar/kecil dan aksen diabaikan. Gunakan panah dan Enter untuk memilih hasil.',' data-cari'],
    ['aksesibilitas','#fitur','bi-universal-access','Mode Aksesibilitas','Ikon orang di navbar, atau Alt+A',
     'Pengaturan tampilan untuk pengguna disabilitas dan low vision: ukuran teks sampai 200%, kontras tinggi gelap/terang, skala abu-abu, pilihan font (Verdana, Lexend, Atkinson Hyperlegible, OpenDyslexic, Serif), empat palet warna tambahan (Ubur-ubur biru, Pistachio &amp; Iced Denim, Pantone Cerulean, Galaksi), jarak teks, tautan bergaris bawah, fokus keyboard tebal, kursor besar, hentikan animasi dan video, dan baca nyaring. Panel dibagi dua tab: <i>Aksesibilitas</i> (ukuran, kontras, font, keterbacaan, gerak, suara) dan <i>Tampilan</i> (bahasa Indonesia / English dan palet warna).',
     [['Ukuran teks 100–200%','#fitur',' data-aks'],['Palet warna','#fitur',' data-aks'],['Tab Tampilan: bahasa','#fitur',' data-aks'],['Kontras tinggi','#fitur',' data-aks'],['Ganti jenis font','#fitur',' data-aks'],['Hentikan animasi','#fitur',' data-aks'],['Baca nyaring','#fitur',' data-aks']],
     'Pengaturan tersimpan di browser dan berlaku di semua halaman. Tersedia juga tautan "Lompat ke konten utama" untuk pengguna keyboard dan pembaca layar.',' data-aks'],
    ['tentang_web','tentang_web.php','bi-info-circle','Tentang Web','Gambaran umum situs',
     'Halaman ini: tujuan ECO-WAVE, daftar fitur, cara memakai, peran pengguna, keamanan, batasan, cara memasang, dan tanya-jawab.',
     [['Tujuan','tentang_web.php#tujuan'],['Cara memakai','tentang_web.php#cara-pakai'],['Peran pengguna','tentang_web.php#peran'],['Batasan','tentang_web.php#batasan'],['Tanya jawab','tentang_web.php#faq']], ''],
    ['tentang','tentang.php','bi-database-check','Tentang Data','Katalog & sumber data',
     'Katalog lengkap setiap data: sumber, jumlah fitur, luas/panjang, cakupan wilayah, atribut, fungsi dalam analisis, status keandalan, dan keterbatasannya, plus metode estimasi.',
     [['Ringkasan data','tentang.php#ringkasan'],['Katalog layer spasial','tentang.php#katalog'],['Tabel sumber data lengkap','tentang.php#sumber-data'],['Metode estimasi','tentang.php#metode'],['Kualitas & keterbatasan data','tentang.php#kualitas']], ''],
    ['teknologi','teknologi.php','bi-cpu','Teknologi & Metode','Rumus dan cara kerja',
     'Teknologi yang dipakai, rumus daya gelombang dan listrik, tabel skor, MCDA, eksklusi, uji sensitivitas, BMKG, dan glosarium.',
     [['Rumus daya gelombang','teknologi.php#gelombang'],['MCDA','teknologi.php#mcda'],['Zona eksklusi','teknologi.php#eksklusi'],['Integrasi BMKG','teknologi.php#bmkg'],['Halaman & API','teknologi.php#halaman'],['Istilah','teknologi.php#glosarium']], ''],
    ['admin','admin.php','bi-gear','Kelola','Khusus admin',
     'Panel admin: tambah akun, ubah peran (admin/user), dan hapus akun; impor data gelombang (titik CMEMS), layer, dan lokasi; serta mengedit data acuan (titik CMEMS, desa, bobot MCA). Dicek di server; pengunjung biasa diarahkan ke login.',
     [['Pengguna','admin.php#kelola-user'],['Data gelombang','admin.php#impor-titik'],['Layer','admin.php#impor-layer'],['Lokasi','admin.php#impor-lokasi'],['Data acuan','admin.php#refAdmin']], ''],
    ['faq','#faq','bi-question-circle','FAQ Melayang','Tombol FAQ di pojok kanan bawah semua halaman',
     'Jawaban singkat untuk 10 pertanyaan yang paling sering muncul (apa itu ECO-WAVE, asal data gelombang, arti skor, asal bobot, cara hitung listrik, sinkron Peta-Kalkulator, simpan hasil, batas penggunaan, dan pengaturan tampilan), lengkap dengan kolom cari. Esc atau klik di luar menutupnya.',
     [['Buka tanya jawab lengkap','#faq']], 'Ringkasan saja: rincian dan sumbernya tetap ada di Tentang Data dan Teknologi &amp; Metode.'],
  ];
  ?>
  <section class="info-sec" id="fitur">
    <h2><span class="no">2</span> Fitur yang ada di web ini</h2>
    <p class="lead">Klik <b>judul kartu</b> untuk membuka halaman fiturnya, atau klik salah satu <b>bagian di dalam kartu</b> untuk langsung loncat ke bagian itu (misalnya tab Bobot MCA di Peta atau peringkat kandidat di Kalkulator).</p>
    <div class="fitur-grid">
      <?php foreach ($FITUR as $f): ?>
      <article class="fitur-card">
        <a class="fitur-main" href="<?= $f[1] ?>"<?= $f[8] ?? '' ?>>
          <span class="fitur-ic"><i class="bi <?= $f[2] ?>"></i></span>
          <span class="fitur-tt"><b><?= $f[3] ?><?php if($f[0]==='admin'): ?> <em class="fitur-badge">admin</em><?php endif; ?></b><small><?= $f[4] ?></small></span>
          <i class="bi bi-arrow-right-circle fitur-go" aria-hidden="true"></i>
        </a>
        <p class="fitur-ds"><?= $f[5] ?></p>
        <div class="fitur-sub" aria-label="Bagian di halaman <?= htmlspecialchars($f[3]) ?>">
          <?php foreach ($f[6] as $c): ?><a href="<?= $c[1] ?>"<?= $c[2] ?? '' ?>><?= $c[0] ?></a><?php endforeach; ?>
        </div>
        <?php if ($f[7]): ?><p class="fitur-cat"><?= $f[7] ?></p><?php endif; ?>
      </article>
      <?php endforeach; ?>
    </div>
    <div class="tip"><b>Fitur di semua halaman:</b> status gelombang BMKG langsung di navbar (klik untuk membuka Peta), jam WIB, pencarian kata kunci (Ctrl+K), mode aksesibilitas (Alt+A), login/logout, dan latar video laut. Bobot MCA dan parameter perangkat dibagi antarhalaman, jadi mengubahnya di Peta ikut mengubah Kalkulator, Lokasi Terbaik, dan Beranda.</div>
  </section>

  <!-- ===== 3 CARA PAKAI ===== -->
  <section class="info-sec" id="cara-pakai">
    <h2><span class="no">3</span> Cara memakai: alur yang disarankan</h2>
    <div class="alur-info">
      <div class="stp"><i>1</i><b>Mulai di Beranda</b><span>Lihat angka ringkas dan status gelombang BMKG saat ini.</span></div>
      <div class="stp"><i>2</i><b>Klik titik di Peta</b><span>Dapatkan daya gelombang, estimasi listrik, rumah terlayani, dan skor titik itu.</span></div>
      <div class="stp"><i>3</i><b>Atur bobot MCA</b><span>Geser slider di tab Bobot MCA sesuai prioritas: produksi listrik atau perlindungan lingkungan.</span></div>
      <div class="stp"><i>4</i><b>Hitung rinci di Kalkulator</b><span>Pilih sumber gelombang, atur perangkat, baca skor, jarak ke data nyata, dan peringkat.</span></div>
      <div class="stp"><i>5</i><b>Lihat Lokasi Terbaik</b><span>Tiga kandidat teratas menurut bobot yang aktif, beserta validasi data nyata.</span></div>
      <div class="stp"><i>6</i><b>Periksa data sebelum mengutip</b><span>Buka Tentang Data untuk melihat sumber, status, dan keterbatasan tiap data.</span></div>
    </div>
  </section>

  <!-- ===== 4 CAKUPAN ===== -->
  <section class="info-sec" id="cakupan">
    <h2>Cakupan wilayah dan data</h2>
    <?= tabel(['Hal','Keterangan'], [
      ['Wilayah studi','Pesisir selatan Banten: lintang −8 s/d −6, bujur 104,5 s/d 107 (Pandeglang dan Lebak, sampai sekitar Pelabuhan Ratu).'],
      ['Gelombang acuan','CMEMS 2015–2024 di 4 titik (P0–P3), diinterpolasi IDW untuk setiap klik peta.'],
      ['Gelombang terkini','Prakiraan BMKG Maritim (3 zona terverifikasi) dan Windy/Open-Meteo Marine.'],
      ['Data spasial nyata','11 layer: mangrove, karang, lamun, reef, konservasi, batimetri, perairan 5 km, pelabuhan, gardu, jalur listrik, jalur pelayaran.'],
      ['Asal data','Sebagian data adalah <b>hasil manual dari kelompok kami</b> (mangrove, kawasan konservasi, perairan 5 km, 12 desa acuan, 5 kandidat contoh, serta bobot dan asumsi). Sisanya dari sumber luar (ETOPO1, Allen Coral Atlas, OpenStreetMap, CMEMS) dan layanan langsung (BMKG, Windy/Open-Meteo).'],
      ['Detail dan status keandalan','Lihat halaman <a href="tentang.php#ringkasan" style="color:#D5B893">Tentang Data</a> (bagian Asal data) dan <a href="tentang.php#katalog" style="color:#D5B893">Katalog layer</a>.'],
    ]) ?>
  </section>

  <!-- ===== 5 PERAN ===== -->
  <section class="info-sec" id="peran">
    <h2><span class="no">4</span> Peran pengguna: siapa boleh apa</h2>
    <?= tabel(['Peran','Bisa','Catatan'], [
      ['Pengunjung (tanpa login)','Melihat Beranda, Peta, Kalkulator, Lokasi Terbaik, dan semua halaman Informasi; klik peta; mengatur bobot MCA dan parameter perangkat.','Pengaturan bobot tersimpan di browser, bukan di akun.'],
      ['User','Semua yang bisa dilakukan pengunjung, ditambah membandingkan lokasi, mengunduh PDF, menyimpan PNG, uji sensitivitas di Peta, dan mematikan mode Eksklusi.','Akun dibuat oleh admin. User tidak bisa mengubah data lokasi.'],
      ['Admin','Semua yang bisa user, ditambah halaman <b>Kelola</b> (tambah akun, ubah peran, hapus akun) dan mengubah lokasi kandidat lewat API.','Dicek di server, bukan hanya disembunyikan di tampilan. Tidak ada akun bawaan; admin pertama dibuat lewat <code>config/setup_admin.php</code>.'],
    ]) ?>
  </section>

  <!-- ===== 6 TAMPILAN ===== -->
  <section class="info-sec" id="tampilan">
    <h2><span class="no">5</span> Tampilan dan kemudahan akses</h2>
    <ul>
      <li><b>Mode aksesibilitas</b> (ikon orang di navbar atau <kbd>Alt</kbd>+<kbd>A</kbd>): ukuran teks 100–200%, kontras tinggi gelap/terang, skala abu-abu, pilihan font (Verdana, Lexend, Atkinson Hyperlegible, OpenDyslexic, Serif), jarak baris dan huruf, tautan bergaris bawah, fokus keyboard tebal, kursor besar, hentikan animasi dan video latar, serta baca nyaring (suara bahasa Indonesia bila tersedia). Pengaturan tersimpan di browser.</li>
      <li><b>Palet warna:</b> selain palet bawaan, tersedia Ubur-ubur biru, Pistachio &amp; Iced Denim, Pantone Cerulean, dan Galaksi (menu aksesibilitas). Palet tidak berlaku saat kontras tinggi hidup.</li>
      <li><b>Bahasa:</b> Indonesia atau English, dipilih di tab <i>Tampilan</i> pada menu aksesibilitas dan diingat di browser. Terjemahan mencakup menu, judul, tombol, label, panel aksesibilitas, FAQ, dan paragraf penjelasan di semua halaman Informasi. Nama tempat, judul pustaka, nama berkas, dan istilah teknis tertentu sengaja dibiarkan apa adanya.</li>
      <li><b>FAQ melayang:</b> tombol FAQ di pojok kanan bawah semua halaman membuka 11 tanya-jawab singkat dengan kolom cari.</li>
      <li><b>Pencarian kata kunci</b> (<kbd>Ctrl</kbd>+<kbd>K</kbd> atau <kbd>/</kbd>): mencari di seluruh isi halaman, fitur, lokasi/desa, dan layer data.</li>
      <li><b>Keyboard:</b> <kbd>Tab</kbd> berpindah antarkontrol, tautan &ldquo;Lompat ke konten utama&rdquo; muncul di awal halaman, dan <kbd>Esc</kbd> menutup menu, pencarian, panel aksesibilitas, dan jendela login.</li>
      <li><b>Gerak dikurangi:</b> bila perangkat meminta pengurangan animasi, video latar dijeda dan animasi dimatikan; bisa juga dimatikan manual lewat mode aksesibilitas.</li>
      <li><b>Ponsel dan layar kecil:</b> navbar berubah menjadi menu hamburger pada lebar di bawah 940 px; latar video memakai versi 720p pada layar kecil.</li>
      <li><b>Peta dasar:</b> pilihan Gelap, Laut, Satelit, Jalan, dan Topografi (Esri) serta OpenStreetMap. Pilihan diingat antarhalaman, dan otomatis pindah ke OpenStreetMap bila peta Esri gagal dimuat.</li>
      <li><b>Pustaka:</b> memakai salinan lokal di <code>assets/vendor/</code> bila ada (jalan tanpa internet), bila tidak memakai CDN. Data gelombang langsung dan peta dasar tetap butuh internet.</li>
    </ul>
    <p class="note" style="margin:10px 0 0;font-size:13px">Catatan: mode aksesibilitas membantu, tetapi belum diuji dengan pembaca layar sungguhan (NVDA/VoiceOver); grafik berbasis canvas tidak ikut diperbesar.</p>
  </section>

  <!-- ===== 7 KEAMANAN ===== -->
  <section class="info-sec" id="keamanan">
    <h2>Keamanan dan privasi</h2>
    <ul>
      <li>Kueri database memakai <b>prepared statement</b> (PDO) untuk mencegah SQL injection.</li>
      <li>Kata sandi disimpan dengan <code>password_hash</code>; form memakai token CSRF; percobaan login yang gagal berulang dikunci sementara.</li>
      <li>Izin halaman admin dan perubahan lokasi dicek di server.</li>
      <li>Panggilan BMKG dan Windy lewat server (proxy + cache), sehingga kunci API tidak terlihat di browser; <code>api/bmkg.php</code> memeriksa format kode zona agar bukan proxy terbuka.</li>
      <li>Perhitungan skor dan peta berjalan di browser; titik yang Anda klik tidak disimpan kecuali Anda menyimpannya sebagai lokasi lewat akun.</li>
    </ul>
  </section>

  <!-- ===== 8 BATASAN ===== -->
  <section class="info-sec" id="batasan">
    <h2><span class="no">6</span> Batasan yang harus diketahui</h2>
    <div class="warn"><b>Penapisan awal, bukan keputusan final.</b> Potensi gelombang (kW/m) bukan daya listrik terbangkit. Skor, ambang, bobot, dan buffer adalah asumsi tim yang belum divalidasi dengan literatur/AHP/pakar.</div>
    <ul>
      <li>Lima lokasi kandidat di database dipilih otomatis dari grid Zona ECO-WAVE (<code>scripts/hitung_kandidat.js</code>) dan skornya dihitung dari data nyata. Ini <b>penapisan awal</b>, bukan studi kelayakan.</li>
      <li>Gardu listrik dan pelabuhan masing-masing hanya 1 titik, jadi skor Jarak praktis ditentukan oleh jalur listrik.</li>
      <li>Gelombang acuan hanya dari 4 titik lepas pantai; rumus daya adalah rumus air dalam dan kurang akurat di perairan dangkal dekat pantai.</li>
      <li>ERA5 dan BATNAS belum dipakai karena web masih di tahap awal; rencana dan pemeliharaannya ada di <a href="tentang.php#era5" style="color:#D5B893">Tentang Data</a>.</li>
      <li>Data karang, lamun, dan reef hanya mencakup sebagian pesisir barat; di luarnya berarti tidak ada data.</li>
      <li>BMKG tidak memuat periode gelombang, jadi daya dari BMKG hanya estimasi dan tidak mengubah skor MCA.</li>
      <li>Deteksi daratan memakai grid kedalaman ETOPO1 (sel ±1,85 km), jadi titik tepat di garis pantai bisa terbaca sebagai daratan atau laut secara keliru. Titik daratan tidak diberi nilai.</li>
      <li>Terjemahan English ditulis manual (bukan terjemahan mesin) dan bisa masih ada kalimat yang belum terjemah, terutama teks yang dibuat skrip; teks yang belum punya terjemahan tetap tampil berbahasa Indonesia.</li>
    </ul>
    <p>Rincian lengkap: <a href="tentang.php#kualitas" style="color:#D5B893">Kualitas &amp; keterbatasan data</a>.</p>
  </section>

  <!-- ===== 9 TEKNOLOGI ===== -->
  <section class="info-sec" id="teknologi">
    <h2>Dibangun dengan apa?</h2>
    <p class="lead">PHP + MySQL di server; HTML, CSS, dan JavaScript murni di browser dengan Leaflet (peta) dan Chart.js (grafik); mesin hitung ECO-WAVE berupa pustaka JavaScript murni yang bisa diuji di Node. Rumus, parameter, dan cara kerja lengkap ada di halaman <a href="teknologi.php" style="color:#D5B893">Teknologi &amp; Metode</a>.</p>
  </section>

  <!-- ===== 10 PASANG ===== -->
  <section class="info-sec" id="pasang">
    <h2><span class="no">7</span> Cara memasang di komputer sendiri (XAMPP)</h2>
    <ol>
      <li>Ekstrak folder <code>eco-wave</code> ke <code>C:\xampp\htdocs\eco-wave</code>.</li>
      <li>Jalankan Apache dan MySQL.</li>
      <li>Impor <code>database.sql</code> lewat phpMyAdmin (berisi DROP TABLE; cadangkan database lama dulu).</li>
      <li>Buka <code>http://localhost/eco-wave</code>.</li>
      <li>Buat admin pertama di <code>http://localhost/eco-wave/config/setup_admin.php</code> (hanya berjalan selama belum ada admin). Lupa kata sandi? Buka <code>config/reset_admin.php</code> dari komputer server.</li>
      <li>Pastikan terhubung internet untuk CDN, peta dasar, dan data gelombang langsung.</li>
    </ol>
    <p>Pengaturan database ada di <code>config/config.php</code> (bisa ditimpa lewat <code>config.local.php</code>); nama database bawaan <code>ecowave_db</code>. Agar situs jalan tanpa CDN, jalankan <code>python scripts/unduh_vendor.py</code> sekali.</p>
  </section>

  <!-- ===== 11 FAQ ===== -->
  <section class="info-sec" id="faq">
    <h2><span class="no">8</span> Tanya jawab</h2>
    <div class="dt-kual">
      <details class="dt-q dt-q-rendah"><summary><b>Apakah hasil web ini bisa dipakai untuk menentukan lokasi PLTGL?</b></summary><div class="dt-q-isi"><p>Tidak sebagai keputusan final. Web ini hanya menyaring lokasi yang layak diperiksa. Penentuan lokasi butuh survei lapangan dan studi kelayakan.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Kenapa lokasi dengan gelombang terbesar belum tentu terbaik?</b></summary><div class="dt-q-isi"><p>Bisa saja berada di atas terumbu karang, di kawasan konservasi, di alur kapal, atau sangat jauh dari jaringan listrik. Karena itu skor menggabungkan daya, ekosistem, kedalaman, dan jarak infrastruktur.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Bagaimana mengubah bobot penilaian?</b></summary><div class="dt-q-isi"><p>Di Peta buka tab <a href="peta.php#mca" style="color:#D5B893">Bobot MCA</a>, atau di <a href="kalkulator.php#k-perangkat" style="color:#D5B893">Kalkulator</a>. Bobot dibagi antarhalaman.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Kenapa angka P dari BMKG berbeda dengan CMEMS?</b></summary><div class="dt-q-isi"><p>BMKG adalah prakiraan jangka pendek untuk satu zona perairan tanpa periode gelombang (Te diisi pengguna), sedangkan CMEMS adalah rata-rata historis 2015–2024 per titik. Keduanya tidak boleh dicampur dalam satu kesimpulan.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Apa arti &ldquo;di luar cakupan data&rdquo; di Kalkulator?</b></summary><div class="dt-q-isi"><p>Titik berada di luar wilayah data karang/lamun/reef. &ldquo;Tidak ada karang&rdquo; di sana berarti tidak ada data, bukan berarti terbukti tidak ada.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Data mana yang dibuat sendiri oleh kelompok?</b></summary><div class="dt-q-isi"><p>Mangrove, kawasan konservasi, perairan pesisir 5 km, 12 desa acuan, 5 lokasi kandidat contoh, serta bobot, ambang, buffer, dan asumsi konversi listrik adalah <b>hasil manual kelompok kami</b>. Di <a href="tentang.php#sumber-data" style="color:#D5B893">Tentang Data</a> data ini diberi penanda &ldquo;Hasil manual kelompok&rdquo;.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Fitur apa yang butuh login?</b></summary><div class="dt-q-isi"><p>Membandingkan lokasi, unduh PDF, simpan PNG, uji sensitivitas di Peta, dan mematikan mode Eksklusi. Halaman Kelola serta pengubahan lokasi kandidat khusus admin. Melihat peta, menghitung di Kalkulator, dan membaca halaman Informasi tidak perlu login.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Di mana melihat sumber setiap data?</b></summary><div class="dt-q-isi"><p>Di <a href="tentang.php#katalog" style="color:#D5B893">Tentang Data</a>: kartu tiap layer dan tabel sumber lengkap beserta status keandalannya.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Bagaimana mencari kata kunci tertentu di seluruh web?</b></summary><div class="dt-q-isi"><p>Klik ikon kaca pembesar di navbar, atau tekan <kbd>Ctrl</kbd>+<kbd>K</kbd> (atau <kbd>/</kbd>). Ketik satu atau beberapa kata, misalnya <i>mangrove</i> atau <i>rumus daya</i>; hasil memuat cuplikan kalimat dan langsung membuka bagian halaman yang tepat.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Apa yang terjadi bila saya mengklik daratan?</b></summary><div class="dt-q-isi"><p>Peta dan Kalkulator hanya memberi tahu bahwa titik itu daratan; tidak ada nilai gelombang, listrik, atau skor yang ditampilkan. Deteksinya memakai grid kedalaman ETOPO1 (±1,85 km), jadi di tepi pantai hasilnya bisa meleset; klik sedikit lebih ke laut bila perlu.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Bagaimana mengganti bahasa atau palet warna?</b></summary><div class="dt-q-isi"><p>Buka <b>Mode Aksesibilitas</b> (ikon orang di navbar atau <kbd>Alt</kbd>+<kbd>A</kbd>). Pindah ke tab <b>Tampilan</b>: Bahasa (Indonesia / English) ada di bagian atas, palet warna (Ubur-ubur biru, Pistachio &amp; Iced Denim, Pantone Cerulean, Galaksi) di bagian Palet warna. Tab <b>Aksesibilitas</b> berisi pengaturan ukuran, kontras, font, keterbacaan, gerak, dan suara.</p></div></details>
      <details class="dt-q dt-q-rendah"><summary><b>Bagaimana memperbesar teks atau mengubah kontras?</b></summary><div class="dt-q-isi"><p>Buka <b>Mode Aksesibilitas</b> lewat ikon orang di navbar atau <kbd>Alt</kbd>+<kbd>A</kbd>. Di sana ada ukuran teks hingga 200%, kontras tinggi gelap/terang, skala abu-abu, pilihan font (Verdana, Lexend, Atkinson Hyperlegible, OpenDyslexic, Serif), jarak teks, penghentian animasi, kursor besar, dan baca nyaring. Pengaturan tersimpan di browser Anda.</p></div></details>
    </div>
  </section>

  <!-- ===== 12 TIM ===== -->
  <section class="info-sec" id="tim">
    <h2><span class="no">9</span> Pembagian tugas</h2>
    <?= tabel(['Anggota','Bagian'], [['Anggota 1','ERA5 / CMEMS / Python'],['Anggota 2','Ekosistem / ArcGIS'],['Anggota 3','Database / WebGIS']]) ?>
  </section>

</div>
<link rel="stylesheet" href="assets/css/halaman-data.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-data.css') ?: 1 ?>">
<?php include __DIR__.'/includes/foot.php'; ?>
