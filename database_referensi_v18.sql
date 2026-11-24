-- ECO-WAVE v18 - titik acuan gelombang dari banyak sumber (CMEMS, ERA5, dst.)
-- Jalankan SEKALI di phpMyAdmin (database ecowave_db) SETELAH database_referensi.sql.
-- (Jika dijalankan dua kali, MySQL akan menolak karena kolom 'sumber' sudah ada: itu tidak berbahaya.)
USE ecowave_db;
ALTER TABLE cmems_titik
  ADD COLUMN sumber VARCHAR(30) NOT NULL DEFAULT 'CMEMS' AFTER nama,
  MODIFY urutan SMALLINT NOT NULL DEFAULT 0,
  MODIFY med DOUBLE NULL, MODIFY p90 DOUBLE NULL, MODIFY maks DOUBLE NULL, MODIFY cv DOUBLE NULL, MODIFY persen DOUBLE NULL;
