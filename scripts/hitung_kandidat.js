// ECO-WAVE - tentukan 5 kandidat lokasi dari DATA NYATA memakai mesin yang sama dengan Kalkulator ("Zona ECO-WAVE").
//
//   node scripts/hitung_kandidat.js           cetak tabel hasil (tidak menulis apa pun)
//   node scripts/hitung_kandidat.js --tulis   perbarui database.sql, core.js (FB), contoh_kandidat.geojson, ringkasan_zona.json
//
// ATURAN PEMILIHAN (tertulis agar bisa dipertanggungjawabkan):
//  1. Pesisir dibagi 5 ruas menurut bujur: Cikeusik/Ujung Kulon, Panimbang, Binuangeun, Bayah, Sawarna.
//  2. Tiap ruas dinilai dengan grid +-1 km di perairan pesisir 5 km (bobot, parameter, dan eksklusi bawaan; CMEMS tahunan).
//  3. Kandidat = sel dengan skor akhir tertinggi yang TIDAK tereksklusi. Sel yang berada di dalam cakupan data karang/lamun
//     didahulukan (skor Ekosistem-nya terverifikasi); bila ruas itu tidak punya cakupan, dipakai sel terbaik dan ditandai "eko belum terverifikasi".
//  4. Daya = IDW CMEMS di titik itu; gelombang bulanan = pola CMEMS (P0) diskalakan ke daya titik.
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..'), E = require(path.join(R, 'assets/js/ecowave.js'));
const RUAS = [['Cikeusik / Ujung Kulon', 'Pandeglang', 105.2, 105.6], ['Panimbang', 'Pandeglang', 105.6, 105.82], ['Binuangeun', 'Lebak', 105.82, 106.0], ['Bayah', 'Lebak', 106.0, 106.2], ['Sawarna', 'Lebak', 106.2, 106.41]];
const MUSIM = ['DJF', 'DJF', 'MAM', 'MAM', 'MAM', 'JJA', 'JJA', 'JJA', 'SON', 'SON', 'SON', 'DJF'];
const r = (x, d = 2) => +x.toFixed(d), F = async p => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(R, p))) });

async function hitung() {
  const ctx = { Math, window: { ECOWAVE: E } }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(R, 'assets/js/data.js'), 'utf8') + '\n;this.CMEMS=CMEMS;this.DESA=DESA;this.interpolasiCMEMS=interpolasiCMEMS;', ctx);
  const { CMEMS, DESA, interpolasiCMEMS } = ctx;
  await E.muat(Object.keys(E.LAYER_META), 'assets/data/pltgl/', F); await E.muatRaster('assets/data/pltgl/', F);
  const P = JSON.parse(JSON.stringify(E.PARAM_DEFAULT)), W = E.BOBOT_DEFAULT;
  const sel = await E.zonaGrid({ step: 0.01, P, W, mask: true, desa: DESA, latMaks: P.zonaLatMaks, kwFn: (a, b) => interpolasiCMEMS(a, b).p });
  const urut = l => l.slice().sort((a, b) => r(b.fin, 3) - r(a.fin, 3) || b.kw - a.kw || a.lat - b.lat || a.lng - b.lng)[0];
  const kandidat = RUAS.map(([name, region, w, e], i) => {
    const ok = sel.filter(c => c.lng >= w && c.lng < e && !c.ex), ter = ok.filter(c => !c.luarCakupan);
    const c = urut(ter.length ? ter : ok), lat = r(c.lat, 3), lng = r(c.lng, 3);
    const it = interpolasiCMEMS(lat, lng), sp = E.analisisSpasial(lat, lng, { P, desa: DESA }), m = E.mcda(sp, it.p, W, true, P);
    const bulan = CMEMS.bulanan.p.map((v, k) => ({ bulan: k + 1, musim: MUSIM[k], hs: r(CMEMS.bulanan.hs[k] * it.hs / CMEMS.titik[0].hs), te: r(it.te), tp: r(it.te / 0.9), p: r(v * it.p / CMEMS.titik[0].p) }));
    return { id: i + 1, name, region, latitude: lat, longitude: lng, kw: r(bulan.reduce((a, b) => a + b.p, 0) / 12, 1), hs: r(it.hs), te: r(it.te), s: m.s.map(v => r(v)), ex: m.ex ? 1 : 0, fin: r(m.fin),
      kelas: m.kelas.n, luarCakupan: !!sp.luarCakupan, kedalaman: sp.kedalaman && sp.kedalaman.rentang, bulan };
  });
  const aktif = sel.filter(c => !c.ex), kl = {}; aktif.forEach(c => kl[c.kelas.n] = (kl[c.kelas.n] || 0) + 1);
  const ringkasan = { dibuat: new Date().toISOString().slice(0, 10), step_derajat: 0.01, sel: sel.length, tereksklusi: sel.length - aktif.length, layak: aktif.filter(c => c.fin >= 3.4).length,
    kelas: kl, bobot: W, catatan: 'Grid +-1 km di perairan pesisir 5 km, CMEMS tahunan, bobot & parameter bawaan, eksklusi ON. Dihitung offline oleh scripts/hitung_kandidat.js.' };
  return { kandidat, ringkasan };
}

