<?php
// Koneksi PDO MySQL. Pengaturan ada di config/config.php (satu sumber untuk API dan login).
require_once __DIR__ . '/config.php';

function koneksi(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $port = defined('DB_PORT') && DB_PORT ? ';port=' . DB_PORT : (getenv('DB_PORT') ? ';port=' . getenv('DB_PORT') : '');
    $dsn = 'mysql:host=' . DB_HOST . $port . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];
    if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
    }

    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

    autoSetupDatabase($pdo);
    return $pdo;
}

// Otomatis impor file ecowave_db.sql jika database di hosting masih kosong
function autoSetupDatabase(PDO $pdo): void {
    static $checked = false;
    if ($checked) return;
    $checked = true;

    try {
        // Cek apakah tabel utama 'locations' dan 'users' sudah ada
        $stmtLoc = $pdo->query("SHOW TABLES LIKE 'locations'");
        $stmtUsr = $pdo->query("SHOW TABLES LIKE 'users'");
        if ($stmtLoc->rowCount() === 0 || $stmtUsr->rowCount() === 0) {
            // Izinkan pembuatan tabel dari export phpMyAdmin di Aiven
            $pdo->exec("SET SESSION sql_require_primary_key = 0");

            $rootDir = dirname(__DIR__);
            $sqlFile = $rootDir . '/ecowave_db.sql';

            if (file_exists($sqlFile)) {
                $sql = file_get_contents($sqlFile);
                // Hapus komentar SQL (-- ... dan /* ... */) agar eksekusi bersih
                $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
                $sql = preg_replace('/^--.*$/m', '', $sql);
                $queries = array_filter(array_map('trim', explode(';', $sql)));

                foreach ($queries as $query) {
                    if ($query !== '') {
                        $pdo->exec($query);
                    }
                }
            }
        }
    } catch (Throwable $e) {
        // Catat di log server Wasmer jika terjadi error tanpa mematikan web
        error_log('[Eco-Wave AutoSetup DB]: ' . $e->getMessage());
    }
}

// Query dasar lokasi + skor (dipakai semua API)
const SQL_LOKASI = "SELECT l.id,l.name,l.region,l.latitude,l.longitude,s.daya_score,s.ekosistem_score,
 s.kedalaman_score,s.jarak_infrastruktur_score,s.is_excluded,s.final_score,
 (SELECT AVG(power_kw) FROM wave_data w WHERE w.location_id=l.id) AS kw
 FROM locations l JOIN site_scores s ON s.location_id=l.id";

// Ubah baris DB ke format yang dipahami core.js / peta.js
function bentuk(array $r): array {
    return [
        'id' => (int)$r['id'],
        'name' => $r['name'],
        'region' => $r['region'],
        'latitude' => (float)$r['latitude'],
        'longitude' => (float)$r['longitude'],
        'kw' => round((float)$r['kw'], 1),
        's' => [
            (float)$r['daya_score'],
            (float)$r['ekosistem_score'],
            (float)$r['kedalaman_score'],
            (float)$r['jarak_infrastruktur_score']
        ],
        'ex' => (int)$r['is_excluded']
    ];
}