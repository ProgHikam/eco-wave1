// Uji konsistensi kandidat:  node tests/test_kandidat.js   (dari root proyek)
// Memastikan 5 kandidat di core.js (FB), database.sql, dan GeoJSON sama dengan hasil scripts/hitung_kandidat.js,
// serta tiap kandidat berada di perairan pesisir (bukan daratan / laut dalam) dan tidak tereksklusi.
const fs = require('fs'), path = require('path'), assert = require('assert');
const R = path.join(__dirname, '..'), { hitung } = require(path.join(R, 'scripts/hitung_kandidat.js')), E = require(path.join(R, 'assets/js/ecowave.js'));
(async () => {
  const { kandidat, ringkasan } = await hitung();
  assert.strictEqual(kandidat.length, 5);
  const core = fs.readFileSync(path.join(R, 'assets/js/core.js'), 'utf8'), sql = fs.readFileSync(path.join(R, 'database.sql'), 'utf8');
  const gj = JSON.parse(fs.readFileSync(path.join(R, 'assets/data/contoh_kandidat.geojson')));
  const rz = JSON.parse(fs.readFileSync(path.join(R, 'assets/data/ringkasan_zona.json')));
  kandidat.forEach((k, i) => {
    const sp = E.analisisSpasial(k.latitude, k.longitude);
    assert(!(sp.kedalaman && sp.kedalaman.daratan), k.name + ' berada di daratan');
    assert.strictEqual(sp.dalamPerairan, true, k.name + ' di luar perairan pesisir 5 km');
    assert.strictEqual(sp.ex.length, 0, k.name + ' tereksklusi');
    assert(core.includes(`{id:${k.id},name:'${k.name}',region:'${k.region}',latitude:${k.latitude},longitude:${k.longitude},kw:${k.kw},s:[${k.s.join(',')}],ex:${k.ex}}`), 'core.js FB tidak sinkron: ' + k.name);
    assert(sql.includes(`(${k.id},${k.s.join(',')},${k.ex},${k.ex ? '0.00' : k.fin.toFixed(2)})`), 'database.sql site_scores tidak sinkron: ' + k.name);
    assert(sql.includes(`(${k.id},1,'DJF',${k.bulan[0].hs},${k.bulan[0].tp},${k.bulan[0].te},${k.bulan[0].p})`), 'database.sql wave_data tidak sinkron: ' + k.name);
    assert.deepStrictEqual(gj.features[i].geometry.coordinates, [k.longitude, k.latitude]);
  });
  assert.strictEqual(rz.sel, ringkasan.sel); assert.strictEqual(rz.tereksklusi, ringkasan.tereksklusi); assert.strictEqual(rz.layak, ringkasan.layak);
  console.log('OK: kandidat konsisten (core.js, database.sql, GeoJSON, ringkasan zona); sel =', rz.sel, '| tereksklusi =', rz.tereksklusi);
})().catch(e => { console.error(e); process.exit(1); });
