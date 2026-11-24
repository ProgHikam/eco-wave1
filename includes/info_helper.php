<?php
/* Pembantu kecil untuk halaman informasi (teknologi.php).
   Isi tabel adalah teks statis buatan tim (boleh memuat HTML sederhana seperti <b>, <code>). */
function tabel(array $kepala, array $baris, string $kelas = ''): string {
    $h = '<div class="info-scroll"><table class="info-tbl ' . htmlspecialchars($kelas) . '"><thead><tr>';
    foreach ($kepala as $k) $h .= '<th>' . $k . '</th>';
    $h .= '</tr></thead><tbody>';
    foreach ($baris as $r) { $h .= '<tr>'; foreach ($r as $c) $h .= '<td>' . $c . '</td>'; $h .= '</tr>'; }
    return $h . '</tbody></table></div>';
}
