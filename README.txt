CATATAN PERUBAHAN v19 (20 NOV 2026)
-----------------------------------
- Beranda: kartu hero dirapikan (tanpa lekukan, panah sungguhan, seluruh kartu bisa diklik). Kartu "Titik terbaik" diganti
  "Gelombang puncak" (bulan dengan daya rata-rata tertinggi, klimatologi CMEMS). "Pantauan langsung" jadi bagian 01, "Cara kerja" 02;
  sub-navbar dipindah tepat di bawah hero dan section pertama tidak lagi menyembul di tampilan awal.
- Navbar per halaman diselaraskan dengan urutan halaman. Tombol ganda dihapus dari navbar (bagiannya tetap ada tanpa nomor):
  Tentang Web (Cakupan, Keamanan, Teknologi), Tentang Data (Pembaruan data, Tim), Teknologi (Fitur penunjang). Kelola: kartu diurutkan
  sesuai tampilan dan ada tombol "Pengguna". Penanda tombol aktif dihitung ulang saat scroll.
- Catatan pengerjaan dihapus dari halaman publik: blok "Pembaruan paket data PLTGL", bagian "Audit asal data" (datanya tetap di
  assets/data/sumber_data.json), kolom "Saran" di Kualitas data, kalimat "belum tercatat/rencananya", petunjuk login & publikasi di
  Teknologi. Pita "titik acuan dari database tidak terbaca" kini hanya tampil di halaman Kelola.
