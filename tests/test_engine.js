// Uji mesin ECO-WAVE:  node tests/test_engine.js   (dari root proyek)
const fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.join(__dirname,'..'),E=require(path.join(R,'assets/js/ecowave.js'));
const F=async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(R,p)))});
(async()=>{
  await E.muat(Object.keys(E.LAYER_META),'assets/data/pltgl/',F); await E.muatRaster('assets/data/pltgl/',F);
  const a=E.analisisSpasial(-6.8,105.3); assert(a.ex.some(e=>e.layer==='konservasi'),'harus tereksklusi (konservasi)');
  assert.strictEqual(E.mcda(a,22,E.BOBOT_DEFAULT,true).fin,0);
  const b=E.analisisSpasial(-7.03,106.3); assert(b.ex.length===0&&b.jarak.gardu>0);
  // deteksi daratan: titik di darat (Banten pedalaman) true, titik di laut false; Peta/Kalkulator tidak menampilkan nilai untuk daratan
  assert.strictEqual(E.daratan(-6.80,106.2),true,'pedalaman = daratan'); assert.strictEqual(E.daratan(-7.2,106.0),false,'laut lepas bukan daratan');
  // skor daya: mode absolut (ambang lama) dan relatif (celah P1)
  const abs=Object.assign({},E.PARAM_DEFAULT,{dayaMode:'absolut'});
  assert.strictEqual(E.skorDaya(20,abs),5); assert.strictEqual(E.skorDaya(4,abs),1);
  assert.strictEqual(E.skorEko(0.4),1); assert.strictEqual(E.skorEko(6),5);
  assert.strictEqual(E.PARAM_DEFAULT.dayaMode,'relatif');
  const lo=E.PARAM_DEFAULT.dayaRef[0],hi=E.PARAM_DEFAULT.dayaRef[1];
  assert.strictEqual(E.skorDaya(lo),1); assert.strictEqual(E.skorDaya(hi),5); assert(Math.abs(E.skorDaya((lo+hi)/2)-3)<1e-9);
  assert(E.skorDaya(22)!==E.skorDaya(25),'skor Daya kini harus membedakan 22 vs 25 kW/m (celah P1)');
  const musim=Object.assign({},E.PARAM_DEFAULT,{dayaSkala:0.7}); assert(Math.abs(E.skorDaya(hi*0.7,musim)-5)<1e-9);
  const en=E.energi(25.57); assert.strictEqual(en.rumah[450].puncak,170);
  // cakupan habitat (celah K5): Bayah-Sawarna (106,25 BT) di luar cakupan karang/lamun; Ujung Kulon di dalam
  const timur=E.analisisSpasial(-7.03,106.25); assert.strictEqual(timur.luarCakupan,true); assert(timur.peringatan.some(t=>/DI LUAR CAKUPAN/.test(t)));
  assert.strictEqual(E.mcda(timur,22,E.BOBOT_DEFAULT,true).ekoTidakLengkap,true);
  const barat=E.analisisSpasial(-6.75,105.5); assert.strictEqual(barat.luarCakupan,false);
  // BMKG: parser terhadap contoh JSON; baris Hs tidak valid dibuang
  const j=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/bmkg_contoh.json')));
  const bm=E.parseBMKG(j,10); assert.strictEqual(bm.kode,'P.I.06'); assert.strictEqual(bm.seri.length,4);
  const rg=E.ringkasBMKG(bm,10); assert.strictEqual(rg.n,4); assert(Math.abs(rg.hsMaks-2.6)<1e-9);
  assert(Math.abs(bm.seri[0].p-0.49*1.8*1.8*10)<1e-9);
  // zona grid + ekspor GeoJSON/CSV (celah Q6)
  const g=await E.zonaGrid({step:0.02,kwFn:()=>22,mask:true,latMaks:-6.6}); assert(g.length>100);
  const gj=E.zonaKeGeoJSON(g,{uji:1}); assert.strictEqual(gj.features.length,g.length); assert.strictEqual(gj.features[0].geometry.coordinates[0].length,5);
  assert(E.keCSV(['a','b'],[[1,'x"y']]).includes('"x""y"'));
  console.log('OK: semua uji lolos, sel zona =',g.length);
})().catch(e=>{console.error(e);process.exit(1)});
