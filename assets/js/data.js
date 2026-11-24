// ECO-WAVE - data acuan CMEMS, desa, zona ekosistem + fungsi hitung (IDW, estimasi listrik, jarak, eksklusi)
const CMEMS = {
  bulanan:{label:['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],p:[18.54,17.51,18.23,22.84,27.94,34.01,39.14,35.84,30.92,25.10,18.14,18.09],hs:[1.88,1.81,1.78,1.96,2.23,2.43,2.62,2.56,2.39,2.14,1.87,1.85]},
  musiman:{label:['DJF Barat','MAM Peralihan I','JJA Timur','SON Peralihan II'],p:[18.06,23.00,36.35,24.72]},
  tahunan:{label:['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],rata:[23.12,27.37,27.60,26.35,25.93,27.34,25.99,24.42,23.00,24.62],median:[20.37,23.43,24.99,22.32,21.48,23.86,23.47,22.03,19.65,21.06]},
  distribusi:{label:['<5','5-10','10-20','20-40','40-80','>80'],waktu:[0.16,6.65,35.58,44.51,12.25,0.85],energi:[0.03,2.15,21.32,48.66,24.71,3.14]},
  titik:[
    {nama:'P0 Utama',lat:-8.0,lng:104.6,p:25.57,med:22.19,p90:11.12,maks:168.53,cv:0.57,hs:2.13,te:10.76,persen:100},
    {nama:'P1 Ujung Kulon',lat:-7.2,lng:105.2,p:23.90,med:20.83,p90:10.53,maks:132.47,cv:0.57,hs:2.04,te:10.91,persen:93.5},
    {nama:'P2 Binuangeun',lat:-7.3,lng:106.0,p:22.59,med:19.56,p90:10.03,maks:139.98,cv:0.57,hs:1.97,te:11.09,persen:88.3},
    {nama:'P3 Bayah-Sawarna',lat:-7.35,lng:106.3,p:20.48,med:17.70,p90:9.16,maks:130.89,cv:0.58,hs:1.84,te:11.44,persen:80.1},
  ]
};
CMEMS.klimRata = CMEMS.bulanan.p.reduce((a,b)=>a+b,0)/CMEMS.bulanan.p.length; // skala pola bulanan/musiman (klimatologi tetap, bukan titik tertentu)
function labelTitik(t,i){const m=/^\s*(P\d+)/i.exec(t.nama||'');return m?m[1].toUpperCase():'C'+(i+1)}
const DESA = [
  {nama:'Bayah', lat:-6.95, lng:106.24, kec:'Bayah, Lebak', penduduk:8500},
  {nama:'Sawarna', lat:-6.99, lng:106.32, kec:'Bayah, Lebak', penduduk:3200},
  {nama:'Binuangeun', lat:-6.84, lng:105.90, kec:'Wanasalam, Lebak', penduduk:6800},
  {nama:'Panimbang', lat:-6.55, lng:105.78, kec:'Panimbang, Pandeglang', penduduk:12400},
  {nama:'Cibaliung', lat:-6.78, lng:105.70, kec:'Cibaliung, Pandeglang', penduduk:9100},
  {nama:'Cikeusik', lat:-6.73, lng:105.88, kec:'Cikeusik, Pandeglang', penduduk:5400},
  {nama:'Ujung Kulon (Tamanjaya)', lat:-6.78, lng:105.55, kec:'Sumur, Pandeglang', penduduk:4100},
  {nama:'Cilograng', lat:-6.92, lng:106.12, kec:'Cilograng, Lebak', penduduk:7300},
  {nama:'Malingping', lat:-6.78, lng:106.05, kec:'Malingping, Lebak', penduduk:15200},
  {nama:'Labuan', lat:-6.38, lng:105.62, kec:'Labuan, Pandeglang', penduduk:18300},
  {nama:'Caringin', lat:-6.48, lng:105.70, kec:'Caringin, Pandeglang', penduduk:9800},
  {nama:'Pelabuhan Ratu', lat:-6.99, lng:106.55, kec:'Pelabuhan Ratu, Sukabumi', penduduk:22600},
];
function jarakKm(lat1,lng1,lat2,lng2){ const R=6371, dLa=(lat2-lat1)*Math.PI/180, dLo=(lng2-lng1)*Math.PI/180; const a=Math.sin(dLa/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLo/2)**2; return R*2*Math.asin(Math.sqrt(a)); }
function interpolasiCMEMS(lat,lng){
  let sumW=0,sumP=0,sumHs=0,sumTe=0,sumMed=0,sumWMed=0,detail=[];
  CMEMS.titik.forEach(t=>{ let dDeg=Math.sqrt(Math.pow(lat-t.lat,2)+Math.pow(lng-t.lng,2)); if(dDeg<0.001) dDeg=0.001; let dKm=dDeg*111; let w=1/(dDeg*dDeg); sumW+=w; sumP+=w*t.p; sumHs+=w*t.hs; sumTe+=w*t.te; if(t.med!=null){ sumMed+=w*t.med; sumWMed+=w; } detail.push({nama:t.nama,jarak:dKm,bobot:w,p:t.p}); });
  let p=sumP/sumW,hs=sumHs/sumW,te=sumTe/sumW,med=sumWMed?sumMed/sumWMed:null;
  detail.sort((a,b)=>a.jarak-b.jarak); let terdekat=detail[0]; detail.forEach(d=>{ d.persenBobot=(d.bobot/sumW*100).toFixed(1); });
  return {p,hs,te,med,terdekat,detail};
}
// Estimasi bulanan & musiman di sebuah titik: klimatologi CMEMS 2015-2024 (di P0) diskalakan dengan rasio daya rata-rata titik / P0.
// pRata = daya rata-rata tahunan titik (kW/m, mis. hasil IDW); P = parameter perangkat (ECOWAVE.energi). Asumsi: pola musiman sama di seluruh area.
function estimasiCMEMS(pRata,P){
  const E=window.ECOWAVE,r=pRata/CMEMS.klimRata,mk=(nama,p)=>{const e=E.energi(p,P);return{nama,p,pKw:e.pKw,rumah450:e.rumah[450].puncak}};
  return{rasio:r,bulan:CMEMS.bulanan.p.map((p,i)=>mk(CMEMS.bulanan.label[i],p*r)),musim:CMEMS.musiman.p.map((p,i)=>mk(CMEMS.musiman.label[i],p*r)),
    tahunan:{min:Math.min(...CMEMS.tahunan.rata)*r,maks:Math.max(...CMEMS.tahunan.rata)*r}};
}
function hitungEstimasiListrik(p){
  const LEBAR = 10;
  const EFISIENSI = 0.30;
  const CF = 0.15;
  const pListrikKw = p * LEBAR * EFISIENSI;
  const pListrikWatt = pListrikKw * 1000;
  const energiTahunKwh = pListrikKw * 8760 * CF;
  const rumah450 = Math.floor(pListrikWatt / 450);
  const rumah900 = Math.floor(pListrikWatt / 900);
  const rumah1300 = Math.floor(pListrikWatt / 1300);
  const rumah450Tahunan = Math.floor(energiTahunKwh / (113.5*12));
  const rumah900Tahunan = Math.floor(energiTahunKwh / (164.6*12));
  const rumah1300Tahunan = Math.floor(energiTahunKwh / (229.9*12));
  return {pListrikKw, pListrikWatt, energiTahunKwh, rumah450, rumah900, rumah1300, rumah450Tahunan, rumah900Tahunan, rumah1300Tahunan, LEBAR, EFISIENSI, CF};
}
function cariDesaTerdekat(lat,lng){
  let list = DESA.map(d=>({ ...d, jarak: jarakKm(lat,lng,d.lat,d.lng) }));
  list.sort((a,b)=>a.jarak-b.jarak);
  return { terdekat: list[0], kedua: list[1], ketiga: list[2], semua: list };
}
function skorJarakDariDesa(jarakKmDesa){
  if (jarakKmDesa < 2) return 5;
  if (jarakKmDesa < 5) return 4;
  if (jarakKmDesa < 10) return 3;
  if (jarakKmDesa < 20) return 2;
  return 1;
}
// Aturan eksklusi/sensitivitas lama (kotak TN Ujung Kulon, lingkaran mangrove/karang tebakan) DIHAPUS (celah P5).
// Satu sumber: poligon nyata di ecowave.js (ECOWAVE.analisisSpasial).
