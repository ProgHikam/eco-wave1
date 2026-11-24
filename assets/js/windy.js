// ECO-WAVE - ambil prakiraan gelombang via api/windy.php (Windy / cadangan Open-Meteo)
function SIM(l){const h0=Math.sqrt(l.kw/(0.49*9.9)),n=Date.now(),s=[];
 for(let i=0;i<24;i++){const hs=h0*(1+.25*Math.sin(i/4+l.id)),tp=11+Math.sin(i/6);s.push({t:n+i*108e5/3*1,hs,tp,dir:200,p:.49*hs*hs*.9*tp})}
 return{sim:true,now:s[0],series:s,mean_p:s.reduce((a,x)=>a+x.p,0)/s.length}}
async function windy(lat,lng,l){try{const r=await fetch(`api/windy.php?lat=${lat}&lng=${lng}`),j=await r.json();if(!r.ok)throw new Error(j.error||'gagal');return j}
 catch(e){return l?{...SIM(l),err:e.message}:{error:e.message}}}
async function isiWindy(){const la=$('fLat').value,ln=$('fLng').value;if(!la||!ln){$('fWin').textContent='Isi latitude & longitude dulu.';return}
 $('fWin').textContent='Mengambil data Windy…';const v=await windy(la,ln,null);
 if(v.error){$('fWin').textContent='Gagal: '+v.error;return}
 $('fKw').value=f2(v.mean_p,1);$('fWin').textContent=`${v.trial?'DATA UJI (Trial). ':''}Rata-rata prakiraan ≈ ${f2(v.mean_p,1)} kW/m — estimasi cepat, ganti dengan hasil ERA5 bila sudah ada.`}
