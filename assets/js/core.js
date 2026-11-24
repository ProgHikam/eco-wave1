// ECO-WAVE core - state, helper, API, login. Dipakai SEMUA halaman. Data fallback = kandidat hasil analisis data nyata (scripts/hitung_kandidat.js).
// ECO-WAVE - logika WebGIS. Fallback di bawah dari scripts/hitung_kandidat.js (CMEMS + layer PLTGL); bukan hasil ERA5.
const FB=[
 {id:1,name:'Cikeusik / Ujung Kulon',region:'Pandeglang',latitude:-6.665,longitude:105.265,kw:23.3,s:[3.29,4,5,2],ex:0},
 {id:2,name:'Panimbang',region:'Pandeglang',latitude:-6.885,longitude:105.615,kw:22.9,s:[2.93,5,5,2],ex:0},
 {id:3,name:'Binuangeun',region:'Lebak',latitude:-6.875,longitude:105.825,kw:22.4,s:[2.58,4,5,2],ex:0},
 {id:4,name:'Bayah',region:'Lebak',latitude:-6.875,longitude:106.065,kw:22.1,s:[2.27,5,5,5],ex:0},
 {id:5,name:'Sawarna',region:'Lebak',latitude:-6.935,longitude:106.215,kw:21.8,s:[2.03,5,5,5],ex:0}];
const MF=[.95,.95,.85,.8,.9,1.1,1.2,1.2,1.1,.95,.85,.9];
const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const SEA={thn:['Tahunan',[0,1,2,3,4,5,6,7,8,9,10,11]],djf:['Barat (DJF)',[11,0,1]],mam:['Peralihan (MAM)',[2,3,4]],jja:['Timur (JJA)',[5,6,7]],son:['Peralihan (SON)',[8,9,10]]};
const DEF={daya:.4,eko:.3,ked:.15,jar:.15},KEY=['daya','eko','ked','jar'];
const NAMA={daya:'Daya Gelombang',eko:'Ekosistem (dibalik)',ked:'Kedalaman',jar:'Jarak Infrastruktur'};
const KLS=[[4.2,'Sangat Layak','#16a34a'],[3.4,'Layak','#86efac'],[2.6,'Cukup Layak','#facc15'],[1.8,'Kurang Layak','#fb923c']];
let D=FB,W={...DEF},EX=true,SA='thn',cmp=[],cur=null,c1,c2;
const $=i=>document.getElementById(i),f2=(x,n=2)=>Number(x).toFixed(n);
const kelas=s=>{if(s<=0)return{n:'Gugur',c:'#9ca3af'};for(const[k,n,c]of KLS)if(s>=k)return{n,c};return{n:'Tidak Layak',c:'#ef4444'}};
const sc=(l,w=W)=>w.daya*l.s[0]+w.eko*l.s[1]+w.ked*l.s[2]+w.jar*l.s[3];
const fin=l=>(EX&&l.ex)?0:sc(l);
const rank=()=>[...D].sort((a,b)=>fin(b)-fin(a));
const hav=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
// Faktor musim = satu rumus untuk Peta & Kalkulator: ECOWAVE.faktorMusim (klimatologi CMEMS musiman / rata-rata bulanan).
const sf=(m)=>{const E=window.ECOWAVE;return E&&typeof CMEMS!=='undefined'?E.faktorMusim(m||SA,CMEMS):1};
const monthly=l=>l.monthly||CMEMS.bulanan.p.map(p=>+(l.kw*p/CMEMS.klimRata).toFixed(2));
// Satu pintu hitung untuk titik mana pun (dipakai klik Peta dan Kalkulator): lihat ECOWAVE.hitungTitik.
function hitungModel(lat,lng,opsi){const E=window.ECOWAVE,o=opsi||{};
 return E.hitungTitik({lat,lng,cm:CMEMS,musim:o.musim||SA,gel:o.gel,W:o.W||W,mask:o.mask==null?EX:o.mask,P:o.P||paramEco(),desa:typeof DESA!=='undefined'?DESA:[]})}
