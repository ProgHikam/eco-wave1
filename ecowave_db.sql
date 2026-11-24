-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 24, 2026 at 04:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecowave_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cmems_titik`
--

CREATE TABLE `cmems_titik` (
  `id` int(11) NOT NULL,
  `urutan` smallint(6) NOT NULL DEFAULT 0,
  `nama` varchar(60) NOT NULL,
  `sumber` varchar(30) NOT NULL DEFAULT 'CMEMS',
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `p` double NOT NULL,
  `med` double DEFAULT NULL,
  `p90` double DEFAULT NULL,
  `maks` double DEFAULT NULL,
  `cv` double DEFAULT NULL,
  `hs` double NOT NULL,
  `te` double NOT NULL,
  `persen` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cmems_titik`
--

INSERT INTO `cmems_titik` (`id`, `urutan`, `nama`, `sumber`, `lat`, `lng`, `p`, `med`, `p90`, `maks`, `cv`, `hs`, `te`, `persen`) VALUES
(1, 0, 'P0 Utama', 'CMEMS', -8, 104.6, 25.57, 22.19, 11.12, 168.53, 0.57, 2.13, 10.76, 100),
(2, 1, 'P1 Ujung Kulon', 'CMEMS', -7.2, 105.2, 23.9, 20.83, 10.53, 132.47, 0.57, 2.04, 10.91, 93.5),
(3, 2, 'P2 Binuangeun', 'CMEMS', -7.3, 106, 22.59, 19.56, 10.03, 139.98, 0.57, 1.97, 11.09, 88.3),
(4, 3, 'P3 Bayah-Sawarna', 'CMEMS', -7.35, 106.3, 20.48, 17.7, 9.16, 130.89, 0.58, 1.84, 11.44, 80.1);

-- --------------------------------------------------------

--
-- Table structure for table `desa`
--

