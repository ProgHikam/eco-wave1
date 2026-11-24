-- ECO-WAVE WebGIS PLTGL - Import via phpMyAdmin
-- PERINGATAN: skrip ini DROP TABLE dan mengisi 5 kandidat dari analisis data nyata (scripts/hitung_kandidat.js).
-- Itu penapisan awal (bobot/ambang = asumsi; karang/lamun belum mencakup Bayah-Sawarna). Backup DB sebelum import.
CREATE DATABASE IF NOT EXISTS ecowave_db CHARACTER SET utf8mb4;
USE ecowave_db;
DROP TABLE IF EXISTS wave_data, site_scores, mca_weights, locations;   -- tabel users TIDAK dihapus agar akun tidak hilang saat import ulang
CREATE TABLE locations(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80), latitude DOUBLE, longitude DOUBLE, region VARCHAR(40));
CREATE TABLE wave_data(id INT AUTO_INCREMENT PRIMARY KEY, location_id INT, month TINYINT, season CHAR(3),
  hs DOUBLE, tp DOUBLE, te DOUBLE, power_kw DOUBLE, FOREIGN KEY(location_id) REFERENCES locations(id));
CREATE TABLE site_scores(id INT AUTO_INCREMENT PRIMARY KEY, location_id INT, daya_score DOUBLE, ekosistem_score DOUBLE,
  kedalaman_score DOUBLE, jarak_infrastruktur_score DOUBLE, is_excluded TINYINT DEFAULT 0, final_score DOUBLE,
  FOREIGN KEY(location_id) REFERENCES locations(id));
CREATE TABLE mca_weights(criteria_name VARCHAR(40) PRIMARY KEY, weight DOUBLE);

INSERT INTO mca_weights VALUES('Daya',0.40),('Ekosistem',0.30),('Kedalaman',0.15),('Jarak Infrastruktur',0.15);
INSERT INTO locations(name,latitude,longitude,region) VALUES
('Cikeusik / Ujung Kulon',-6.6650,105.2650,'Pandeglang'),
('Panimbang',-6.8850,105.6150,'Pandeglang'),
('Binuangeun',-6.8750,105.8250,'Lebak'),
('Bayah',-6.8750,106.0650,'Lebak'),
('Sawarna',-6.9350,106.2150,'Lebak');
-- Skor 1-5 dari data nyata (scripts/hitung_kandidat.js): Daya = IDW CMEMS; Ekosistem/Kedalaman/Jarak dari layer PLTGL. Ekosistem: tinggi = jauh dari ekosistem (dibalik).
INSERT INTO site_scores(location_id,daya_score,ekosistem_score,kedalaman_score,jarak_infrastruktur_score,is_excluded,final_score) VALUES
(1,3.29,4,5,2,0,3.56),(2,2.93,5,5,2,0,3.72),(3,2.58,4,5,2,0,3.28),(4,2.27,5,5,5,0,3.91),(5,2.03,5,5,5,0,3.81);
-- Gelombang bulanan: pola CMEMS 2015-2024 (P0) diskalakan ke daya IDW titik; Tp = Te/0,9 (asumsi); P = 0,49*Hs^2*Te dari CMEMS.
INSERT INTO wave_data(location_id,month,season,hs,tp,te,power_kw) VALUES
(1,1,'DJF',1.77,12.21,10.99,16.96),
(1,2,'DJF',1.71,12.21,10.99,16.02),
(1,3,'MAM',1.68,12.21,10.99,16.68),
(1,4,'MAM',1.85,12.21,10.99,20.89),
(1,5,'MAM',2.11,12.21,10.99,25.56),
(1,6,'JJA',2.29,12.21,10.99,31.11),
(1,7,'JJA',2.47,12.21,10.99,35.8),
(1,8,'JJA',2.42,12.21,10.99,32.78),
(1,9,'SON',2.26,12.21,10.99,28.28),
(1,10,'SON',2.02,12.21,10.99,22.96),
(1,11,'SON',1.77,12.21,10.99,16.59),
(1,12,'DJF',1.75,12.21,10.99,16.55),
(2,1,'DJF',1.75,12.28,11.06,16.63),
(2,2,'DJF',1.69,12.28,11.06,15.71),
(2,3,'MAM',1.66,12.28,11.06,16.36),
(2,4,'MAM',1.83,12.28,11.06,20.49),
(2,5,'MAM',2.08,12.28,11.06,25.07),
(2,6,'JJA',2.27,12.28,11.06,30.51),
(2,7,'JJA',2.44,12.28,11.06,35.12),
(2,8,'JJA',2.39,12.28,11.06,32.16),
(2,9,'SON',2.23,12.28,11.06,27.74),
(2,10,'SON',2,12.28,11.06,22.52),
(2,11,'SON',1.74,12.28,11.06,16.28),
(2,12,'DJF',1.72,12.28,11.06,16.23),
(3,1,'DJF',1.73,12.36,11.12,16.3),
(3,2,'DJF',1.67,12.36,11.12,15.4),
(3,3,'MAM',1.64,12.36,11.12,16.03),
(3,4,'MAM',1.8,12.36,11.12,20.09),
(3,5,'MAM',2.05,12.36,11.12,24.57),
(3,6,'JJA',2.24,12.36,11.12,29.91),
(3,7,'JJA',2.41,12.36,11.12,34.42),
(3,8,'JJA',2.36,12.36,11.12,31.52),
(3,9,'SON',2.2,12.36,11.12,27.19),
(3,10,'SON',1.97,12.36,11.12,22.07),
(3,11,'SON',1.72,12.36,11.12,15.95),
(3,12,'DJF',1.7,12.36,11.12,15.91),
(4,1,'DJF',1.71,12.42,11.18,16.02),
(4,2,'DJF',1.65,12.42,11.18,15.13),
(4,3,'MAM',1.62,12.42,11.18,15.76),
(4,4,'MAM',1.78,12.42,11.18,19.74),
(4,5,'MAM',2.03,12.42,11.18,24.15),
(4,6,'JJA',2.21,12.42,11.18,29.4),
(4,7,'JJA',2.38,12.42,11.18,33.83),
(4,8,'JJA',2.33,12.42,11.18,30.98),
(4,9,'SON',2.17,12.42,11.18,26.72),
(4,10,'SON',1.95,12.42,11.18,21.69),
(4,11,'SON',1.7,12.42,11.18,15.68),
(4,12,'DJF',1.68,12.42,11.18,15.64),
(5,1,'DJF',1.69,12.48,11.23,15.8),
(5,2,'DJF',1.63,12.48,11.23,14.93),
(5,3,'MAM',1.6,12.48,11.23,15.54),
(5,4,'MAM',1.77,12.48,11.23,19.47),
(5,5,'MAM',2.01,12.48,11.23,23.82),
(5,6,'JJA',2.19,12.48,11.23,28.99),
(5,7,'JJA',2.36,12.48,11.23,33.36),
(5,8,'JJA',2.31,12.48,11.23,30.55),
(5,9,'SON',2.15,12.48,11.23,26.36),
(5,10,'SON',1.93,12.48,11.23,21.4),
(5,11,'SON',1.69,12.48,11.23,15.46),
(5,12,'DJF',1.67,12.48,11.23,15.42);

-- ===== Tabel pengguna (login) =====
-- TIDAK ada akun bawaan. Buat admin pertama lewat http://localhost/eco-wave/config/setup_admin.php
-- (kata sandi disimpan dengan password_hash). Skema sama dengan config/auth.php.
CREATE TABLE IF NOT EXISTS users(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(120) NULL UNIQUE, password VARCHAR(255) NOT NULL, role ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