const warna=p=>{const t=Math.min(1,p/22),h=t<.5,a=h?[96,165,250]:[250,204,21],b=h?[250,204,21]:[220,38,38],u=h?t*2:(t-.5)*2;return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*u))})`};

if(window.Chart){Chart.defaults.color='#b9cbe6';Chart.defaults.borderColor='#d5b89333';Chart.defaults.font.size=12}

// ===== Status bersama antar halaman & tab (bobot MCA, parameter perangkat, analisis terakhir, Te BMKG) =====
// Satu "papan status" di localStorage + BroadcastChannel: Peta, Kalkulator, Beranda, Hasil, dan Lokasi Terbaik membaca
// nilai yang sama dan beranda ikut berubah saat Peta/Kalkulator di tab lain diubah (realtime). sessionStorage lama tetap ditulis.
const SINKRON=(()=>{
 const K='ecowave_state_v1',subs=[];let ch=null;try{ch=new BroadcastChannel('ecowave')}catch{}
 const baca=()=>{try{return JSON.parse(localStorage.getItem(K)||'{}')||{}}catch{return{}}};
 const tulis=patch=>{const s={...baca(),...patch,t:Date.now()};try{localStorage.setItem(K,JSON.stringify(s))}catch{}try{ch&&ch.postMessage(s)}catch{}return s};
 const onUbah=fn=>{subs.push(fn)};
 addEventListener('storage',e=>{if(e.key===K)subs.forEach(f=>{try{f(baca())}catch{}})});
 if(ch)ch.onmessage=e=>subs.forEach(f=>{try{f(e.data)}catch{}});
 return{baca,tulis,onUbah}})();
let MCA_TERSIMPAN=false;
try{const s=JSON.parse(sessionStorage.getItem('ecowave_mca')||'null')||SINKRON.baca().mca;if(s&&s.W){W=s.W;EX=!!s.EX;MCA_TERSIMPAN=true}
 const m=SINKRON.baca().musim;if(m&&SEA[m])SA=m}catch{}
function simpanMCA(){try{sessionStorage.setItem('ecowave_mca',JSON.stringify({W,EX}))}catch{}SINKRON.tulis({mca:{W,EX},musim:SA})}
// Bobot/eksklusi/musim yang diubah di tab lain ikut masuk ke halaman ini; halaman memasang window.onSinkron untuk menggambar ulang.
SINKRON.onUbah(s=>{if(s.mca&&s.mca.W){W=s.mca.W;EX=!!s.mca.EX}if(s.musim&&SEA[s.musim])SA=s.musim;window.onSinkron&&window.onSinkron(s)});

// ===== Muat data lokasi dari database (fallback ke data demo) =====
// Data acuan (titik CMEMS, desa) dari DB menggantikan isi data.js di tempat; bila DB/tabel belum ada, data.js tetap dipakai.
// Halaman yang menggambar titik/desa memakai onRef(fn): fn dipanggil lagi setelah data DB masuk.
let REF_OK=false,_ref=null;const REF_STATUS={sumber:'data.js',n:0,galat:''};
// Statistik yang kosong (titik hasil impor ringkas) tetap null, tidak dikarang. 'persen' = daya relatif terhadap titik terkuat (konvensi data.js).
function normalTitik(T){const mx=Math.max(...T.map(t=>t.p))||1;T.forEach(t=>{if(t.persen==null)t.persen=+(t.p/mx*100).toFixed(1)})}
// Teks dinamis "P0–P4 (5 titik)": semua elemen [data-ref-rentang] diisi ulang setiap data acuan berubah.
function rentangTitik(){const T=(typeof CMEMS!=='undefined'&&CMEMS.titik)||[];if(!T.length)return'titik acuan';
 const L=T.map((t,i)=>labelTitik(t,i));return(L.length>2?L[0]+'–'+L[L.length-1]:L.join(', '))+' ('+T.length+' titik)'}
function isiRentang(){document.querySelectorAll('[data-ref-rentang]').forEach(e=>{e.textContent=rentangTitik()})}
// Bila database tidak terbaca, titik yang tampil hanya bawaan data.js. Beri tahu lewat pita kecil agar tidak membingungkan.
function pitaRef(){let b=document.getElementById('pitaRef');
 if(REF_STATUS.sumber==='db'||!document.getElementById('refAdmin')){if(b)b.remove();return}   // pesan teknis ini hanya untuk admin (halaman Kelola), bukan pengunjung
 if(!b){b=document.createElement('div');b.id='pitaRef';b.setAttribute('role','status');
  b.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2500;max-width:min(420px,calc(100vw - 24px));padding:8px 12px;border-radius:10px;background:#632024;color:#fff;font-size:12.5px;line-height:1.4;box-shadow:0 4px 14px rgba(0,0,0,.4)';
  b.innerHTML='<b>Titik acuan dari database tidak terbaca.</b> Yang tampil hanya bawaan data.js ('+rentangTitik()+'); titik yang ditambah lewat Kelola belum ikut. <span id="pitaRefWhy"></span> <a href="#" style="color:#fde68a;margin-left:6px" id="pitaRefX">tutup</a>';
  document.body.appendChild(b);b.querySelector('#pitaRefX').onclick=e=>{e.preventDefault();b.remove()}}
 const w=b.querySelector('#pitaRefWhy');if(w)w.textContent=REF_STATUS.galat?'Penyebab: '+REF_STATUS.galat:''}
let _refVer=0,_refT=0;
function muatReferensi(paksa){if(paksa)_ref=null;return _ref||(_ref=(async()=>{try{_refT=Date.now();if(typeof CMEMS==='undefined')return;
 const ambil=async j=>{try{const r=await fetch('api/referensi.php?jenis='+j,{cache:'no-store'});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||('HTTP '+r.status))}return await r.json()}catch(x){return{galat:x.message}}};
 const [t,d]=await Promise.all([ambil('titik'),ambil('desa')]);
 if(Array.isArray(t)&&t.length>=1){normalTitik(t);CMEMS.titik.splice(0,CMEMS.titik.length,...t);REF_STATUS.sumber='db';REF_STATUS.n=t.length}
 else{REF_STATUS.galat=(t&&t.galat)||(Array.isArray(t)?'tabel cmems_titik kosong':'respons tidak dikenal');console.warn('[ECO-WAVE] titik acuan: memakai data.js.',REF_STATUS.galat)}
 if(Array.isArray(d)&&typeof DESA!=='undefined'&&d.length)DESA.splice(0,DESA.length,...d);
 REF_OK=true;isiRentang();pitaRef();dispatchEvent(new Event('ecowave:ref'))}catch(x){console.warn('[ECO-WAVE] muatReferensi',x)}})())}
function onRef(fn){if(REF_OK)fn();addEventListener('ecowave:ref',fn)}
// Admin menambah/mengubah/menghapus titik -> semua tab terbuka memuat ulang data acuan (tanpa reload halaman).
try{_refVer=SINKRON.baca().refVer||0}catch{}
SINKRON.onUbah(s=>{if(s&&s.refVer&&s.refVer!==_refVer){_refVer=s.refVer;muatReferensi(true)}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-_refT>30000)muatReferensi(true)});
addEventListener('DOMContentLoaded',()=>{isiRentang();muatReferensi()});
async function muatData(){await muatReferensi();try{const r=await fetch('api/calculate.php');if(!r.ok)throw 0;const j=await r.json();if(j.locations.length)D=j.locations;
  if(j.weights&&!MCA_TERSIMPAN)W={daya:+j.weights.daya,eko:+j.weights.eko,ked:+j.weights.ked,jar:+j.weights.jar};
 }catch{console.warn('DB belum siap, pakai data DEMO');}}

let ME=null,tunda=null;
async function api(u,b){const r=await fetch(u,b?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}:{});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Gagal terhubung ke server');return j}
// Login memakai modal #loginModal (head.php) dan form POST ke config/auth.php; navbar dirender server.
function uiAuth(){window.onAuth&&onAuth()}
function perlu(fn,pesan){if(ME)return fn();tunda=fn;const m=document.getElementById('loginModal');if(m)m.classList.add('is-open');else alert(pesan||'Fitur ini hanya untuk pengguna yang sudah login.')}
api('api/auth.php?aksi=me').then(j=>{ME=j.user;uiAuth()}).catch(()=>{});

// ===== Prakiraan gelombang BMKG Maritim, cache bersama semua halaman & tab (dipakai navbar, Beranda, Peta) =====
// bmkgLive(kode, umurMaks) -> {kode,nama,terbit,sumber,now:{t,hs,kat,cuaca,angin,arus},hsRata,hsMaks,hsMin,seri:[[t,hs]..],diambil}
// BMKG hanya memberi Hs (tanpa periode): daya (kW/m) dari BMKG selalu memakai Te dari pengguna (lihat Kalkulator).
async function bmkgLive(kode,umur){kode=kode||'P.I.06';umur=umur==null?300000:umur;
 const c=(SINKRON.baca().bmkg||{})[kode];if(c&&Date.now()-c.diambil<umur)return c;
 const r=await fetch('api/bmkg.php?code='+encodeURIComponent(kode)),j=await r.json().catch(()=>({}));
 if(!r.ok||!j.forecast_day1)throw new Error(j.error||'BMKG tidak terjangkau');
 const seri=[].concat(j.forecast_day1||[],j['forecast_day2-4']||[]).map(x=>({t:Date.parse(String(x.time).replace(' UTC','Z').replace(' ','T')),hs:+x.wave_height,kat:x.wave_cat,cuaca:x.weather,angin:+x.wind_speed,arus:+x.current_speed})).filter(x=>isFinite(x.hs)&&isFinite(x.t));
 if(!seri.length)throw new Error('Deret BMKG kosong');
 const now=Date.now();let k=0,b=Infinity;seri.forEach((x,i)=>{const d=Math.abs(x.t-now);if(d<b){b=d;k=i}});
 const hs=seri.map(x=>x.hs),out={kode,nama:j.name,terbit:j.issued,berlakuSampai:j.valid_to,sumber:j.stale?'cache lama':j.cache?'cache':'langsung',now:seri[k],
  hsRata:hs.reduce((a,v)=>a+v,0)/hs.length,hsMaks:Math.max(...hs),hsMin:Math.min(...hs),seri:seri.map(x=>[x.t,x.hs]),diambil:Date.now()};
 SINKRON.tulis({bmkg:{...(SINKRON.baca().bmkg||{}),[kode]:out}});return out}

// ===== Parameter perangkat/skor ECO-WAVE bersama (disimpan oleh Kalkulator, dipakai Peta & Beranda) =====
function paramEco(){const E=window.ECOWAVE;if(!E)return null;const P=JSON.parse(JSON.stringify(E.PARAM_DEFAULT));let s=null;
 try{s=JSON.parse(sessionStorage.getItem('ecowave_param')||'null')||SINKRON.baca().param}catch{}
 // Rentang acuan skor Daya = min-maks titik CMEMS (data DB) selalu dihitung ulang, kecuali pengguna menguncinya (dayaRefManual).
 if(s)Object.assign(P,s,{buf:Object.assign(P.buf,s.buf||{}),skorKedalaman:Object.assign(P.skorKedalaman,s.skorKedalaman||{})});
 if(!(s&&s.dayaRefManual)&&typeof CMEMS!=='undefined'&&CMEMS.titik.length)P.dayaRef=E.rentangDayaAcuan(CMEMS.titik);
 return P}
function simpanParamEco(P){try{sessionStorage.setItem('ecowave_param',JSON.stringify(P))}catch{}SINKRON.tulis({param:P})}
