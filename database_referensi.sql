-- ECO-WAVE - tabel data acuan yang bisa dikelola admin (CRUD) lewat admin.php
-- Jalankan SEKALI sebagai root (phpMyAdmin > SQL) setelah database.sql. Aman diulang (IF NOT EXISTS / INSERT IGNORE).
USE ecowave_db;
CREATE TABLE IF NOT EXISTS cmems_titik(
  id INT AUTO_INCREMENT PRIMARY KEY, urutan TINYINT NOT NULL DEFAULT 0,
  nama VARCHAR(60) NOT NULL UNIQUE, lat DOUBLE NOT NULL, lng DOUBLE NOT NULL,
  p DOUBLE NOT NULL, med DOUBLE NOT NULL, p90 DOUBLE NOT NULL, maks DOUBLE NOT NULL,
  cv DOUBLE NOT NULL, hs DOUBLE NOT NULL, te DOUBLE NOT NULL, persen DOUBLE NOT NULL);
CREATE TABLE IF NOT EXISTS desa(
  id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(80) NOT NULL UNIQUE, lat DOUBLE NOT NULL, lng DOUBLE NOT NULL,
  kec VARCHAR(80) NOT NULL, penduduk INT NOT NULL DEFAULT 0);
INSERT IGNORE INTO cmems_titik(urutan,nama,lat,lng,p,med,p90,maks,cv,hs,te,persen) VALUES
(0,'P0 Utama',-8.0,104.6,25.57,22.19,11.12,168.53,0.57,2.13,10.76,100),
(1,'P1 Ujung Kulon',-7.2,105.2,23.90,20.83,10.53,132.47,0.57,2.04,10.91,93.5),
(2,'P2 Binuangeun',-7.3,106.0,22.59,19.56,10.03,139.98,0.57,1.97,11.09,88.3),
(3,'P3 Bayah-Sawarna',-7.35,106.3,20.48,17.70,9.16,130.89,0.58,1.84,11.44,80.1);
INSERT IGNORE INTO desa(nama,lat,lng,kec,penduduk) VALUES
('Bayah',-6.95,106.24,'Bayah, Lebak',8500),('Sawarna',-6.99,106.32,'Bayah, Lebak',3200),
('Binuangeun',-6.84,105.90,'Wanasalam, Lebak',6800),('Panimbang',-6.55,105.78,'Panimbang, Pandeglang',12400),
('Cibaliung',-6.78,105.70,'Cibaliung, Pandeglang',9100),('Cikeusik',-6.73,105.88,'Cikeusik, Pandeglang',5400),
('Ujung Kulon (Tamanjaya)',-6.78,105.55,'Sumur, Pandeglang',4100),('Cilograng',-6.92,106.12,'Cilograng, Lebak',7300),
('Malingping',-6.78,106.05,'Malingping, Lebak',15200),('Labuan',-6.38,105.62,'Labuan, Pandeglang',18300),
('Caringin',-6.48,105.70,'Caringin, Pandeglang',9800),('Pelabuhan Ratu',-6.99,106.55,'Pelabuhan Ratu, Sukabumi',22600);
GRANT SELECT, INSERT, UPDATE, DELETE ON ecowave_db.cmems_titik TO 'ecowave_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON ecowave_db.desa TO 'ecowave_app'@'localhost';