function tulis({ kandidat, ringkasan }) {
  const rw = (f, fn) => { const p = path.join(R, f); fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8'))); };
  const q = s => "'" + s.replace(/'/g, "''") + "'";
  rw('database.sql', t => {
    const blok = 'INSERT INTO locations(name,latitude,longitude,region) VALUES\n' + kandidat.map(k => `(${q(k.name)},${k.latitude.toFixed(4)},${k.longitude.toFixed(4)},${q(k.region)})`).join(',\n') + ';\n' +
      '-- Skor 1-5 dari data nyata (scripts/hitung_kandidat.js): Daya = IDW CMEMS; Ekosistem/Kedalaman/Jarak dari layer PLTGL. Ekosistem: tinggi = jauh dari ekosistem (dibalik).\n' +
      'INSERT INTO site_scores(location_id,daya_score,ekosistem_score,kedalaman_score,jarak_infrastruktur_score,is_excluded,final_score) VALUES\n' + kandidat.map(k => `(${k.id},${k.s.join(',')},${k.ex},${k.ex ? '0.00' : k.fin.toFixed(2)})`).join(',') + ';\n' +
      '-- Gelombang bulanan: pola CMEMS 2015-2024 (P0) diskalakan ke daya IDW titik; Tp = Te/0,9 (asumsi); P = 0,49*Hs^2*Te dari CMEMS.\n' +
      'INSERT INTO wave_data(location_id,month,season,hs,tp,te,power_kw) VALUES\n' + kandidat.flatMap(k => k.bulan.map(b => `(${k.id},${b.bulan},'${b.musim}',${b.hs},${b.tp},${b.te},${b.p})`)).join(',\n') + ';\n';
    t = t.replace(/INSERT INTO locations[\s\S]*?(?=\n-- ===== Tabel pengguna)/, blok);
    return t.replace(/-- PERINGATAN: skrip ini DROP TABLE[^\n]*\n-- Jangan gunakan data seed[^\n]*/, '-- PERINGATAN: skrip ini DROP TABLE dan mengisi 5 kandidat dari analisis data nyata (scripts/hitung_kandidat.js).\n-- Itu penapisan awal (bobot/ambang = asumsi; karang/lamun belum mencakup Bayah-Sawarna). Backup DB sebelum import.');
  });
  rw('assets/js/core.js', t => t.replace(/const FB=\[[\s\S]*?\];/, 'const FB=[\n' + kandidat.map(k => ` {id:${k.id},name:'${k.name}',region:'${k.region}',latitude:${k.latitude},longitude:${k.longitude},kw:${k.kw},s:[${k.s.join(',')}],ex:${k.ex}}`).join(',\n') + '];')
    .replace('Data fallback HANYA DEMO.', 'Data fallback = kandidat hasil analisis data nyata (scripts/hitung_kandidat.js).').replace('Data fallback di bawah HANYA DEMO; bukan hasil ERA5/ArcGIS.', 'Fallback di bawah dari scripts/hitung_kandidat.js (CMEMS + layer PLTGL); bukan hasil ERA5.'));
  fs.writeFileSync(path.join(R, 'assets/data/contoh_kandidat.geojson'), JSON.stringify({ type: 'FeatureCollection', features: kandidat.map(k => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [k.longitude, k.latitude] },
    properties: { name: k.name, region: k.region, daya_kw_m: k.kw, final: k.ex ? 0 : k.fin, kelas: k.kelas, eko_terverifikasi: !k.luarCakupan, catatan: 'Hasil scripts/hitung_kandidat.js, EPSG:4326' } })) }, null, 1) + '\n');
  fs.writeFileSync(path.join(R, 'assets/data/ringkasan_zona.json'), JSON.stringify(ringkasan, null, 1) + '\n');
}

module.exports = { hitung, tulis };
if (require.main === module) (async () => {
  const h = await hitung();
  console.log('Kandidat'.padEnd(24), 'lat,lng'.padEnd(18), 'kW/m  D/E/K/J'.padEnd(26), 'akhir  kelas / catatan');
  h.kandidat.forEach(k => console.log(k.name.padEnd(24), (k.latitude + ',' + k.longitude).padEnd(18), (String(k.kw).padStart(5) + '  ' + k.s.join('/')).padEnd(26), k.fin.toFixed(2), k.kelas, k.luarCakupan ? '| eko BELUM terverifikasi (luar cakupan karang/lamun)' : '| eko terverifikasi', '|', k.kedalaman));
  const z = h.ringkasan; console.log(`\nGrid: ${z.sel} sel, ${z.tereksklusi} tereksklusi, ${z.layak} sel Layak/Sangat Layak`, JSON.stringify(z.kelas));
  if (process.argv.includes('--tulis')) { tulis(h); console.log('\nDitulis: database.sql, assets/js/core.js, assets/data/contoh_kandidat.geojson, assets/data/ringkasan_zona.json'); }
  else console.log('\n(tambahkan --tulis untuk menulis berkas)');
})().catch(e => { console.error(e); process.exit(1); });
