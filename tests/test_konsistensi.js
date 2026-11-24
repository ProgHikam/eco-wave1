// Uji konsistensi Peta <-> Kalkulator:  node tests/test_konsistensi.js
// Peta (core.js sf + interpolasiCMEMS + mcda) dan Kalkulator (seasonFactor + hitungTitik) harus menghasilkan skor, kelas, dan
// daya yang sama untuk koordinat, musim, bobot dan mode eksklusi yang sama. Juga memeriksa bobot/kelas/legenda satu sumber.
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const R=path.join(__dirname,'..'),E=require(path.join(R,'assets/js/ecowave.js'));
const F=async p=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(R,p)))});
const ctx={window:{ECOWAVE:E},console,Math};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R,'assets/js/data.js'),'utf8')+';this.CMEMS=CMEMS;this.interpolasiCMEMS=interpolasiCMEMS;this.DESA=typeof DESA!=="undefined"?DESA:[];',ctx);
const {CMEMS,interpolasiCMEMS,DESA}=ctx;
const core=fs.readFileSync(path.join(R,'assets/js/core.js'),'utf8');
const sfSrc=/const sf=\(m\)=>\{[^\n]*\};/.exec(core);assert(sfSrc,'sf() tidak ditemukan di core.js');
const wasSA='thn';
let SA=wasSA;const sf=eval('(()=>{const window=ctx.window;'+sfSrc[0].replace('const sf=','return ')+'})()');
const near=(a,b,t=1e-9)=>Math.abs(a-b)<=t;
(async()=>{
  await E.muat(Object.keys(E.LAYER_META),'assets/data/pltgl/',F);await E.muatRaster('assets/data/pltgl/',F);
  // 1) sumber tunggal bobot & kelas
  const sum=E.FAKTOR.reduce((a,f)=>a+f.bobot,0);assert(near(sum,1),'bobot default harus berjumlah 1');
  assert.deepStrictEqual(E.FAKTOR.map(f=>f.bobot),[.4,.3,.15,.15]);
  assert.deepStrictEqual(E.KELAS.map(k=>k[0]),[4.2,3.4,2.6,1.8]);
  const lg=E.KELAS_LEGENDA;assert.strictEqual(lg.length,5);
  // 2) skenario
  const bobot=[{daya:.4,eko:.3,ked:.15,jar:.15},{daya:.7,eko:.1,ked:.1,jar:.1},{daya:.1,eko:.6,ked:.2,jar:.1},{daya:.25,eko:.25,ked:.25,jar:.25}];
  const titik=[[-6.665,105.265],[-6.885,105.615],[-6.935,106.215],[-7.03,106.3],[-6.8,105.3],[-6.9,105.9]];
  const musim=['thn','djf','mam','jja','son'];let n=0;
  for(const [la,ln] of titik)for(const m of musim)for(const W of bobot)for(const mask of [true,false]){
    SA=m;
    // jalur Peta
    const inter=interpolasiCMEMS(la,ln),f=sf(m),kw=inter.p*f;
    const P1=Object.assign({},E.PARAM_DEFAULT,{dayaRef:E.rentangDayaAcuan(CMEMS.titik),dayaSkala:f});
    const sp=E.analisisSpasial(la,ln,{P:P1,desa:DESA}),mP=E.mcda(sp,kw,W,mask,P1);
    // jalur Kalkulator / model bersama
    const h=E.hitungTitik({lat:la,lng:ln,cm:CMEMS,musim:m,W,mask,P:Object.assign({},E.PARAM_DEFAULT,{dayaRef:E.rentangDayaAcuan(CMEMS.titik)}),desa:DESA});
    assert(near(h.gel.kw,kw,1e-9),`daya beda ${la},${ln},${m}: ${h.gel.kw} vs ${kw}`);
    assert(near(h.m.fin,mP.fin,1e-9),`skor beda ${la},${ln},${m}`);
    assert.strictEqual(h.m.kelas.n,mP.kelas.n,'kelas beda');
    n++;
  }
  // 3) bobot diubah -> skor akhir berubah sesuai kombinasi linear (kedua halaman memakai mcda yang sama)
  const h0=E.hitungTitik({lat:-6.9,lng:105.9,cm:CMEMS,musim:'thn',W:bobot[0],mask:false,P:E.PARAM_DEFAULT,desa:DESA});
  const h1=E.hitungTitik({lat:-6.9,lng:105.9,cm:CMEMS,musim:'thn',W:bobot[1],mask:false,P:E.PARAM_DEFAULT,desa:DESA});
  const lin=(s,w)=>s[0]*w.daya+s[1]*w.eko+s[2]*w.ked+s[3]*w.jar;
  assert(near(h0.m.fin,lin(h0.m.s,bobot[0]),1e-9));assert(near(h1.m.fin,lin(h1.m.s,bobot[1]),1e-9));
  // 4) faktor musim: sama dengan klimatologi CMEMS
  ['djf','mam','jja','son'].forEach((m,i)=>assert(near(sf(m),CMEMS.musiman.p[i]/CMEMS.klimRata)));
  assert.strictEqual(sf('thn'),1);
  console.log('OK: '+n+' skenario Peta = Kalkulator; bobot, kelas, musim konsisten');
})().catch(e=>{console.error('GAGAL:',e.message);process.exit(1)});
