// Uji kamus bahasa: tanpa browser. node tests/test_bahasa.js
const assert = require('assert');
require('../assets/js/bahasa.js');
const fs = require('fs'), path = require('path');
const L = globalThis.ECOWAVE_LANG;
// muat semua berkas kamus seperti yang dilakukan browser
fs.readdirSync(path.join(__dirname, '../assets/js/kamus')).filter(f => f.endsWith('.js')).forEach(f => require('../assets/js/kamus/' + f));
L.gabung();
assert.ok(L, 'ECOWAVE_LANG ada');
assert.strictEqual(L.get(), 'id');
assert.strictEqual(L.t('Beranda'), 'Beranda', 'Indonesia: teks tidak berubah');
L.set('en');
assert.strictEqual(L.get(), 'en');
assert.strictEqual(L.t('Beranda'), 'Home');
assert.strictEqual(L.t('  Lokasi   Terbaik '), 'Best Locations', 'spasi dirapikan');
assert.strictEqual(L.t('kalimat yang tidak ada di kamus'), 'kalimat yang tidak ada di kamus', 'tak ada di kamus = tetap Indonesia');
L.set('xx');
assert.strictEqual(L.get(), 'id', 'nilai tak dikenal kembali ke Indonesia');
// semua entri kamus terisi dan bukan sekadar salinan kosong
const k = L.daftar(); let kosong = 0;
k.forEach(i => { if (!L.KAMUS[i.replace(/\s+/g, ' ').trim()] ) kosong++; });
assert.strictEqual(kosong, 0, 'tidak ada terjemahan kosong');
// kunci tampilan yang wajib ada
['Beranda','Peta','Kalkulator','Lokasi Terbaik','Informasi','Mode Aksesibilitas','Bahasa','Pertanyaan umum','Daratan'].forEach(x => assert.ok(L.KAMUS[x], 'kamus punya: ' + x));
// kalimat berangka: angka dipasang ulang dengan format English
assert.strictEqual(L.cari('Sel Pesisir Layak (dari 963 sel)'), 'Feasible Coastal Cells (of 963 cells)');
assert.strictEqual(L.cari('Sel Tereksklusi (dari 1.010 sel)'), 'Excluded Cells (of 1,010 cells)');
// pola sederhana
assert.strictEqual(L.cari('BMKG tidak terjangkau: timeout'), 'BMKG unreachable: timeout');
console.log('OK: uji bahasa lolos | entri kamus:', k.length);
