// ECO-WAVE - formulir tambah/ubah/hapus lokasi (modal). Dipakai di peta.php dan admin.php
  window.tambahManual=function(){ document.getElementById('fId').value=''; document.getElementById('fName').value=''; document.getElementById('fReg').value=''; document.getElementById('fLat').value=''; document.getElementById('fLng').value=''; document.getElementById('fHs').value=''; document.getElementById('fTp').value=''; document.getElementById('fKw').value=''; document.getElementById('fS0').value=''; document.getElementById('fS1').value=''; document.getElementById('fS2').value='4'; document.getElementById('fS3').value='3'; document.getElementById('fEx').checked=false; document.getElementById('fWin').textContent=''; document.getElementById('fErr').textContent=''; const c=document.getElementById('fCek'); c.classList.add('hidden'); c.textContent=''; document.getElementById('fMode').textContent='(Manual - CMEMS / ERA5 / jurnal)'; document.getElementById('modalForm').classList.remove('hidden'); document.getElementById('fName').focus(); };
  window.tambahManualContoh=function(){ tambahManual(); document.getElementById('fName').value='Bayah (Contoh Manual)'; document.getElementById('fReg').value='Lebak'; document.getElementById('fLat').value=-7.05; document.getElementById('fLng').value=106.10; document.getElementById('fHs').value=1.8; document.getElementById('fTp').value=9; document.getElementById('fMode').textContent='(Contoh)'; hitungDariHsTp(); };
  window.tambahDariCMEMS=function(){ const e=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])), n=(x,d)=>Number(x).toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d});
    document.getElementById('cmemsList').innerHTML=CMEMS.titik.map((t,i)=>{ const es=hitungEstimasiListrik(t.p); return '<button class="btn2 !py-2 text-left" onclick="pilihCMEMS('+i+')"><b>'+e(t.nama)+'</b> - '+n(t.p,2)+' kW/m - Hs '+n(t.hs,2)+' m, Te '+n(t.te,2)+' s - '+es.rumah450+' / '+es.rumah900+' / '+es.rumah1300+' rumah</button>'; }).join('')||'Belum ada titik CMEMS.';
    document.getElementById('modalCMEMS').classList.remove('hidden'); };
  window.pilihCMEMS=function(idx){ const t=CMEMS.titik[idx]; document.getElementById('modalCMEMS').classList.add('hidden'); tambahManual(); document.getElementById('fName').value=t.nama+' (CMEMS)'; document.getElementById('fReg').value=t.lng<105.85?'Pandeglang':'Lebak'; document.getElementById('fLat').value=t.lat; document.getElementById('fLng').value=t.lng; document.getElementById('fHs').value=t.hs; document.getElementById('fTp').value=t.te; document.getElementById('fKw').value=t.p; document.getElementById('fMode').textContent='(Dari CMEMS - '+t.nama+')'; const est=hitungEstimasiListrik(t.p); document.getElementById('fWin').textContent=`Dari CMEMS: P ${t.p} kW/m → ${est.pListrikKw.toFixed(1)} kW → ${est.rumah450} rumah (450 VA) / ${est.rumah900} rumah (900 VA) / ${est.rumah1300} rumah (1300 VA)`; hitungDariHsTp(); };
  // Skor Eko/Kedalaman/Jarak + eksklusi dari data PLTGL nyata (ecowave.js) - satu sumber aturan (celah P5)
  async function skorNyata(lat,lng,kw){ const E=window.ECOWAVE; if(!E) throw new Error('Mesin ECO-WAVE tidak termuat'); const A=Object.keys(E.LAYER_META);
    await Promise.all([E.muat(A,'assets/data/pltgl/'),E.muatRaster('assets/data/pltgl/')]); const P=paramEco(); const sp=E.analisisSpasial(lat,lng,{P,desa:DESA}); return {sp,m:E.mcda(sp,kw,W,EX,P),P}; }
  const gv=id=>document.getElementById(id);
  window.hitungDariHsTp=async function(){ const hs=parseFloat(gv('fHs').value), tp=parseFloat(gv('fTp').value), kwI=gv('fKw'); let kw=parseFloat(kwI.value);
    if(!isNaN(hs)&&!isNaN(tp)&&hs>=0&&tp>0){ const k=0.49*hs*hs*tp; if(!kwI.value){ kwI.value=k.toFixed(2); } kw=parseFloat(kwI.value); }
    else if(isNaN(kw)){ alert('Isi Hs + Te dulu, atau isi Daya langsung.'); return; }
    const est=hitungEstimasiListrik(kw); gv('fWin').textContent=`P = ${kw.toFixed(2)} kW/m → ${est.pListrikKw.toFixed(1)} kW → ${est.rumah450} rumah (450 VA) / ${est.rumah900} (900 VA) / ${est.rumah1300} (1300 VA)`;
    const lat=parseFloat(gv('fLat').value), lng=parseFloat(gv('fLng').value);
    try{ const {m}=await skorNyata(isNaN(lat)?-7.1:lat,isNaN(lng)?105.9:lng,kw); gv('fS0').value=+m.s[0].toFixed(2); if(!isNaN(lat)&&!isNaN(lng)){ gv('fS1').value=+m.s[1].toFixed(2); gv('fS2').value=m.s[2]; gv('fS3').value=+m.s[3].toFixed(2); gv('fEx').checked=m.ex; } }catch(e){ gv('fErr').textContent='Skor otomatis gagal: '+e.message; } };
  window.cekEksklusiManual=async function(){ const lat=parseFloat(gv('fLat').value), lng=parseFloat(gv('fLng').value), box=gv('fCek');
    if(isNaN(lat)||isNaN(lng)){ alert('Isi latitude dan longitude terlebih dahulu.'); return; }
    const kw=parseFloat(gv('fKw').value)||interpolasiCMEMS(lat,lng).p; box.classList.remove('hidden'); box.textContent='Menghitung dari data PLTGL nyata…';
    try{ const {sp,m}=await skorNyata(lat,lng,kw); gv('fS0').value=+m.s[0].toFixed(2); gv('fS1').value=+m.s[1].toFixed(2); gv('fS2').value=m.s[2]; gv('fS3').value=+m.s[3].toFixed(2); gv('fEx').checked=m.ex;
      const w=sp.peringatan.length?'<br><i>'+sp.peringatan.join('<br>')+'</i>':'';
      if(m.ex){ box.style.background='#fee2e2'; box.style.color='#991b1b'; box.innerHTML=`<b>EKSKLUSI</b> - ${sp.ex.map(x=>x.teks).join('; ')}<br>Skor akhir = 0${w}`; }
      else { box.style.background='#dcfce7'; box.style.color='#166534'; box.innerHTML=`<b>Lolos eksklusi</b> · skor ${m.fin.toFixed(2)}/5 (${m.kelas.n})<br>Eko terdekat: ${sp.ekoNama?sp.dEko.toFixed(2)+' km':'-'}${w}`; } }
    catch(e){ box.textContent='Gagal: '+e.message; } };
