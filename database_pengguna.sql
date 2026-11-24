-- ECO-WAVE - pengguna MySQL khusus aplikasi (BUKAN root). Jalankan SEKALI sebagai root (phpMyAdmin > SQL) SETELAH database.sql di-import.
-- 1) Ganti GANTI_DENGAN_KATA_SANDI_KUAT di bawah dengan kata sandi panjang dan acak.
-- 2) Salin config/config.local.example.php menjadi config/config.local.php dan isi 'user' => 'ecowave_app' serta kata sandi yang sama.
-- Hak yang diberikan hanya SELECT/INSERT/UPDATE/DELETE pada ecowave_db (cukup untuk seluruh API dan login).
-- Catatan: tabel users sudah dibuat database.sql. Bila suatu hari perlu migrasi kolom (config/auth.php), jalankan sebagai root, bukan lewat pengguna ini.
CREATE USER IF NOT EXISTS 'ecowave_app'@'localhost' IDENTIFIED BY 'GANTI_DENGAN_KATA_SANDI_KUAT';
GRANT SELECT, INSERT, UPDATE, DELETE ON ecowave_db.* TO 'ecowave_app'@'localhost';
FLUSH PRIVILEGES;
