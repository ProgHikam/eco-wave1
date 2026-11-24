// ECO-WAVE - halaman Kelola Lokasi (admin)
function tabelAdmin(){$('aTbl').innerHTML=D.map(l=>`<tr class="border-t"><td>${l.name}</td><td>${l.region}</td><td>${f2(l.kw,1)}</td><td>${l.s.join(' / ')}</td><td>${l.ex?'Ya':'-'}</td>
 <td class="whitespace-nowrap"><button class="chip" onclick="formLok(${l.id})">Edit</button> <button class="chip" onclick="hapusLok(${l.id})">Hapus</button></td></tr>`).join('')}
(async()=>{if(!$('aTbl'))return;window.onDataBerubah=tabelAdmin;await muatData();tabelAdmin()})();

// ===== CRUD data acuan: titik CMEMS, desa, bobot MCA (api/referensi.php) =====
(()=>{
 const root=document.getElementById('refAdmin');if(!root)return;
 const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const msg=(t,ok)=>{const m=document.getElementById('refMsg');m.textContent=t;m.style.color=ok?'#16a34a':'#dc2626'};
 let csrf='',data={titik:[],desa:[],bobot:[]};
 async function kirim(b){const r=await fetch('api/referensi.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(b)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Gagal');try{SINKRON.tulis({refVer:Date.now()})}catch{}return j}
 async function muat(){for(const j of ['titik','desa','bobot']){const r=await fetch('api/referensi.php?jenis='+j);data[j]=r.ok?await r.json():[]}render()}
 const KT=['nama','sumber','lat','lng','p','med','p90','maks','cv','hs','te','persen'],KD=['nama','kec','lat','lng','penduduk'];
 function tabel(id,rows,kolom,jenis){document.querySelector('#'+id+' tbody').innerHTML=rows.map(r=>'<tr>'+kolom.map(k=>'<td>'+esc(r[k])+'</td>').join('')+
  '<td style="white-space:nowrap"><button class="btn2" data-e="'+jenis+':'+r.id+'">Edit</button> <button class="btn2" data-d="'+jenis+':'+r.id+'">Hapus</button></td></tr>').join('')}
 function render(){window.__refMuat=muat;tabel('tTitik',data.titik,KT,'titik');tabel('tDesa',data.desa,KD,'desa');
  const w={};data.bobot.forEach(b=>w[b.criteria_name]=b.weight);
  document.getElementById('fBobot').innerHTML=['Daya','Ekosistem','Kedalaman','Jarak Infrastruktur'].map(n=>'<label style="font-size:13px">'+n+'<br><input name="'+n+'" type="number" step="0.01" min="0" max="1" value="'+(w[n]??'')+'" style="width:90px" required></label>').join('')+'<button class="btn" type="submit">Simpan bobot</button>'}
 function isi(form,row){[...form.elements].forEach(e=>{if(!e.name)return;e.value=row?(row[e.name]??''):'';if(e.tagName==='SELECT'&&!e.value)e.selectedIndex=e.options.length-1})}
 root.addEventListener('click',async e=>{
  const ed=e.target.dataset.e,hp=e.target.dataset.d;
  if(ed){const[j,id]=ed.split(':');isi(document.getElementById(j==='titik'?'fTitik':'fDesa'),data[j].find(x=>x.id==id))}
  if(hp){const[j,id]=hp.split(':');if(!confirm('Hapus data ini?'))return;try{await kirim({jenis:j,aksi:'delete',id:+id});msg('Terhapus.',1);muat()}catch(x){msg(x.message)}}
  if(e.target.dataset.reset!==undefined)isi(e.target.closest('form'),null)});
 [['fTitik','titik'],['fDesa','desa']].forEach(([f,j])=>document.getElementById(f).addEventListener('submit',async e=>{e.preventDefault();
  const b={jenis:j,aksi:e.target.id.value?'update':'create'};[...e.target.elements].forEach(x=>{if(x.name)b[x.name]=x.value});
  try{await kirim(b);msg('Tersimpan.',1);isi(e.target,null);muat()}catch(x){msg(x.message)}}));
 document.getElementById('fBobot').addEventListener('submit',async e=>{e.preventDefault();const w={};[...e.target.elements].forEach(x=>{if(x.name)w[x.name]=x.value});
  try{await kirim({jenis:'bobot',aksi:'update',w});msg('Bobot tersimpan.',1);muat()}catch(x){msg(x.message)}});
 fetch('api/auth.php?aksi=me').then(r=>r.json()).then(j=>{csrf=j.csrf||'';muat()});
})();
