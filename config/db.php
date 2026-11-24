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