// Uji pencarian kata kunci: node tests/test_cari.js
const fs = require('fs'), path = require('path');
global.window = global;
require('../assets/js/cari.js');
const C = global.ECOWAVE_CARI;
const idx = C.siapkan(JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/cari_indeks.json'), 'utf8')));
let gagal = 0;
function harap(q, cek, ket) {
  const h = C.cari(idx, q, 5), ok = cek(h);
  if (!ok) gagal++;
  console.log((ok ? 'OK   ' : 'GAGAL'), q.padEnd(22), '->', h.slice(0, 3).map(x => x.e.p + '#' + x.e.a + ' [' + x.e.t.slice(0, 32) + ']').join(' | ') || '(kosong)');
}
harap('mangrove', h => h.length >= 3);
harap('haversine', h => h.some(x => x.e.p === 'teknologi.php' && x.e.a === 'spasial'));
harap('kW/m', h => h.length >= 3);
harap('MANGROVE KARANG', h => h.length >= 1);
harap('daya gelombang', h => h.length && /teknologi|tentang/.test(h[0].e.p));
harap('sawarna', h => h.length && h[0].e.j === 'Lokasi');
harap('bmkg', h => h.some(x => x.e.p === 'peta.php' && x.e.a === 'bmkg'));
harap('uji sensitivitas', h => h.length && h[0].e.a === 'uji');
harap('Ujung Kulón', h => h.length >= 1);      // aksen diabaikan
harap('glosarium', h => h.length && h[0].e.a === 'glosarium');
harap('xyzqwerty', h => h.length === 0);
harap('', h => h.length === 0);
console.log(gagal ? gagal + ' uji gagal' : 'OK: semua uji pencarian lolos', '| entri:', idx.length);
process.exit(gagal ? 1 : 0);
