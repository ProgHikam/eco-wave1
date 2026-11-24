# Catatan tambahan v16b (17 Nov 2026)
- `.htaccess` root (BARU): blokir unduhan `.sql` (termasuk `database_pengguna.sql` yang berisi kata sandi), `.md`, `.csv`, `.py`, `README.txt`, folder `05_docs`, `scripts`, `tests`, `arsip`; matikan daftar isi folder; header keamanan dasar.
- `.gitignore` (BARU): `config.local.php`, `config/windy.php`, `database_pengguna.sql`, `assets/vendor/` tidak ikut ke GitHub.
- `scripts/siapkan_produksi.py`: pemeriksaan ke-6 (`.htaccess` ada, kata sandi di database_pengguna.sql).
- Kode aplikasi tidak diubah. Uji Node: 4 dari 4 lolos. PHP tidak bisa diuji dari lingkungan ini; uji manual di XAMPP.
