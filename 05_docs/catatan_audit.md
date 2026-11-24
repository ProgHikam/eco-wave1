# Catatan audit ECO-WAVE (14 Nov 2026)

Ringkasan kekurangan situs dan data yang tidak valid. Semua angka di bawah diperiksa langsung dari berkas proyek.

## Data yang tidak valid / menyesatkan
1. hasil.php, kartu "Daya Maks 25,57 kW/m (Maks Harian)": 25,57 adalah rata-rata P0, bukan maksimum. Maksimum di data.js = 168,53 kW/m.
2. hasil.php, tabel "Data Bulanan 2024": angka tidak cocok dengan klimatologi bulanan di data.js (Jan 18,3 vs 18,54; Apr 26,8 vs 22,84; Jun 25,57 vs 34,01; Hs Jan 1,42 vs 1,88). Judul "12 bulan" tetapi hanya 6 baris. Tidak ada sumber seri 2024.
3. hasil.php, "Tren meningkat ~2,1%/tahun": regresi linear pada data tahunan di data.js memberi -0,20 kW/m per tahun (sekitar -0,8%/tahun).
4. hasil.php, "Titik Layak 40% (ambang 10 kW/m)": distribusi di data.js menunjukkan sekitar 93% waktu di atas 10 kW/m; 40% tidak punya dasar hitung. "Zona Eksklusi 1" dan "Lokasi Prioritas 3" juga ditulis manual.
5. index.php, hero "450 Rumah terlayani": 450 adalah kelas VA, bukan jumlah rumah (P0: 170/85/59 rumah).
6. Kandidat "Panimbang" (-6,65; 105,65): ETOPO1 menunjukkan +113 m (daratan). Kandidat lain berada di kedalaman ETOPO1 -1.119 m (Bayah), -1.796 m (Binuangeun), -1.591 m (Cikeusik) sehingga skor Kedalaman 3-4 tidak masuk akal untuk PLTGL dekat pantai.
7. "Cikeusik / Ujung Kulon" di database ditandai is_excluded=1, tetapi titiknya tidak berada di poligon konservasi dan tidak kena aturan eksklusi di data.js.
8. database.sql: seluruh skor, gelombang bulanan, dan 5 kandidat adalah DEMO (README mengakuinya). contoh_kandidat.geojson berisi catatan "DUMMY".
9. data.js: kotak eksklusi TN Ujung Kulon (lat -7,10..-6,70; lng 105,10..106,00) jauh lebih lebar dari taman nasional dan menutup Binuangeun/Cikeusik. Kotak "jalur pelayaran" lat -7,80..-8,00 dan Selat Sunda adalah tebakan.
10. data.js: 12 desa (koordinat dan jumlah penduduk) ditulis manual tanpa sumber.

## Data nyata yang punya celah
- Karang, lamun, reef (Allen Coral Atlas): hanya mencakup 105,21-105,82 BT. Pesisir Lebak timur (Bayah, Sawarna, 106,2-106,3 BT) tidak punya data sama sekali, jadi "tidak ada karang/lamun" di sana hanyalah ketiadaan data, bukan hasil.
- Karang dan lamun disederhanakan: 2.197 -> 1.325 dan 1.264 -> 720 poligon (poligon di bawah sekitar 16 m dibuang).
- Batimetri ETOPO1 ~1,85 km; banyak sel pesisir terbaca daratan. BATNAS belum dipakai. Poligon batimetri hanya 119 buah pada lat -7,08..-6,70.
- Jalur pelayaran: dari OSM (route=ferry), termasuk rute Pelni nasional (Jakarta-Jayapura dst.), bukan alur pelayaran resmi, dan tidak dipotong ke kotak studi (README dan skrip menyebut "memotong", padahal hanya menyaring fitur yang menyentuh kotak).
- Jalur listrik: 216 simpul di luar kotak studi.
- Pelabuhan: hanya 1 titik (Dermaga Sumur). Gardu: hanya 32 dari 67 bernama.
- Konservasi, mangrove, perairan 5 km: nama atribut generik ("Konservasi Laut", "Ekosistem Mangrove"), sumber dan tahun tidak tercatat.

## Yang masih kurang
- ERA5 2010-2024 belum diunduh (01_raw/era5_wave kosong); 02_processed, 03_arcgis, 04_output masih kosong. Peta masih memakai 4 titik CMEMS yang tertanam di kode.
- Kolom sumber_url, tanggal_unduh, lisensi, resolusi di inventaris_data.csv hampir kosong.
- Bobot, skor, buffer: belum ada dasar literatur/AHP/pakar; belum ada uji sensitivitas dan validasi (ERA5 vs CMEMS vs literatur).
- Keamanan: akun demo admin/admin123 dan user/user123 dibuat otomatis; MySQL root tanpa password; kunci Windy masih placeholder; CSRF dan pembatasan login belum dipasang.
- Dua salinan logika peta (main.js dan peta.js) dengan fungsi hampir sama; jika main.js sudah tidak dipakai sebaiknya dihapus.
- Peta dan Kalkulator bergantung pada CDN (Leaflet, Chart.js, Tailwind, font, tile) sehingga tidak jalan offline.
