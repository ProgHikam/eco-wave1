<?php require_once __DIR__.'/config/auth.php'; wajib_admin();   /* catatan audit untuk tim: khusus admin */ ?>
<?php $page='celah'; $title='ECO-WAVE - Celah & Kekurangan'; $libs=[]; $js=[]; include __DIR__.'/includes/head.php'; require_once __DIR__.'/includes/info_helper.php'; ?>
<link rel="stylesheet" href="assets/css/halaman-info.css?v=<?= @filemtime(__DIR__.'/assets/css/halaman-info.css') ?: 1 ?>">
<style>.stt{margin-left:auto;flex:none;align-self:center;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;color:var(--space-cadet);white-space:nowrap}.status-perbaikan{grid-column:1/-1;padding:8px 12px;border-radius:10px;background:rgba(var(--slate-gray-rgb),.08);border:1px solid rgba(var(--slate-gray-rgb),.3)}.status-perbaikan b{display:block;color:var(--tan)}</style>
<?php
/* Daftar celah. Tiap butir diperiksa langsung dari berkas proyek (lihat kolom "Di mana").
   tingkat: k = kritis (merusak kepercayaan hasil / keamanan), p = penting, q = perbaikan kualitas */
$C = [
 // ---------------- KRITIS ----------------
 ['k','K1','Beberapa angka di halaman Hasil CMEMS dan Beranda tidak sesuai dengan data sendiri',
  'Kartu &ldquo;Daya Maks&rdquo;, tabel &ldquo;Data Bulanan 2024&rdquo;, &ldquo;tren +2,1%/tahun&rdquo;, &ldquo;Titik Layak 40%&rdquo;, dan &ldquo;450 rumah&rdquo; di hero.',
  '<code>hasil.php</code> (kini dihapus), <code>index.php</code>, <code>assets/js/data.js</code>',
  '25,57 kW/m diberi label &ldquo;maks harian&rdquo; padahal itu rata-rata P0 (maksimum di data = 168,53). Tabel &ldquo;2024&rdquo; tidak cocok dengan klimatologi bulanan (Jun 25,57 vs 34,01; Apr 26,8 vs 22,84) dan hanya 6 dari 12 baris. Data tahunan sendiri menunjukkan tren <b>turun ±0,8%/tahun</b>, bukan naik 2,1%. Distribusi menunjukkan ±93% waktu di atas 10 kW/m, bukan 40%. &ldquo;450&rdquo; adalah kelas VA, bukan jumlah rumah (P0: 170/85/59).',
  'Pembaca bisa mengutip angka yang salah; dosen/penguji yang mengecek akan langsung menemukan ketidakcocokan.',
  'Hitung ulang semua angka dari <code>CMEMS</code> di <code>data.js</code> (atau dari ERA5 nanti) dengan kode, jangan ditulis manual; hapus tabel 2024 bila tidak ada data 2024 asli.'],
 ['k','K2','Seluruh kandidat, skor, dan Lokasi Terbaik masih data demo',
  'Peringkat &ldquo;Lokasi Terbaik&rdquo; berasal dari 5 kandidat contoh, bukan hasil analisis.',
  '<code>database.sql</code>, <code>assets/data/contoh_kandidat.geojson</code>',
  'Skor dan gelombang bulanan adalah seed contoh. Dua kandidat tidak masuk akal secara spasial: <b>Panimbang</b> berada di daratan (ETOPO1 +113 m) dan Bayah/Binuangeun/Cikeusik berada di kedalaman ±1.100–1.800 m, padahal skor Kedalamannya 3–4. &ldquo;Cikeusik&rdquo; ditandai terlarang di database tetapi tidak terkena aturan eksklusi mana pun di kode.',
  'Hasil &ldquo;terbaik&rdquo; tampak resmi padahal tidak dihitung dari data nyata.',
  'Ganti kandidat dengan titik hasil Zona ECO-WAVE (atau hasil Weighted Overlay ArcGIS) di laut dangkal yang valid; beri label DEMO di halaman bila belum diganti.'],
 ['k','K3','Keamanan login: akun dan kata sandi terlihat publik dan tertulis di kode',
  'Siapa pun bisa melihat akun admin dari halaman web.',
  '<code>includes/head.php</code> (modal login), <code>config/auth.php</code>',
  'Modal login menampilkan &ldquo;admin / admin123&rdquo; dan &ldquo;user / user123&rdquo; ke semua pengunjung. Akun yang sama tertulis plaintext di <code>$AKUN_DEFAULT</code> dan tetap berlaku walau database kosong. Pengecekan sandi juga menerima hash md5 dan teks polos. Form login tidak punya token CSRF dan tidak ada pembatasan percobaan.',
  'Halaman Kelola (ubah/hapus lokasi dan pengguna) bisa diambil alih orang asing begitu situs online.',
  'Hapus teks akun dari modal dan kode; buat admin sungguhan di database dengan <code>password_hash</code>; hanya terima <code>password_verify</code>; tambah CSRF dan batas percobaan login.'],
 ['k','K4','Data gelombang utama belum bisa diverifikasi (ERA5 &amp; berkas CMEMS tidak ada)',
  'Seluruh skor Daya bertumpu pada 4 angka yang tertanam di kode.',
  '<code>01_raw/era5_wave/</code> kosong; <code>02_processed/</code>, <code>03_arcgis/</code>, <code>04_output/</code> kosong',
  'Tidak ada berkas mentah CMEMS maupun ERA5; kode produk dan tanggal unduh CMEMS tidak tercatat. BATNAS belum dipakai (ETOPO1 ±1,85 km). Folder alur kerja ArcGIS belum terisi.',
  'Angka inti tidak bisa direproduksi atau dipertanggungjawabkan di laporan.',
  'Unduh ERA5 2010–2024 dan jalankan <code>process_era5.py</code>; simpan berkas CMEMS asli beserta ID produk; isi metadata di <code>inventaris_data.csv</code>.'],
 ['k','K5','Data ekosistem hanya mencakup sebagian pesisir, sisanya tampak &ldquo;aman&rdquo; padahal kosong',
  'Karang, lamun, dan reef tidak ada di Lebak timur.',
  '<code>karang.geojson</code>, <code>lamun.geojson</code>, <code>reef.geojson</code>',
  'Ketiganya hanya mencakup bujur 105,21–105,82°BT. Bayah dan Sawarna (±106,2–106,3°BT) tidak punya satu pun poligon, sehingga jarak ke karang/lamun di sana dihitung &ldquo;jauh&rdquo; dan skor Ekosistem bisa terlalu tinggi karena <b>datanya tidak ada</b>, bukan karena ekosistemnya tidak ada (hanya mangrove dan konservasi yang masih tercakup sampai 107°BT).',
  'Lokasi di Lebak timur bisa terpilih dengan skor ekosistem yang menyesatkan.',
  'Tambah cakupan Allen Coral Atlas ke timur; sampai itu selesai, tampilkan peringatan &ldquo;di luar cakupan data karang/lamun&rdquo; pada titik di timur 105,82°BT.'],

 // ---------------- PENTING ----------------
 ['p','P1','Kriteria Daya (bobot 40%) hampir tidak membedakan lokasi',
  'Pada rata-rata tahunan semua titik mendapat skor Daya 5.',
  '<code>ecowave.js</code> (<code>dayaBatas</code>), <code>data.js</code>',
  'Ambang skor 5 adalah ≥ 20 kW/m, sedangkan seluruh titik CMEMS bernilai 20,48–25,57 kW/m. Hasil IDW selalu berada di rentang itu, jadi kriteria dengan bobot terbesar menjadi konstan dan peringkat ditentukan oleh tiga kriteria lain.',
  'Bobot 40% terasa berpengaruh di slider, padahal tidak mengubah peringkat tahunan.',
  'Kalibrasi ulang ambang dengan sebaran daya nyata (mis. kuantil) atau normalisasi min–maks; uji sensitivitas terhadap ambang, bukan hanya bobot.'],
 ['p','P2','Rumus daya air dalam dipakai di dekat pantai tanpa koreksi',
  'Tidak ada refraksi/shoaling; daya diambil dari titik lepas pantai.',
  '<code>data.js</code>, <code>ecowave.js</code>',
  'Rumus <code>0,49·Hs²·Te</code> sahih untuk kedalaman &gt; ±90 m (Te 11 s). Daya hanya diinterpolasi dari 4 titik lepas pantai (di laut dalam: ETOPO1 ±480–2.400 m pada P1–P3) lalu dianggap berlaku sampai pantai. Kedalaman ETOPO1 ±1,85 km: banyak sel pesisir terbaca daratan.',
  'Potensi di lokasi dekat pantai bisa terlalu tinggi dan kedalaman tidak bisa membedakan 20 m dari 50 m.',
  'Gunakan BATNAS (±185 m) atau data batimetri lokal; tambah titik gelombang dekat pantai atau model transformasi gelombang (mis. SWAN) bila perlu.'],
 ['p','P3','Estimasi listrik &amp; rumah terlalu disederhanakan',
  'Lebar 10 m, efisiensi 30%, dan CF 30% tanpa dasar.',
  '<code>data.js</code> (<code>hitungEstimasiListrik</code>)',
  'Nilai-nilai itu asumsi. &ldquo;Rumah (puncak)&rdquo; memakai daya <i>rata-rata</i>, bukan puncak, dan menganggap tiap rumah memakai penuh VA-nya. Energi tahunan mengalikan efisiensi dan faktor kapasitas sekaligus pada daya rata-rata; ini <b>kemungkinan mengurangi dua kali</b> (perlu dikonfirmasi dengan literatur/dosen pembimbing). Rugi kabel, inverter, downtime, dan profil beban belum ada.',
  'Jumlah rumah terlayani bisa jauh meleset dan sulit dipertahankan saat ditanya.',
  'Pakai kurva daya perangkat (power matrix) dari literatur/produsen; cantumkan rujukan untuk setiap parameter; beri rentang (min–maks), bukan satu angka.'],
 ['p','P4','Bobot, skor, ambang, dan buffer belum punya dasar ilmiah; validasi minim',
  'Semuanya ditetapkan tim.',
  '<code>ecowave.js</code> (<code>PARAM_DEFAULT</code>), tabel <code>mca_weights</code>',
  'Bobot 40/30/15/15, ambang jarak, skor kedalaman (kelas 4 = 5, kelas 6 = 2), dan buffer 1 / 0,5 km semuanya asumsi. Uji sensitivitas hanya menggeser bobot ±10 poin dan hanya memeriksa peringkat 1. Belum ada validasi CMEMS vs ERA5 vs literatur selatan Jawa.',
  'Penguji bisa bertanya &ldquo;dari mana angka ini?&rdquo; dan tidak ada jawaban.',
  'Tentukan bobot dengan AHP/wawancara pakar atau rujukan jurnal; perluas uji sensitivitas ke ambang dan buffer; bandingkan dengan lokasi PLTGL/potensi gelombang yang dipublikasikan.'],
 ['p','P5','Ada banyak versi aturan eksklusi yang saling bertentangan',
  'Lima sumber kebenaran untuk &ldquo;terlarang atau tidak&rdquo;.',
  '<code>database.sql</code> (<code>is_excluded</code>), <code>data.js</code> (<code>cekEksklusi</code>), <code>api/locations.php</code>, <code>peta.js</code> (lingkaran &amp; persegi), <code>ecowave.js</code> (poligon nyata)',
  'Kotak &ldquo;TN Ujung Kulon&rdquo; di kode (lintang −7,10…−6,70; bujur 105,10…106,00) jauh lebih lebar dari taman nasional dan menutup Binuangeun/Cikeusik. Persegi berlabel &ldquo;TN Ujung Kulon (eksklusi)&rdquo; di <code>peta.js</code> berada di laut lintang −7,3…−7,1, padahal taman nasional berada sekitar lintang −6,4…−6,9. Kotak &ldquo;jalur pelayaran&rdquo; dan lingkaran mangrove/karang adalah tebakan titik.',
  'Titik yang sama bisa dinyatakan terlarang di satu halaman dan boleh di halaman lain.',
  'Pakai satu sumber saja: poligon nyata di <code>ecowave.js</code>; hapus aturan kotak dan lingkaran lama dari <code>data.js</code>, <code>peta.js</code>, dan <code>api/locations.php</code>.'],
 ['p','P6','Data infrastruktur belum mewakili kenyataan',
  'Jalur pelayaran, pelabuhan, gardu, dan jalur listrik dari OSM apa adanya.',
  '<code>jalur_pelayaran.geojson</code>, <code>pelabuhan.geojson</code>, <code>gardu.geojson</code>, <code>jalur_listrik.geojson</code>',
  '&ldquo;Jalur pelayaran&rdquo; adalah rute ferry OSM, termasuk rute Pelni antarpulau (Jakarta–Jayapura dll.), bukan alur pelayaran resmi, dan masih membentang jauh di luar kotak studi (98,68–107,63°BT). Pelabuhan hanya 1 titik (Dermaga Sumur). Gardu listrik hanya 1 titik (Kp. Campaka Barat), sehingga skor jarak infrastruktur praktis bertumpu pada jalur listrik.',
  'Eksklusi pelayaran dan skor jarak jaringan tidak mencerminkan kondisi sebenarnya.',
  'Gunakan data alur pelayaran resmi (Kemenhub/BIG/Pushidrosal), tambah data pelabuhan/PPI, dan potong data ke kotak studi dengan benar.'],
 ['p','P7','Integrasi BMKG dan Windy masih rapuh dan terbatas',
  'Cakupan zona sempit dan bergantung pada alamat layanan luar.',
  '<code>api/bmkg.php</code>, <code>bmkg_peta.js</code>, <code>api/windy.php</code>, <code>config/windy.php</code>',
  'Hanya 3 zona terverifikasi (P.I.04–06). Alamat BMKG memuat tahun (<code>marine2026-data</code>) sehingga bisa putus saat berganti tahun. Cadangan &ldquo;panggil BMKG langsung dari browser&rdquo; rawan terblokir CORS. BMKG tidak punya periode gelombang. Kunci Windy masih placeholder; tanpa kunci dan tanpa internet, panel menampilkan angka SIMULASI.',
  'Panel BMKG/Windy bisa kosong atau berisi angka simulasi tanpa disadari pengguna.',
  'Pasang pemantauan sederhana (tampilkan tanggal terbit dan status cache), tambah zona lain secara terverifikasi, dan sembunyikan angka simulasi dari grafik utama.'],
 ['p','P8','Kandidat baru dari klik peta mendapat data bulanan buatan',
  'Grafik bulanan lokasi baru bukan data nyata.',
  '<code>api/locations.php</code> (<code>buat_wave</code>)',
  'Saat admin menambah lokasi dari klik, data bulanan dibangkitkan dari satu nilai kW dengan faktor musim tetap dan Te 9,9 s. Hasilnya tampak seperti deret data padahal sintetis.',
  'Grafik bulanan menyiratkan pengukuran yang tidak ada.',
  'Ambil nilai bulanan dari interpolasi CMEMS/ERA5 per bulan, atau tandai jelas &ldquo;perkiraan skala musiman&rdquo;.'],
 ['p','P9','Sumber, versi, tanggal unduh, dan lisensi data belum lengkap',
  'Banyak kolom metadata kosong.',
  '<code>05_docs/inventaris_data.csv</code>, <code>README.txt</code>',
  'Sumber mangrove, konservasi, perairan 5 km, dan versi Allen Coral Atlas/OSM tidak tercatat; nama atribut generik (&ldquo;Konservasi Laut&rdquo;). README mencatat video latar Mixkit berlisensi <i>personal use</i>, yang berisiko bila situs dipublikasikan.',
  'Tidak bisa disitasi dengan benar; ada risiko pelanggaran lisensi.',
  'Lengkapi metadata untuk setiap layer; ganti video dengan materi berlisensi bebas atau buatan sendiri; cantumkan atribusi OSM dan Allen Coral Atlas.'],

 // ---------------- PERBAIKAN ----------------
 ['q','Q1','Ada kode mati dan kode ganda',
  'Dua berkas JS besar tidak dimuat halaman mana pun.',
  '<code>assets/js/main.js</code> (188 baris), <code>assets/js/map_klik.js</code> (95 baris)',
  'Logika sama (peta, bobot, musim) ada di <code>main.js</code> dan di <code>core.js</code>/<code>peta.js</code>. <code>map_klik.js</code> memanggil Open-Meteo langsung dari browser. Fungsi login di <code>api/auth.php</code> memanggil <code>seed_users()</code> yang tidak didefinisikan di mana pun, sehingga login lewat API itu selalu gagal; login nyata terjadi lewat <code>config/auth.php</code>.',
  'Perubahan di satu tempat tidak berlaku di tempat lain; membingungkan saat pemeliharaan.',
  'Hapus berkas yang tidak dipakai atau pindahkan ke folder <code>arsip/</code>; satukan sistem login.'],
 ['q','Q2','Dua konfigurasi database berbeda',
  'Nama database tidak sama.',
  '<code>config/db.php</code> (<code>ecowave_db</code>) vs <code>config/auth.php</code> (<code>ecowave</code>)',
  'API memakai database <code>ecowave_db</code> (sesuai <code>database.sql</code>), sedangkan login memakai database <code>ecowave</code>. Bila database kedua tidak ada, koneksi gagal diam-diam dan login hanya jalan lewat akun bawaan, serta Kelola Pengguna tidak berfungsi. Kredensial MySQL juga root tanpa sandi.',
  'Perilaku berbeda antara komputer pengembang dan server.',
  'Satu berkas konfigurasi untuk semua; buat pengguna database khusus dengan hak terbatas dan simpan kredensial di luar repositori.'],
 ['q','Q3','Ketergantungan internet tinggi dan berkas berat',
  'Peta, grafik, font, dan tile gagal bila CDN/jaringan bermasalah.',
  '<code>includes/head.php</code>, <code>includes/foot.php</code>, <code>assets/video/</code> (±20 MB)',
  'Leaflet, Chart.js, html2canvas, ikon, font, dan tile peta dimuat dari CDN. Video latar ±20 MB (beberapa versi) memberatkan ponsel dan hosting gratis.',
  'Situs tidak bisa dipakai saat presentasi tanpa internet; lambat di jaringan seluler.',
  'Simpan pustaka di <code>assets/vendor/</code>; kompres video atau pakai gambar statis di ponsel; sediakan mode luring untuk demo.'],
 ['q','Q4','Pengujian otomatis baru menyentuh mesin hitung',
  'Tidak ada uji API, PHP, atau antarmuka.',
  '<code>tests/test_engine.js</code>',
  'Uji ECO-WAVE lolos (termasuk 271 sel zona), tetapi tidak ada uji untuk <code>api/*.php</code>, pembobotan di server, parser BMKG terhadap JSON nyata, maupun halaman.',
  'Perubahan kecil bisa merusak fitur tanpa diketahui.',
  'Tambah uji PHPUnit/curl untuk API, dan simpan contoh JSON BMKG/Windy sebagai fixture uji.'],
 ['q','Q5','Dokumentasi tidak sepenuhnya sesuai kode',
  'Beberapa pernyataan di README/skrip tidak persis terjadi.',
  '<code>README.txt</code>, <code>scripts/prepare_pltgl.py</code>',
  'Skrip dan README menyebut data &ldquo;dipotong ke kotak studi&rdquo;, padahal hanya fitur yang menyentuh kotak yang dipertahankan (garis tidak dipotong). Karang/lamun juga membuang poligon kecil (2.197→1.325 dan 1.264→720) tanpa dijelaskan di halaman.',
  'Pembaca mengira data lebih bersih/lengkap dari kenyataan.',
  'Perbarui README dan halaman Tentang Data; catat jumlah fitur sebelum dan sesudah penyederhanaan.'],
 ['q','Q6','Hasil analisis belum bisa diekspor untuk dipakai ulang',
  'Folder keluaran masih kosong.',
  '<code>04_output/</code>, <code>kalkulator.js</code>',
  'Hanya ada unduhan CSV per satu titik. Peringkat seluruh kandidat dan sel Zona ECO-WAVE belum bisa diunduh sebagai GeoJSON/CSV untuk dilampirkan di laporan atau dibuka di ArcGIS/QGIS.',
  'Sulit mereplikasi dan melampirkan hasil.',
  'Tambah tombol ekspor GeoJSON/CSV untuk peringkat dan zona grid, lengkap dengan parameter yang dipakai.'],
];
$S = [  // status perbaikan: b = sudah diperbaiki di kode, s = sebagian, t = butuh data/keputusan dari tim (tidak bisa diselesaikan lewat kode)
 'K1'=>['b','Semua angka Hasil CMEMS dan Beranda kini dihitung dari <code>data.js</code> dan parameter bersama; tabel &ldquo;2024&rdquo;, tren +2,1%, dan &ldquo;40%&rdquo; dihapus. Hero memakai &ldquo;Rumah 450 VA&rdquo;, bukan &ldquo;450 rumah&rdquo;.'],
 'K2'=>['s','Halaman Lokasi Terbaik diberi label DEMO dan memvalidasi tiap kandidat dengan data nyata (daratan, kedalaman, eksklusi, skor ulang). Kandidat sungguhan tetap harus diganti oleh tim.'],
 'K3'=>['b','Akun dan sandi dihapus dari modal dan kode; hanya <code>password_verify</code>; token CSRF + batas 5 percobaan/10 menit per IP; admin pertama dibuat lewat <code>config/setup_admin.php</code>. Catatan: akun lama berhash md5/teks polos tidak bisa login lagi, buat ulang.'],
 'K4'=>['t','Memerlukan unduhan ERA5/CMEMS asli dan proses <code>process_era5.py</code>. Tidak bisa dibuat lewat kode.'],
 'K5'=>['b','Cakupan habitat dihitung dari data; titik di luar cakupan mendapat peringatan di Peta, Kalkulator, dan Lokasi Terbaik, plus garis batas cakupan di peta dan penanda di hasil. Data tambahan Allen Coral Atlas tetap perlu diunduh.'],
 'P1'=>['b','Skor Daya kini normalisasi min–maks antar titik CMEMS (kontinu 1–5, mengikuti musim); mode absolut lama tetap tersedia di Parameter lanjutan. Ambang perlu divalidasi saat ERA5 tersedia.'],
 'P2'=>['t','Memerlukan BATNAS/model transformasi gelombang (SWAN). Batasan ditampilkan di Kalkulator.'],
 'P3'=>['s','Label &ldquo;Beban puncak&rdquo; diganti &ldquo;Sesaat&rdquo; dan catatan kemungkinan pengurangan ganda ditampilkan. Nilai parameter tetap menunggu literatur/pembimbing.'],
 'P4'=>['t','Memerlukan AHP/pakar/literatur. Bobot, ambang, dan buffer dapat diubah di Kalkulator untuk uji sensitivitas.'],
 'P5'=>['b','Aturan kotak/lingkaran lama dihapus dari <code>data.js</code>, <code>peta.js</code>, <code>api/locations.php</code>, dan layer palsu di panel Peta. Satu sumber: poligon nyata di <code>ecowave.js</code>; server hanya menyimpan hasilnya.'],
 'P6'=>['t','Memerlukan data alur pelayaran resmi dan pelabuhan tambahan.'],
 'P7'=>['s','Alamat BMKG mencoba tahun berjalan lalu tahun sebelumnya; cadangan CORS dihapus; angka simulasi Windy tidak lagi ditampilkan; tanggal terbit dan status cache tampil di navbar/Beranda. Zona tambahan tetap perlu diverifikasi.'],
 'P8'=>['b','Deret bulanan kandidat baru memakai bentuk klimatologi CMEMS dan ditandai &ldquo;perkiraan skala musiman&rdquo; di grafik.'],
 'P9'=>['s','Atribusi OSM/Esri/Allen Coral Atlas ditambah di footer dan peta. Kolom sumber/tanggal/lisensi di <code>inventaris_data.csv</code> tetap harus diisi tim. Video Mixkit sudah diganti video unggahan pemilik, tetapi sumber dan lisensinya belum tercatat (baris sudah ada di inventaris dan wajib diisi).'],
 'Q1'=>['b','<code>main.js</code> dan <code>map_klik.js</code> dipindah ke <code>arsip/</code>; login API dijadikan satu sistem dengan <code>config/auth.php</code>.'],
 'Q2'=>['b','Satu <code>config/config.php</code> (+ <code>config.local.php</code> / variabel lingkungan) dipakai API dan login; skema tabel users disatukan. Buat pengguna MySQL khusus, bukan root.'],
 'Q3'=>['s','Pemuat pustaka lokal siap (<code>assets/vendor/</code>, jalankan <code>python scripts/unduh_vendor.py</code> sekali dengan internet). Video latar kini ±2,4 MB (video lama dipindah ke <code>arsip/video_lama/</code>). Pustaka lokal belum terunduh di paket ini (butuh internet); font Google dan tile peta tetap butuh internet.'],
 'Q4'=>['b','Uji mesin diperluas (skor relatif, cakupan, parser BMKG dengan fixture, ekspor) dan kini ada <code>tests/test_api.js</code>: sintaks seluruh PHP, galat API tanpa database harus berupa JSON rapi, dan halaman utama tidak memuat pesan galat PHP. Uji antarmuka di browser dan uji dengan database nyata belum ada.'],
 'Q5'=>['b','README diperbarui (termasuk video latar dan cara menjalankan uji). Halaman Tentang Data sudah mencatat jumlah fitur sebelum/sesudah penyederhanaan (mis. karang 1.325 dari 2.197 poligon).'],
 'Q6'=>['b','Tombol unduh GeoJSON zona ECO-WAVE dan CSV peringkat kandidat (beserta parameter) ada di Kalkulator.'],
];
$SB = ['b'=>['Sudah diperbaiki','#617891'],'s'=>['Sebagian','#D5B893'],'t'=>['Butuh data/keputusan tim','#D5B893']];
$cnt = ['b'=>0,'s'=>0,'t'=>0]; foreach ($S as $v) $cnt[$v[0]]++;
$hit = ['k'=>0,'p'=>0,'q'=>0]; foreach ($C as $x) $hit[$x[0]]++;
$NAMA = ['k'=>['Kritis','Memengaruhi kepercayaan hasil atau keamanan; perbaiki lebih dulu.'],'p'=>['Penting','Memengaruhi kualitas analisis dan metodologi.'],'q'=>['Perbaikan kualitas','Kerapian, pemeliharaan, dan kenyamanan pemakaian.']];
?>
<div class="info-wrap">

  <div class="page-head band">
    <h1>Celah &amp; Kekurangan Web</h1>
    <p>Daftar jujur bagian yang masih kurang atau berisiko, di mana letaknya, kenapa jadi masalah, saran perbaikannya, dan <b>status perbaikannya saat ini</b>. Setiap butir sudah dicocokkan dengan isi berkas proyek. Klik judul untuk membuka rinciannya.</p>
  </div>

  <div class="sev-sum">
    <div class="k"><b><?= $hit['k'] ?></b><span>Kritis</span></div>
    <div class="p"><b><?= $hit['p'] ?></b><span>Penting</span></div>
    <div class="q"><b><?= $hit['q'] ?></b><span>Perbaikan kualitas</span></div>
    <div><b><?= count($C) ?></b><span>Total temuan</span></div>
    <div><b style="color:#617891"><?= $cnt['b'] ?></b><span>Sudah diperbaiki</span></div><div><b style="color:#D5B893"><?= $cnt['s'] ?></b><span>Sebagian</span></div><div><b style="color:#D5B893"><?= $cnt['t'] ?></b><span>Butuh data/tim</span></div>
  </div>

  <nav class="info-toc" aria-label="Isi halaman">
    <a href="#kritis">Kritis</a><a href="#penting">Penting</a><a href="#kualitas">Perbaikan kualitas</a><a href="#urutan">Urutan perbaikan</a><a href="#baik">Yang sudah baik</a><a href="#batas">Batas pemeriksaan</a>
  </nav>

  <?php foreach (['k'=>'kritis','p'=>'penting','q'=>'kualitas'] as $t => $anchor): ?>
  <section class="info-sec" id="<?= $anchor ?>">
    <h2><?= $NAMA[$t][0] ?> <span style="font-size:13px;font-weight:500;color:var(--o-mut)">· <?= $hit[$t] ?> temuan</span></h2>
    <p class="lead"><?= $NAMA[$t][1] ?></p>
    <?php foreach ($C as $x): if ($x[0] !== $t) continue; ?>
    <details class="celah <?= $t ?>"<?= $x[1] === 'K1' ? ' open' : '' ?>>
      <summary><span class="id"><?= $x[1] ?></span><span class="jdl"><?= $x[2] ?><span class="ringkas"><?= $x[3] ?></span></span><span class="stt" style="background:<?= $SB[$S[$x[1]][0]][1] ?>"><?= $SB[$S[$x[1]][0]][0] ?></span></summary>
      <div class="isi">
        <div><b>Di mana</b><?= $x[4] ?></div>
        <div><b>Temuan</b><?= $x[5] ?></div>
        <div><b>Dampak</b><?= $x[6] ?></div>
        <div class="saran"><b>Saran perbaikan</b><?= $x[7] ?></div>
        <div class="status-perbaikan"><b>Status perbaikan</b><?= $S[$x[1]][1] ?></div>
      </div>
    </details>
    <?php endforeach; ?>
  </section>
  <?php endforeach; ?>

  <section class="info-sec" id="urutan">
    <h2>Urutan perbaikan yang disarankan</h2>
    <p class="lead">Dari yang paling cepat mengurangi risiko sampai yang paling membutuhkan waktu.</p>
    <ol class="prioritas">
      <li><b>Amankan login</b> (K3): hapus akun dari modal dan kode, pakai hash. Cepat dan penting sebelum situs online.</li>
      <li><b>Perbaiki angka salah di Beranda</b> (K1; halaman Hasil CMEMS sudah dihapus dan ringkasannya pindah ke popup klik Peta): hitung dari data atau hapus.</li>
      <li><b>Beri label DEMO</b> pada Lokasi Terbaik dan kandidat sampai diganti (K2).</li>
      <li><b>Satukan aturan eksklusi</b> ke poligon nyata dan hapus kotak/lingkaran lama (P5).</li>
      <li><b>Tampilkan peringatan cakupan data</b> untuk titik di timur 105,82°BT (K5).</li>
      <li><b>Lengkapi metadata dan lisensi</b> semua data dan media (P9).</li>
      <li><b>Unduh ERA5 dan olah</b>; ganti titik CMEMS tertanam dan kalibrasi ambang daya (K4, P1).</li>
      <li><b>Cari dasar ilmiah</b> untuk bobot, ambang, dan parameter listrik; perluas uji sensitivitas (P3, P4).</li>
      <li><b>Rapikan kode</b>: hapus berkas mati, satu konfigurasi database, pustaka lokal, tambah uji (Q1–Q4).</li>
    </ol>
  </section>

  <section class="info-sec" id="baik">
    <h2>Yang sudah baik</h2>
    <div class="good">
      <ul style="margin:0">
        <li>README dan halaman Tentang Data sudah jujur menyatakan bahwa data bawaan adalah demo dan bukan hasil ERA5/BATNAS/ArcGIS.</li>
        <li>Data mentah disimpan terpisah di <code>01_raw/</code> dan tidak diubah; skrip pengolahan dapat diulang.</li>
        <li>API memakai prepared statement, validasi lintang/bujur, validasi format kode BMKG, dan cache; kunci Windy tidak sampai ke browser.</li>
        <li>Hak akses halaman Kelola dicek di server, bukan hanya disembunyikan.</li>
        <li>Mesin hitung terpisah dari tampilan dan sudah punya uji otomatis.</li>
        <li>Kalkulator memungkinkan semua parameter diubah dan menampilkan peringatan bila data tidak lengkap.</li>
      </ul>
    </div>
  </section>

  <section class="info-sec" id="batas">
    <h2>Batas pemeriksaan</h2>
    <div class="tip">Pemeriksaan dilakukan dengan membaca kode dan data di dalam zip proyek serta menjalankan perhitungan ulang. Hal yang <b>belum</b> diperiksa: tampilan dan perilaku peta langsung di browser dengan internet, koneksi ke database MySQL sungguhan, respons langsung BMKG/Windy, serta ketepatan angka CMEMS terhadap sumber aslinya (karena berkas mentah tidak tersedia). Butir yang bertanda &ldquo;kemungkinan&rdquo; perlu dikonfirmasi lebih lanjut.</div>
  </section>

</div>
<?php include __DIR__.'/includes/foot.php'; ?>
