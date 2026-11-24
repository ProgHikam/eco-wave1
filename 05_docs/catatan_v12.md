# Catatan v12 (16 Nov 2026)

- **Login**: tambah `config/reset_admin.php` (hanya localhost), pesan login yang membedakan database mati / salah sandi / terkunci, tabel `users` dibuat otomatis, kegagalan database tidak dihitung sebagai percobaan gagal.
- **Celah dihapus**: `celah.php`, menu navbar, kartu dan tautan di Tentang Web / Tentang Data / Teknologi, gaya `.celah` di `halaman-info.css`, entri indeks pencarian.
- **Teknologi & Metode diperbarui**: disamakan dengan `ecowave.js`, `data.js`, `api/*`, dan manifest data PLTGL terbaru. Bagian baru: Login & keamanan, Fitur penunjang.
- Indeks pencarian dibangun ulang; `tests/test_engine.js`, `test_cari.js`, `test_aksesibilitas.js` lolos.
- **Login**: pilihan "Masuk sebagai" (Pengguna/Admin) di modal login; peran dicek di server (`config/auth.php`).