CREATE TABLE `desa` (
  `id` int(11) NOT NULL,
  `nama` varchar(80) NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `kec` varchar(80) NOT NULL,
  `penduduk` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `desa`
--

INSERT INTO `desa` (`id`, `nama`, `lat`, `lng`, `kec`, `penduduk`) VALUES
(1, 'Bayah', -6.95, 106.24, 'Bayah, Lebak', 8500),
(2, 'Sawarna', -6.99, 106.32, 'Bayah, Lebak', 3200),
(3, 'Binuangeun', -6.84, 105.9, 'Wanasalam, Lebak', 6800),
(4, 'Panimbang', -6.55, 105.78, 'Panimbang, Pandeglang', 12400),
(5, 'Cibaliung', -6.78, 105.7, 'Cibaliung, Pandeglang', 9100),
(6, 'Cikeusik', -6.73, 105.88, 'Cikeusik, Pandeglang', 5400),
(7, 'Ujung Kulon (Tamanjaya)', -6.78, 105.55, 'Sumur, Pandeglang', 4100),
(8, 'Cilograng', -6.92, 106.12, 'Cilograng, Lebak', 7300),
(9, 'Malingping', -6.78, 106.05, 'Malingping, Lebak', 15200),
(10, 'Labuan', -6.38, 105.62, 'Labuan, Pandeglang', 18300),
(11, 'Caringin', -6.48, 105.7, 'Caringin, Pandeglang', 9800),
(12, 'Pelabuhan Ratu', -6.99, 106.55, 'Pelabuhan Ratu, Sukabumi', 22600);

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(11) NOT NULL,
  `name` varchar(80) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `region` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`, `latitude`, `longitude`, `region`) VALUES
(1, 'Cikeusik / Ujung Kulon', -6.665, 105.265, 'Pandeglang'),
(2, 'Panimbang', -6.885, 105.615, 'Pandeglang'),
(3, 'Binuangeun', -6.875, 105.825, 'Lebak'),
(4, 'Bayah', -6.875, 106.065, 'Lebak'),
(5, 'Sawarna', -6.935, 106.215, 'Lebak');

-- --------------------------------------------------------

--
-- Table structure for table `mca_weights`
--

CREATE TABLE `mca_weights` (
  `criteria_name` varchar(40) NOT NULL,
  `weight` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mca_weights`
--

INSERT INTO `mca_weights` (`criteria_name`, `weight`) VALUES
('Daya', 0.4),
('Ekosistem', 0.3),
('Jarak Infrastruktur', 0.15),
('Kedalaman', 0.15);

-- --------------------------------------------------------

--
-- Table structure for table `site_scores`
--

CREATE TABLE `site_scores` (
  `id` int(11) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `daya_score` double DEFAULT NULL,
  `ekosistem_score` double DEFAULT NULL,
  `kedalaman_score` double DEFAULT NULL,
  `jarak_infrastruktur_score` double DEFAULT NULL,
  `is_excluded` tinyint(4) DEFAULT 0,
  `final_score` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_scores`
--

INSERT INTO `site_scores` (`id`, `location_id`, `daya_score`, `ekosistem_score`, `kedalaman_score`, `jarak_infrastruktur_score`, `is_excluded`, `final_score`) VALUES
(1, 1, 3.29, 4, 5, 2, 0, 3.56),
(2, 2, 2.93, 5, 5, 2, 0, 3.72),
(3, 3, 2.58, 4, 5, 2, 0, 3.28),
(4, 4, 2.27, 5, 5, 5, 0, 3.91),
(5, 5, 2.03, 5, 5, 5, 0, 3.81);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(60) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(3, 'hikam abdul', 'admin2', NULL, '$2y$10$iShXTCg6QoGKRQmm8yEFLOA8SHWohcxXbPmJrS5lHsUget4PFkXIO', 'admin', '2026-11-24 14:40:22'),
(4, 'wanda herlangga', 'wanda', NULL, '$2y$10$M29lDjiG7/JbWk1or4M9M.Kkd2pifDAAVHWlrV36zS0tLyDpZCJSi', 'admin', '2026-11-24 14:42:26'),
(5, 'syahjira zahra', 'jira', NULL, '$2y$10$FH8rIKcO9z3Y7WWI8uTRiucV.dP62V40wIZ96bAiElgcW/ayMQ.Nu', 'user', '2026-11-24 14:43:30'),
(6, 'falisha azzahra', 'falisha', NULL, '$2y$10$7IEkNUGRaAcc0ZTKw6LNT.Jv.wMRxRIoDZx3d.FYxWwvIjOCv6P8m', 'user', '2026-11-24 14:44:00');

-- --------------------------------------------------------

--
-- Table structure for table `wave_data`
--

CREATE TABLE `wave_data` (
  `id` int(11) NOT NULL,
  `location_id` int(11) DEFAULT NULL,
  `month` tinyint(4) DEFAULT NULL,
  `season` char(3) DEFAULT NULL,
  `hs` double DEFAULT NULL,
  `tp` double DEFAULT NULL,
  `te` double DEFAULT NULL,
  `power_kw` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wave_data`
--

INSERT INTO `wave_data` (`id`, `location_id`, `month`, `season`, `hs`, `tp`, `te`, `power_kw`) VALUES
(1, 1, 1, 'DJF', 1.77, 12.21, 10.99, 16.96),
(2, 1, 2, 'DJF', 1.71, 12.21, 10.99, 16.02),
(3, 1, 3, 'MAM', 1.68, 12.21, 10.99, 16.68),
(4, 1, 4, 'MAM', 1.85, 12.21, 10.99, 20.89),
(5, 1, 5, 'MAM', 2.11, 12.21, 10.99, 25.56),
(6, 1, 6, 'JJA', 2.29, 12.21, 10.99, 31.11),
(7, 1, 7, 'JJA', 2.47, 12.21, 10.99, 35.8),
(8, 1, 8, 'JJA', 2.42, 12.21, 10.99, 32.78),
(9, 1, 9, 'SON', 2.26, 12.21, 10.99, 28.28),
(10, 1, 10, 'SON', 2.02, 12.21, 10.99, 22.96),
(11, 1, 11, 'SON', 1.77, 12.21, 10.99, 16.59),
(12, 1, 12, 'DJF', 1.75, 12.21, 10.99, 16.55),
(13, 2, 1, 'DJF', 1.75, 12.28, 11.06, 16.63),
(14, 2, 2, 'DJF', 1.69, 12.28, 11.06, 15.71),
(15, 2, 3, 'MAM', 1.66, 12.28, 11.06, 16.36),
(16, 2, 4, 'MAM', 1.83, 12.28, 11.06, 20.49),
(17, 2, 5, 'MAM', 2.08, 12.28, 11.06, 25.07),
(18, 2, 6, 'JJA', 2.27, 12.28, 11.06, 30.51),
(19, 2, 7, 'JJA', 2.44, 12.28, 11.06, 35.12),
(20, 2, 8, 'JJA', 2.39, 12.28, 11.06, 32.16),
(21, 2, 9, 'SON', 2.23, 12.28, 11.06, 27.74),
(22, 2, 10, 'SON', 2, 12.28, 11.06, 22.52),
(23, 2, 11, 'SON', 1.74, 12.28, 11.06, 16.28),
(24, 2, 12, 'DJF', 1.72, 12.28, 11.06, 16.23),
(25, 3, 1, 'DJF', 1.73, 12.36, 11.12, 16.3),
(26, 3, 2, 'DJF', 1.67, 12.36, 11.12, 15.4),
(27, 3, 3, 'MAM', 1.64, 12.36, 11.12, 16.03),
(28, 3, 4, 'MAM', 1.8, 12.36, 11.12, 20.09),
(29, 3, 5, 'MAM', 2.05, 12.36, 11.12, 24.57),
(30, 3, 6, 'JJA', 2.24, 12.36, 11.12, 29.91),
(31, 3, 7, 'JJA', 2.41, 12.36, 11.12, 34.42),
(32, 3, 8, 'JJA', 2.36, 12.36, 11.12, 31.52),
(33, 3, 9, 'SON', 2.2, 12.36, 11.12, 27.19),
(34, 3, 10, 'SON', 1.97, 12.36, 11.12, 22.07),
(35, 3, 11, 'SON', 1.72, 12.36, 11.12, 15.95),
(36, 3, 12, 'DJF', 1.7, 12.36, 11.12, 15.91),
(37, 4, 1, 'DJF', 1.71, 12.42, 11.18, 16.02),
(38, 4, 2, 'DJF', 1.65, 12.42, 11.18, 15.13),
(39, 4, 3, 'MAM', 1.62, 12.42, 11.18, 15.76),
(40, 4, 4, 'MAM', 1.78, 12.42, 11.18, 19.74),
(41, 4, 5, 'MAM', 2.03, 12.42, 11.18, 24.15),
(42, 4, 6, 'JJA', 2.21, 12.42, 11.18, 29.4),
(43, 4, 7, 'JJA', 2.38, 12.42, 11.18, 33.83),
(44, 4, 8, 'JJA', 2.33, 12.42, 11.18, 30.98),
(45, 4, 9, 'SON', 2.17, 12.42, 11.18, 26.72),
(46, 4, 10, 'SON', 1.95, 12.42, 11.18, 21.69),
(47, 4, 11, 'SON', 1.7, 12.42, 11.18, 15.68),
(48, 4, 12, 'DJF', 1.68, 12.42, 11.18, 15.64),
(49, 5, 1, 'DJF', 1.69, 12.48, 11.23, 15.8),
(50, 5, 2, 'DJF', 1.63, 12.48, 11.23, 14.93),
(51, 5, 3, 'MAM', 1.6, 12.48, 11.23, 15.54),
(52, 5, 4, 'MAM', 1.77, 12.48, 11.23, 19.47),
(53, 5, 5, 'MAM', 2.01, 12.48, 11.23, 23.82),
(54, 5, 6, 'JJA', 2.19, 12.48, 11.23, 28.99),
(55, 5, 7, 'JJA', 2.36, 12.48, 11.23, 33.36),
(56, 5, 8, 'JJA', 2.31, 12.48, 11.23, 30.55),
(57, 5, 9, 'SON', 2.15, 12.48, 11.23, 26.36),
(58, 5, 10, 'SON', 1.93, 12.48, 11.23, 21.4),
(59, 5, 11, 'SON', 1.69, 12.48, 11.23, 15.46),
(60, 5, 12, 'DJF', 1.67, 12.48, 11.23, 15.42);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cmems_titik`
--
ALTER TABLE `cmems_titik`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `desa`
--
ALTER TABLE `desa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mca_weights`
--
ALTER TABLE `mca_weights`
  ADD PRIMARY KEY (`criteria_name`);

--
-- Indexes for table `site_scores`
--
ALTER TABLE `site_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wave_data`
--
ALTER TABLE `wave_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `location_id` (`location_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cmems_titik`
--
ALTER TABLE `cmems_titik`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `desa`
--
ALTER TABLE `desa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `site_scores`
--
ALTER TABLE `site_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `wave_data`
--
ALTER TABLE `wave_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `site_scores`
--
ALTER TABLE `site_scores`
  ADD CONSTRAINT `site_scores_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);

--
-- Constraints for table `wave_data`
--
ALTER TABLE `wave_data`
  ADD CONSTRAINT `wave_data_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