- celah.php tidak dihapus, tetapi KHUSUS ADMIN (tautan ada di halaman Kelola) dan tidak lagi muncul di daftar fitur/pencarian.
- Tentang Data: bagian baru "10 Tahap pengembangan: data yang belum lengkap dan pemeliharaan" (#pengembangan), berisi:
  data mangrove/lamun/karang yang belum mencakup pesisir timur dan dampaknya pada skor Ekosistem (#data-ekosistem), alasan ERA5
  belum dimasukkan (#era5), tahapan, dan jadwal pemeliharaan. Sebutan ERA5 di Tentang Web, Teknologi, dan FAQ (pertanyaan baru),
  jawaban FAQ Bayah/Sawarna, serta banner Lokasi Terbaik menautkan ke bagian ini.
- Teknologi: baris "Animasi Beranda" diganti "Kartu ringkasan Beranda" (animasi PLTGL tidak ditampilkan di hero).
- Terjemahan Inggris untuk semua teks baru/diubah ada di assets/js/kamus/tambahan.js (blok v19).
- Tugas tim yang tadinya tertulis di halaman: lengkapi metadata (tanggal unduh, versi, lisensi) di 05_docs/inventaris_data.csv;
  unduh & olah ERA5 (scripts/process_era5.py); data karang/lamun timur 105,82°BT lalu node scripts/hitung_kandidat.js --tulis.
- Setelah mengubah isi halaman, jalankan python3 scripts/bangun_indeks_cari.py.

CATATAN PERUBAHAN v14 (16 NOV 2026)
-----------------------------------
- Menu Informasi (Tentang Web, Tentang Data, Teknologi & Metode) diperbarui sesuai kode sekarang. Data yang disiapkan kelompok (mangrove,
  konservasi, perairan 5 km, 12 desa, 5 kandidat contoh, bobot dan asumsi) ditulis sebagai "hasil manual dari kelompok kami".
  Rincian: 05_docs/catatan_v14.md. Setelah mengubah isi halaman, jalankan python3 scripts/bangun_indeks_cari.py.

CATATAN PERUBAHAN v12 (16 NOV 2026)
-----------------------------------
- LOGIN DIPERBAIKI. Penyebab utama gagal masuk: versi sebelumnya menghapus akun bawaan, sehingga login baru bisa dipakai setelah admin
  dibuat; bila tabel users lama masih berisi admin, setup_admin.php terkunci dan tidak ada jalan masuk. Perbaikan:
  * config/reset_admin.php (BARU): membuat admin baru atau mengganti kata sandi akun yang ada, sekaligus membuka kunci percobaan login.
    Hanya bisa dibuka dari localhost; hapus berkas ini di server produksi.
  * Pesan login kini membedakan salah sandi, database tidak tersambung, terlalu banyak percobaan (dengan sisa menit), dan formulir
    kedaluwarsa. Sebelumnya database mati juga tampil sebagai "username atau kata sandi salah" dan dihitung sebagai percobaan gagal.
  * Tabel users dibuat otomatis saat login bila belum ada.
  * Modal login menampilkan tautan yang tepat: setup admin (belum ada admin), atur ulang (localhost), atau info database mati.
- HALAMAN CELAH DIHAPUS dari menu publik (sejak v19 celah.php tersedia khusus admin).
- HALAMAN TEKNOLOGI & METODE DIPERBARUI agar sesuai kode sekarang: skor Daya relatif (bawaan) dan absolut, daftar layer PLTGL beserta
  jumlah fiturnya, peringatan cakupan data habitat, papan status bersama, Windy/Open-Meteo dan cache, bagian baru "Login & keamanan"
  dan "Fitur penunjang", daftar halaman/API terbaru, glosarium diperluas, contoh hitung MCDA memakai skor relatif.
- Indeks pencarian dibangun ulang (python3 scripts/bangun_indeks_cari.py). Ketiga uji Node lolos.

CATATAN PERUBAHAN v7 (PENGGANTIAN NAMA)
----------------------------------------
- Nama web berubah dari CIHUY menjadi ECO-WAVE (judul halaman, navbar, footer, Tentang Web, README, komentar kode).
- Folder: eco-wave (URL lokal http://localhost/eco-wave).
- Database bawaan: ecowave_db (sebelumnya cihuy_db); pengguna contoh: ecowave_app. Variabel lingkungan: ECOWAVE_DB_HOST/_NAME/_USER/_PASS.
  Bila sudah punya database cihuy_db, import ulang database.sql atau ubah nama di config/config.local.php.
- PENCARIAN KATA KUNCI (BARU): tombol "Cari" di navbar, bilah cari di hero beranda, pintasan Ctrl+K atau "/". Mencari di seluruh isi
  halaman (rumus, glosarium, metode, FAQ, dll.), fitur, lokasi/desa, dan layer data. Berkas: assets/js/cari.js, assets/css/cari.css,
  assets/data/cari_indeks.json. PENTING: setelah mengubah isi halaman, jalankan  python3 scripts/bangun_indeks_cari.py  agar indeks ikut baru.
  Uji: node tests/test_cari.js
- MODE AKSESIBILITAS (BARU): tombol ikon orang di navbar atau Alt+A. Ukuran teks (100-200%), kontras tinggi gelap/terang, skala abu-abu,
  pilihan font (Verdana, Lexend, Atkinson, OpenDyslexic, Serif), jarak baris/huruf, garis bawah tautan, fokus keyboard tebal, kursor besar, hentikan animasi & video latar,
  baca nyaring (Web Speech, id-ID). Juga ada tautan "Lompat ke konten utama". Disimpan di localStorage (ecowave_a11y).
  Berkas: assets/js/aksesibilitas.js, assets/css/aksesibilitas.css. Uji: node tests/test_aksesibilitas.js
- NAVBAR dirapikan: tombol Cari dan Aksesibilitas dikelompokkan; jam, status BMKG, dan nama akun disembunyikan bertahap di layar sempit agar tidak terpotong.
- Tentang Web > Fitur: ditambah kartu Pencarian Kata Kunci dan Mode Aksesibilitas, juga FAQ dan bagian Kemudahan Akses diperbarui.
- BERANDA: sisi kiri hero kini berisi animasi PLTGL (pelampung penyerap gelombang naik-turun mengikuti ombak, generator di dasar laut,
  kabel bawah laut berdenyut ke gardu dan rumah, lamun/karang/ikan tetap utuh). Disembunyikan di layar < 1260 px; mati bila "kurangi gerakan".
- MODE KONTRAS TINGGI: latar video TIDAK lagi dihilangkan. Hanya panel/kartu/tombol yang dibuat solid; teks di atas video diberi halo dan
  video diberi lapisan gelap/terang tipis. Penandaan elemen berlatar dilakukan aksesibilitas.js (kelas .ax-bg).
- Kunci penyimpanan browser (cihuy_*) menjadi ecowave_*: pengaturan peta/bobot tersimpan lama akan kembali ke bawaan sekali.

CATATAN PERUBAHAN v5
--------------------
- tentang_web.php (BARU, menu Informasi > Tentang Web): tujuan, daftar fitur (dipindah dari teknologi.php), cara memakai, cakupan,
  peran pengguna, tampilan, keamanan, batasan, cara memasang, tanya-jawab, tim.
- Navbar: tanpa warna oranye, tanpa blur (assets/css/navbar.css bagian akhir); blur kartu/panel lain dikurangi ke 3px.
- Daftar fitur (kartu per halaman + tautan langsung ke bagian/tab fitur) kini di tentang_web.php#fitur; teknologi.php hanya memuat penunjuk.
  Tautan langsung: peta.php#layer|mca|windy|bmkg|asumsi|info (assets/js/deeplink.js), kalkulator.php#k-titik ... #k-csv,
  index.php#langsung|cara-kerja|jelajahi|ecowave.
- tentang.php: ditulis ulang menjadi katalog data (ringkasan, peta skema cakupan, kartu per layer dengan filter/pencarian,
  data non-spasial, alur data, tabel sumber, metode, kualitas & keterbatasan). Jumlah fitur/ukuran dibaca dari
  assets/data/pltgl/manifest.json. assets/css/halaman-data.css, assets/js/tentang.js.
- admin.php: ditambahkan include foot.php (sebelumnya halaman tidak ditutup dan skrip tidak dimuat).

ECO-WAVE: PETA INTERAKTIF ZONA PEMBANGKIT LISTRIK TENAGA GELOMBANG RAMAH EKOSISTEM DI PESISIR SELATAN BANTEN
=============================================================================================================
ECO-WAVE = Ecosystem-aware Wave Energy.

STATUS DATA
-----------
Paket ini adalah PROTOTIPE aplikasi. Status tiap data (nyata / acuan / simulasi /
asumsi) dan rencana penggantiannya dengan sumber resmi (BPS, BIG, KLHK, BMKG,
CMEMS) ada di halaman Tentang Data, bagian "Tabel sumber data lengkap"; rencana
penggantiannya ada di assets/data/sumber_data.json (tidak lagi ditampilkan).
- Data Simulasi: 12 desa acuan (koordinat dan jumlah penduduk tidak dapat
  ditelusuri). Jangan dikutip sebagai fakta.
- Bobot 40:30:15:15, ambang skor, buffer eksklusi, dan parameter perangkat adalah
  ASUMSI tim yang belum divalidasi (lihat "Studi Literatur dan Referensi
  Akademis" di Tentang Data; daftar: assets/data/referensi.json).
- Tidak ada data ERA5 maupun BATNAS di paket ini (tahap awal; lihat Tentang Data bagian 10). Windy adalah prakiraan
  jangka pendek. Potensi gelombang (kW/m) bukan daya listrik terbangkit.

SATU SUMBER KEBENARAN PERHITUNGAN
---------------------------------
Faktor, bobot bawaan, kelas, dan rumus ada di assets/js/ecowave.js (FAKTOR,
KELAS, hitungTitik, faktorMusim). Peta dan Kalkulator memakai rumus yang sama.
Uji: node tests/test_konsistensi.js

EXPORT PNG / PDF
----------------
assets/js/ekspor.js (tanpa pustaka luar). Tombol ada di hasil klik Peta,
panel lokasi kandidat Peta, dan Kalkulator. Harness uji: tests/harness/ekspor.html.

INSTALASI LOKAL (XAMPP)
-----------------------
1. Ekstrak folder eco-wave ke C:\xampp\htdocs\eco-wave.
2. Jalankan Apache dan MySQL.
3. Buka phpMyAdmin, buat/import database dengan file database.sql.
   PERHATIAN: database.sql berisi DROP TABLE; backup database lama sebelum import.
4. Buka http://localhost/eco-wave.
5. Buat admin pertama di http://localhost/eco-wave/config/setup_admin.php (hanya jalan selama belum ada admin).
   TIDAK ada akun bawaan lagi (admin/admin123 dan user/user123 versi lama sudah dihapus). Konfigurasi database satu tempat:
   config/config.php (timpa lewat config.local.php).
   Lupa kata sandi atau admin lama tidak bisa masuk: buka http://localhost/eco-wave/config/reset_admin.php (hanya dari komputer server).
6. CDN Leaflet, Chart.js, Tailwind, Google Fonts dan basemap membutuhkan internet.

ALUR DATA SESUAI PANDUAN PROYEK
-------------------------------
Folder kerja yang disarankan:
  01_raw/         data asli, jangan diedit
  02_processed/   raster/tabel hasil Python
  03_arcgis/      project ArcGIS dan geodatabase
  04_output/      GeoJSON/CSV/raster siap web
  05_docs/        metadata, sumber, asumsi, catatan validasi

ERA5:
1. Unduh ERA5 hourly single levels untuk 2010–2024, variabel Hs
   (significant_height_of_combined_wind_waves_and_swell) dan Tp (peak_wave_period),
   area N=-6, W=104.5, S=-8, E=107, interval 3/6 jam, NetCDF.
2. Letakkan file di 01_raw/era5_wave/.
3. Pasang dependensi:
   pip install xarray netcdf4 numpy pandas rioxarray rasterio dask
4. Dari root proyek jalankan:
   python scripts/process_era5.py --input "01_raw/era5_wave/*.nc"
   Jika nama variabel berbeda, gunakan --hs NAMA --tp NAMA --time NAMA.
5. Output: P_annual.tif, P_DJF.tif, P_MAM.tif, P_JJA.tif, P_SON.tif,
   P_per_grid.csv, processing_metadata.csv dalam 02_processed/.
6. Script memakai asumsi Te=0.9*Tp dan P=0.49*Hs^2*Te (kW/m).
   Cantumkan asumsi dan referensi ilmiahnya di laporan. Cek nama variabel,
   dimensi waktu, rentang nilai, missing value, dan CRS sebelum dipakai.

BATNAS/GEBCO, EKOSISTEM, KONSERVASI, INFRASTRUKTUR:
- Ikuti panduan kelompok: BATNAS (cadangan GEBCO), Mangrove Nasional/GMW,
  Allen Coral Atlas, WDPA + data KKP/KLHK, RBI/geoBoundaries, OSM.
- Simpan sumber, tanggal unduh, lisensi, resolusi, CRS, dan proses pengolahan.
- ArcGIS: Project/Project Raster ke EPSG:32748, Clip/Extract by Mask,
  Reclassify skala 1–5, zona eksklusi biner, Euclidean Distance,
  Weighted Overlay. Resample hanya menyamakan grid, bukan menambah akurasi.
- Ekspor vektor GeoJSON EPSG:4326 dan tabel atribut/CSV untuk integrasi web.
- Jangan menetapkan skor/buffer/bobot sebagai fakta tanpa dasar literatur/AHP/pakar.

FITUR WEB
----------
- Peta Leaflet, layer, pencarian lokasi, ranking MCA, detail, grafik, bandingkan.
- Bobot awal 40/30/15/15; bobot dari tabel mca_weights dibaca oleh API.
- Mask eksklusi: lokasi yang terkena mask dikeluarkan dari ranking (skor 0).
- Admin dapat CRUD titik kandidat. Lokasi baru dibatasi pada kotak studi.
- Endpoint API memakai PDO prepared statements dan pemeriksaan role admin.
- Panel Windy hanya untuk prakiraan jangka pendek. Kunci disimpan di
  config/windy.php, jangan pernah dimasukkan ke JavaScript atau repositori publik.
- Tanpa kunci, panel menampilkan SIMULASI. Jangan gunakan angka simulasi dalam laporan.

KEAMANAN SEBELUM PUBLIKASI
--------------------------
- Ganti password demo dan kredensial MySQL di config/db.php.
- Simpan config/windy.php dan kredensial di luar repositori publik bila deploy.
- Gunakan HTTPS, batasi akses admin, backup database, dan nonaktifkan akun demo.
- CSRF dan pembatasan login (5 gagal/10 menit per IP) sudah aktif; pakai pengguna MySQL khusus (bukan root).
- Kandidat di database kini hasil analisis data nyata (penapisan awal), bukan demo. Tetap verifikasi sebelum dikutip (lihat 05_docs/catatan_v15.md).
- Cek kesiapan: python3 scripts/siapkan_produksi.py   (di server publik tambahkan --hapus-setup untuk menghapus setup_admin.php/reset_admin.php).
- Pengguna MySQL khusus: jalankan database_pengguna.sql sebagai root, lalu salin config/config.local.example.php -> config.local.php.

INTEGRASI BMKG MARITIM (PRAKIRAAN PERAIRAN)
-------------------------------------------
Sumber: https://maritim.bmkg.go.id/marine2026-data/perairan/<KODE>.json (dokumentasi: maritim.bmkg.go.id/apidoc).
- api/bmkg.php : proxy server + cache 30 menit; hanya menerima kode berformat BMKG (mis. P.I.06).
- Peta   : tab dock "BMKG Maritim" (assets/js/bmkg_peta.js). Klik peta menyarankan zona terdekat (perkiraan,
           bukan batas resmi BMKG); menampilkan Hs, angin, arus, cuaca, dan grafik 4 hari.
- Kalkulator: sumber "BMKG Maritim" (sudah ada) kini punya pilihan zona pesisir selatan Banten.
- Kode zona terverifikasi dari berkas BMKG: P.I.04 Selat Sunda Barat Pandeglang, P.I.05 Perairan Selatan
  Pandeglang, P.I.06 Perairan Selatan Lebak. Zona lain: pilih "Kode lain" di Kalkulator.
- Batasan: prakiraan jangka pendek (UTC; hari ke-1 per jam, hari ke-2 s/d 4 per 3 jam), tidak ada periode
  gelombang. Karena itu BMKG tidak mengubah skor MCA maupun daya gelombang (kW/m).

STRUKTUR FOLDER
---------------
01_raw/ data asli (dilindungi .htaccess) | 02_processed/ 03_arcgis/ 04_output/ (siap diisi)
05_docs/inventaris_data.csv: daftar layer, berkas web, jumlah fitur, CRS, status.
scripts/ dan tests/ (dilindungi .htaccess; uji: node tests/test_engine.js).

BATASAN METODOLOGI
------------------
- Resolusi ERA5 yang relatif kasar membatasi ketelitian pesisir; gunakan sel laut
  terdekat dan nyatakan keterbatasannya.
- Te diestimasi dari Tp, bukan dihitung dari spektrum gelombang.
- BATNAS dan layer habitat dapat tidak lengkap; hasil hanya penapisan awal.
- Skor, ambang kedalaman, buffer, dan bobot memerlukan literatur/AHP/pakar.
- Validasi: bandingkan ERA5-CMEMS, literatur selatan Jawa, dan uji sensitivitas.

STRUKTUR HALAMAN (multi-halaman)
--------------------------------
Setiap fitur punya halaman sendiri; pindah halaman lewat klik navbar.
  index.php     Beranda (hero, KPI)
  peta.php      Peta analisis (Leaflet, layer, bobot MCA, Windy, klik peta)
  terbaik.php   Lokasi Terbaik (3 peringkat teratas)
  tentang.php   Tentang Data & Metode
  admin.php     Kelola Lokasi (khusus admin; dicek di server)
  includes/head.php        navbar + <head> bersama
  includes/foot.php        footer, modal login, pemuat skrip
  includes/modal_lokasi.php  formulir lokasi + pilih titik CMEMS
  assets/js/core.js        state, helper, API, login (semua halaman)
  assets/js/data.js        data CMEMS/desa/ekosistem + fungsi hitung
  assets/js/windy.js       ambil prakiraan gelombang (api/windy.php)
  assets/js/lokasi_form.js formulir tambah/ubah/hapus lokasi
  assets/js/peta.js | terbaik.js | beranda.js | admin.js | ui.js
Bobot MCA dan mode eksklusi yang diatur di halaman Peta disimpan di
sessionStorage sehingga halaman Lokasi Terbaik memakai bobot yang sama.
Gelombang live: memakai Windy bila kunci diisi di config/windy.php; bila kosong
otomatis memakai GFS Wave via Open-Meteo Marine (label di panel menyebut sumbernya).
Video latar situs: assets/video/bg-samudra.(mp4|webm|jpg) + bg-samudra-720.mp4 (ponsel), dari video unggahan pemilik proyek
(berkas asal 1920x1080, 30 fps). SUMBER & LISENSI VIDEO BELUM TERCATAT: isi di 05_docs/inventaris_data.csv sebelum situs dipublikasikan.

TEMA TAMPILAN "OCEAN POWER" (laut + listrik)
--------------------------------------------
assets/css/tema.css  tema utama, dimuat PALING AKHIR dari includes/head.php.
                     Berisi token warna, utilitas pengganti Tailwind (hidden, flex, grid, gap, dll),
                     navbar, kartu, tabel, form, modal, footer. Hanya tampilan, tanpa logika.
assets/video/        bg-samudra.mp4/.webm/.jpg dan bg-samudra-720.mp4 (ponsel). Video lama dipindah ke arsip/video_lama/ (tidak dimuat web).
Catatan: class panel kiri di peta.php bernama "kiri" (sebelumnya "pl" bentrok dengan penanda denyut peta).

ECO-WAVE (Ecosystem-aware Wave Energy) - TAMBAHAN
=================================================
Peta interaktif zona PLTGL ramah ekosistem di pesisir selatan Banten. Semua fitur lama tetap ada; yang ditambahkan:
  kalkulator.php            Kalkulator ECO-WAVE: daya gelombang, listrik, rumah terlayani, MCDA, jarak ke data PLTGL,
                            peringkat kandidat (data nyata), uji +-10% bobot, zona grid, parameter lanjutan, CSV.
  api/bmkg.php              Proxy prakiraan BMKG Maritim (https://maritim.bmkg.go.id/marine2026-data/perairan/<KODE>.json),
                            cache 30 menit. Kode contoh: M.09 (Samudra Hindia selatan Jawa Barat), M.19 (Laut Jawa bagian barat).
                            Butuh PHP dengan cURL atau allow_url_fopen dan akses internet keluar.
  assets/js/ecowave.js      Mesin hitung (jarak spasial, kedalaman, skor, MCDA, energi, parser BMKG). Tanpa DOM.
  assets/js/ecowave_data.js Layer Leaflet data PLTGL. assets/js/kalkulator.js, pltgl_peta.js = UI.
  assets/data/pltgl/        Data PLTGL siap web (disederhanakan) + batimetri_grid.json (dari ETOPO1) + manifest.json.
  01_raw/Data_PLTGL/        Data asli (tidak diubah). Regenerasi: python scripts/prepare_pltgl.py
  tests/test_engine.js      Uji mesin di Node:  node tests/test_engine.js
Peta: kartu "Data PLTGL (ECO-WAVE)" di tab Map/Layer (11 layer + tombol Zona ECO-WAVE); setiap klik peta menambah ringkasan
data nyata di bawah hasil lama. Bobot MCA/eksklusi dibagi antara Peta dan Kalkulator (sessionStorage).
Catatan metodologi:
- JSON BMKG hanya memuat Hs (tanpa periode). Te diisi pengguna, jadi P dari BMKG = estimasi campuran untuk seluruh zona perairan.
- Daya CMEMS berasal dari titik lepas pantai P0-P3 (IDW); refraksi/shoaling dekat pantai tidak dimodelkan. Zona grid utara
  lintang -6,60 (Selat Sunda/Teluk Banten) dilewati.
- Kedalaman ETOPO1 ~1,85 km: kasar di pesisir (banyak sel pesisir terbaca daratan).
- Skor, buffer (mangrove/karang/reef 1 km, lamun 0,5 km, pelayaran 0,5 km), dan ambang adalah asumsi awal yang bisa diubah;
  validasi dengan literatur/AHP/pakar. Eksklusi lama (kotak kasar TN Ujung Kulon dll.) tetap ada di panel Peta lama;
  eksklusi baru memakai poligon nyata sehingga hasilnya bisa berbeda.

HALAMAN INFORMASI (ditambahkan 14 Nov 2026)
-------------------------------------------
  tentang.php    Tabel sumber data + status keandalan tiap data
  teknologi.php  Teknologi, rumus, parameter, MCDA, eksklusi, integrasi BMKG, glosarium
  includes/info_helper.php, assets/css/halaman-info.css  pembantu & gaya halaman informasi
  assets/css/peta-lega.css  tabel dan panel peta lebih lega (tombol "Perlebar")
  05_docs/catatan_audit.md  catatan audit data

PEMBARUAN 14 NOV 2026 (perbaikan, peta, navbar, integrasi beranda)
-----------------------------------------------------------------
- Navbar baru: assets/css/navbar.css + assets/js/nav.js (dropdown Informasi, indikator gelombang BMKG langsung, menu ponsel).
- Peta Leaflet (peta.php, kalkulator.php): assets/js/peta_gaya.js + assets/css/peta-gaya.css (pilihan peta dasar Gelap/Laut/Satelit/
  Jalan/Topografi/OSM yang diingat antar halaman, lencana skor, popup kartu, legenda, koordinat, skala, layar penuh, garis batas
  cakupan data karang/lamun).
- Integrasi realtime: core.js memuat SINKRON (localStorage + BroadcastChannel) untuk bobot MCA, eksklusi, musim, parameter perangkat,
  Te BMKG, dan analisis terakhir. Beranda, Peta, Kalkulator, Hasil, dan Lokasi Terbaik membaca nilai yang sama dan ikut berubah
  seketika (juga lintas tab). bmkgLive() = cache prakiraan BMKG bersama.
- Skor Daya kini relatif (min-maks titik CMEMS) agar bobot 40% membedakan lokasi; mode absolut lama ada di Parameter lanjutan.
- Aturan eksklusi satu sumber: poligon nyata di ecowave.js. Kotak/lingkaran lama dihapus (data.js, peta.js, api/locations.php).
- Ekspor: GeoJSON zona ECO-WAVE dan CSV peringkat kandidat (Kalkulator).
- Pustaka lokal opsional: python scripts/unduh_vendor.py (lalu situs jalan tanpa CDN).
- main.js dan map_klik.js (tidak dipakai) dipindah ke arsip/.
- Uji: node tests/test_engine.js

LATAR VIDEO & TEMA (14 Nov 2026, pembaruan 2)
---------------------------------------------
- (Diganti) Latar situs semula bg-utama.*; kini bg-samudra.* (lihat catatan di atas). Berkas lama ada di arsip/video_lama/.
  Video lama (bg-malam, bg-laut, bg-globe, kapal-bg) dihapus; total folder video kini ~12 MB. CATAT sumber dan lisensi video ini.
- Navbar dan header Peta memakai tema tenang (solid, palet biru laut + satu aksen hangat), tanpa efek neon.


KANDIDAT LOKASI & ANGKA BERANDA (v15)
-------------------------------------
- node scripts/hitung_kandidat.js           : cetak 5 kandidat hasil analisis (tidak menulis berkas).
- node scripts/hitung_kandidat.js --tulis   : perbarui database.sql, assets/js/core.js (FB), contoh_kandidat.geojson, ringkasan_zona.json.
  Setelah itu import ulang database.sql dan jalankan python3 scripts/bangun_indeks_cari.py bila teks halaman berubah.
- node tests/test_kandidat.js               : pastikan semua berkas di atas sinkron.
- Kartu Beranda (Sel Pesisir Layak, Sel Tereksklusi) dibaca dari assets/data/ringkasan_zona.json (grid zona, bobot bawaan).


UJI OTOMATIS (19 Nov 2026)
--------------------------
node tests/test_api.js  : sintaks seluruh PHP, galat API tanpa database harus berupa JSON rapi, halaman utama tidak memuat pesan galat PHP.
Jalankan semua: for f in tests/test_*.js; do node $f; done
