// Uji logika pengaturan aksesibilitas: node tests/test_aksesibilitas.js
global.window = global;
require('../assets/js/aksesibilitas.js');
const A = global.ECOWAVE_AKS; let gagal = 0;
function cek(ket, ok) { if (!ok) gagal++; console.log(ok ? 'OK   ' : 'GAGAL', ket); }
const n0 = A.normalisasi(null);
cek('bawaan: semua mati, ukuran 100%', n0.ukuran === 0 && n0.kontras === '' && A.daftarKelas(n0).length === 0);
const n1 = A.normalisasi({ ukuran: 99, kontras: 'gelap', font: true, gerak: 1, aneh: 5 });
cek('ukuran dibatasi ke maksimum', n1.ukuran === A.SKALA.length - 1 && A.SKALA[n1.ukuran] === 200);
cek('kelas kontras gelap + font + gerak', JSON.stringify(A.daftarKelas(n1).sort()) === JSON.stringify(['a11y-font', 'a11y-gerak', 'a11y-kg']));
cek('nilai kontras tak dikenal dibuang', A.normalisasi({ kontras: 'merah' }).kontras === '');
cek('JSON rusak/negatif aman', A.normalisasi({ ukuran: -4 }).ukuran === 0 && A.normalisasi('x').ukuran === 0);
cek('kontras terang -> a11y-kt', A.daftarKelas(A.normalisasi({ kontras: 'terang' })).join() === 'a11y-kt');
cek('font lama (true) -> mudah -> a11y-font', A.normalisasi({ font: true }).font === 'mudah');
cek('pilih font lexend -> a11y-font-lexend', A.daftarKelas(A.normalisasi({ font: 'lexend' })).join() === 'a11y-font-lexend');
cek('font tak dikenal dibuang', A.normalisasi({ font: 'comic' }).font === '' && A.daftarKelas(A.normalisasi({ font: 'comic' })).length === 0);
cek('semua pilihan font punya kelas berbeda', new Set(Object.keys(A.FONT).map(function (n) { return A.daftarKelas(A.normalisasi({ font: n }))[0]; })).size === Object.keys(A.FONT).length);
cek('palet ubur -> a11y-pal-ubur', A.daftarKelas(A.normalisasi({ palet: 'ubur' })).join() === 'a11y-pal-ubur');
cek('palet tak dikenal dibuang', A.normalisasi({ palet: 'merah' }).palet === '' && A.normalisasi(null).palet === '');
cek('4 palet baru, tiap palet punya pratinjau', Object.keys(A.PALET).length === 4 && Object.keys(A.PALET).every(function (n) { return A.PALET[n].sw.length >= 4; }));
console.log(gagal ? gagal + ' gagal' : 'OK: semua uji aksesibilitas lolos'); process.exit(gagal ? 1 : 0);
