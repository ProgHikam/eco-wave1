// Uji parser impor titik acuan: node tests/test_impor.js
const I = require('../assets/js/impor_data.js'); const assert = require('assert'); let n = 0;
const ok = (nama, fn) => { try { fn(); n++; console.log('  ok  ' + nama); } catch (e) { console.error('GAGAL ' + nama + '\n  ' + e.message); process.exitCode = 1; } };

ok('CSV ringkas CMEMS lengkap', () => {
  const r = I.parse('nama,lat,lng,p,med,p90,maks,cv,hs,te\nP4 Cikeusik,-7.4,105.5,21.5,18.2,9.4,120.5,0.58,1.9,11.2\n', 'x.csv', { sumber: 'CMEMS' });
  assert.equal(r.galat.length, 0); assert.equal(r.baris[0].p, 21.5); assert.equal(r.baris[0].med, 18.2); assert.equal(r.baris[0].sumber, 'CMEMS');
});
ok('CSV Hs+Tp: Te=0,9*Tp dan P turunan', () => {
  const r = I.parse('latitude,longitude,swh,pp1d\n-7.5,105.8,2.0,12.0\n', 'e.csv', { sumber: 'ERA5', mulai: 4 });
  assert.equal(r.baris[0].te, 10.8); assert.equal(r.baris[0].p, +(0.49 * 4 * 10.8).toFixed(2)); assert.equal(r.baris[0].med, null);
  assert.ok(r.baris[0].nama.startsWith('P4 ERA5')); assert.ok(r.peringatan.some(x => /0\.9 × Tp/.test(x)));
});
ok('separator titik koma + desimal koma', () => {
  const r = I.parse('nama;lat;lng;hs;te\nA1;-7,5;105,8;1,9;11,0\n', 'a.csv', {});
  assert.equal(r.baris[0].lat, -7.5); assert.equal(r.baris[0].hs, 1.9);
});
ok('deret waktu -> statistik per lokasi', () => {
  const rows = ['time,latitude,longitude,VHM0,VTM10'];
  [[1, 8], [2, 9], [3, 10], [4, 11], [5, 12]].forEach(([h, t], i) => rows.push(`2020-01-0${i + 1},-7.5,105.8,${h},${t}`));
  const r = I.parse(rows.join('\n'), 'ts.csv', { sumber: 'CMEMS' });
  assert.equal(r.baris.length, 1); const b = r.baris[0]; assert.equal(b.n, 5);
  const ps = [1, 2, 3, 4, 5].map((h, i) => 0.49 * h * h * (8 + i)); const m = ps.reduce((a, c) => a + c) / 5;
  assert.equal(b.p, +m.toFixed(2)); assert.equal(b.maks, +Math.max(...ps).toFixed(2)); assert.equal(b.med, +ps[2].toFixed(2)); assert.ok(b.p90 < b.med); assert.ok(b.cv > 0);
});
ok('JSON array dan {titik:[]}', () => {
  const a = I.parse('[{"nama":"P5 X","lat":-7.3,"lng":106.1,"p":20,"hs":1.8,"te":11}]', 'a.json', {});
  const b = I.parse('{"titik":[{"nama":"P6 Y","lat":-7.3,"lng":106.1,"hs":1.8,"te":11}]}', 'b.json', {});
  assert.equal(a.galat.length, 0); assert.equal(b.baris[0].p, +(0.49 * 1.8 * 1.8 * 11).toFixed(2));
});
ok('GeoJSON Point mengambil koordinat dari geometri', () => {
  const g = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { name: 'Titik G', power_kw: 19.5, hs: 1.7, te: 10.5 }, geometry: { type: 'Point', coordinates: [105.9, -7.4] } }] };
  const r = I.parse(JSON.stringify(g), 'g.geojson', { sumber: 'ERA5' });
  assert.equal(r.galat.length, 0); assert.equal(r.baris[0].lat, -7.4); assert.equal(r.baris[0].lng, 105.9); assert.equal(r.baris[0].p, 19.5);
});
ok('GeoJSON poligon ditolak dengan pesan jelas', () => {
  const g = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[105, -7], [106, -7], [106, -8], [105, -7]]] } }] };
  assert.throws(() => I.parse(JSON.stringify(g), 'p.geojson', {}), /Point/);
});
ok('koordinat di luar area, Hs/Te kosong, nama ganda ditandai', () => {
  const r = I.parse('nama,lat,lng,p,hs,te\nAA,-1,105,20,1.8,11\nBB,-7.4,105.5,20,,\nCC,-7.4,105.6,20,1.8,11\nCC,-7.4,105.7,20,1.8,11\n', 'x.csv', {});
  assert.equal(r.galat.length, 3); assert.ok(r.galat[0].includes('lintang')); assert.ok(r.galat[1].includes('Hs')); assert.ok(r.galat[2].includes('ganda'));
});
ok('NetCDF ditolak dengan petunjuk', () => { assert.throws(() => I.parse('CDF\u0001abc', 'era5.nc', {}), /nc_ke_titik/); });
ok('tanpa kolom koordinat / daya', () => {
  assert.throws(() => I.parse('a,b\n1,2\n', 'x.csv', {}), /koordinat/);
  assert.throws(() => I.parse('lat,lng\n-7,105\n', 'x.csv', {}), /daya|Hs/);
});
ok('BOM + kutip ganda', () => {
  const r = I.parse('\uFEFF"nama","lat","lng","p","hs","te"\n"P7, Barat",-7.4,105.5,20,1.8,11\n', 'x.csv', {});
  assert.equal(r.baris[0].nama, 'P7, Barat'); assert.equal(r.galat.length, 0);
});
console.log(n + ' pengujian lolos');
