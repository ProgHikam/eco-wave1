<?php
require_once __DIR__ . '/config/db.php';
echo "DB_HOST: " . DB_HOST . "<br>";
echo "DB_PORT: " . DB_PORT . "<br>";
echo "DB_NAME: " . DB_NAME . "<br>";
echo "DB_USER: " . DB_USER . "<br><br>";

try {
    $pdo = koneksi();
    echo "<b>KONEKSI SUKSES!</b><br>";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Daftar tabel: " . implode(', ', $tables);
} catch (Throwable $e) {
    echo "<b>ERROR ASLI MYSQL:</b> " . $e->getMessage();
}