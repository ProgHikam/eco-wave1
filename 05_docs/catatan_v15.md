# Catatan v15 (17 Nov 2026)

## Yang berubah
- **Kalkulator**: hasil dibuat mudah dibaca (kesimpulan bahasa biasa, skala 1-5, kartu kriteria, alur listrik, peringkat/zona dengan bar skor). Rumus dan fungsi tidak berubah. File: `kalkulator.php`, `assets/css/kalkulator.css`, `assets/js/kalkulator.js` (hanya HTML hasil).
- **Navbar**: tampilan diperindah lewat `assets/css/navbar-plus.css` (HTML dan `nav.js` tidak diubah; tetap tanpa blur dan tanpa oranye).
- **Kandidat bukan demo lagi**: `scripts/hitung_kandidat.js` memilih sel terbaik tiap ruas pesisir dari grid Zona ECO-WAVE (data nyata) lalu menulis `database.sql`, `core.js` (fallback), `contoh_kandidat.geojson`, `ringkasan_zona.json`. Uji: `tests/test_kandidat.js`.
- **Angka Beranda**: "Sel Pesisir Layak" dan "Sel Tereksklusi" kini dari grid zona (1.010 sel, 47 tereksklusi), bukan dari 5 kandidat. "Daya" = titik CMEMS tertinggi. Label DEMO diganti "data nyata / penapisan awal" di Beranda, Peta, Lokasi Terbaik, Tentang Data, Tentang Web, Teknologi.
- **Teknis**: `database_pengguna.sql` (pengguna MySQL khusus), `scripts/siapkan_produksi.py` (pemeriksaan kesiapan), indeks pencarian dibangun ulang (96 entri).

## Temuan penting (baca sebelum presentasi)
1. **Koordinat kandidat demo lama tidak layak untuk analisis nyata**: Panimbang (-6,65; 105,65) berada di DARATAN (ETOPO1 +113 m); Bayah, Binuangeun, dan Cikeusik berada di laut dalam (-1.100 sampai -1.800 m, 20-30 km dari pantai, di luar perairan 5 km). Karena itu kandidat diganti, bukan hanya dinilai ulang.
2. **Bayah dan Sawarna di luar cakupan data karang/lamun** (data hanya 105,21-105,82 BT). Skor Ekosistem 5 di sana berarti *tidak ada data*, sehingga keduanya tampak peringkat teratas (3,91 dan 3,81) padahal belum terverifikasi. Kandidat terverifikasi terbaik: Panimbang (3,72).
3. Skor Daya relatif (rentang 20,48-25,57) membuat daya hampir sama di semua kandidat (21,8-23,3 kW/m); pembeda utama adalah Ekosistem dan Jarak.
4. Tidak ada kandidat tereksklusi sekarang (sebelumnya satu contoh). Eksklusi tetap bisa dilihat di grid zona (47 sel).

## Yang masih harus Anda kerjakan (tidak bisa dari sini)
- Login dan klik semua menu (termasuk dropdown Informasi) di komputer Anda; `import database.sql` ulang karena kandidat berubah.
- Jalankan `python scripts/unduh_vendor.py` sekali dengan internet; buat `config/config.local.php` dengan pengguna dari `database_pengguna.sql`; lalu `python3 scripts/siapkan_produksi.py`.
- Data: tambah gardu/pelabuhan, karang/lamun/reef Bayah-Sawarna, ERA5 untuk validasi CMEMS (rentang skor Daya 20,48-25,57), BATNAS pengganti ETOPO1, dan dasar bobot/ambang (AHP atau pakar). Setelah data baru: `node scripts/hitung_kandidat.js --tulis`.