function formLok(id){const l=id?D.find(x=>x.id==id):{name:'',region:'',latitude:'',longitude:'',kw:'',s:['','','',''],ex:0};
 $('fId').value=id||'';$('fName').value=l.name;$('fReg').value=l.region;$('fLat').value=l.latitude;$('fLng').value=l.longitude;$('fKw').value=l.kw;
 l.s.forEach((v,i)=>$('fS'+i).value=v);$('fEx').checked=!!l.ex;$('fErr').textContent='';$('modalForm').classList.remove('hidden')}
async function simpan(){const b={aksi:$('fId').value?'update':'create',id:$('fId').value,name:$('fName').value,region:$('fReg').value,
 latitude:$('fLat').value,longitude:$('fLng').value,kw:$('fKw').value,s:[0,1,2,3].map(i=>$('fS'+i).value),ex:$('fEx').checked,alasan:($('fCek')?$('fCek').textContent:'').slice(0,0)};
 try{await api('api/locations.php',b);$('modalForm').classList.add('hidden');await setelahSimpan()}catch(e){$('fErr').textContent=e.message}}
async function hapusLok(id){if(!confirm('Hapus lokasi ini beserta data gelombang & skornya?'))return;
 try{await api('api/locations.php',{aksi:'delete',id});await setelahSimpan()}catch(e){alert(e.message)}}
async function setelahSimpan(){await muatData();window.onDataBerubah&&onDataBerubah()}
