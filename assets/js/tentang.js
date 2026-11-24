/* Tentang Data: legenda peta skema + penyaringan kartu layer & tabel sumber (pencarian + status). Tanpa ketergantungan. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

  /* legenda: tampil/sembunyikan persegi cakupan layer */
  var leg=$('#dtLegend');
  if(leg) leg.addEventListener('click',function(e){
    var b=e.target.closest('button[data-k]'); if(!b) return;
    var on=b.classList.toggle('on');
    $$('.dt-bb[data-k="'+b.getAttribute('data-k')+'"]').forEach(function(g){ g.classList.toggle('off',!on); });
  });

  /* penyaringan */
  var cari=$('#dtCari'), chips=$('#dtFilter .dt-fchips'), hitung=$('#dtCount'), kosong=$('#dtKosong');
  if(!cari||!chips) return;
  var status='semua';
  function norm(s){ return (s||'').toLowerCase().trim(); }
  function terap(){
    var q=norm(cari.value), tampil=0, total=0;
    $$('.dt-card').forEach(function(k){
      total++;
      var ok=(status==='semua'||k.getAttribute('data-status')===status)&&(!q||(k.getAttribute('data-teks')||'').indexOf(q)>-1);
      k.hidden=!ok; if(ok) tampil++;
    });
    var baris=0;
    $$('#dtTabel tbody').forEach(function(tb){
      var ada=0;
      $$('tr[data-status]',tb).forEach(function(r){
        var ok=(status==='semua'||r.getAttribute('data-status')===status)&&(!q||(r.getAttribute('data-teks')||'').indexOf(q)>-1);
        r.style.display=ok?'':'none'; if(ok){ ada++; baris++; }
      });
      tb.style.display=ada?'':'none';
    });
    if(hitung) hitung.textContent='Menampilkan '+tampil+' dari '+total+' layer · '+baris+' baris tabel sumber';
    if(kosong) kosong.hidden=tampil>0;
  }
  cari.addEventListener('input',terap);
  chips.addEventListener('click',function(e){
    var b=e.target.closest('button[data-st]'); if(!b) return;
    status=b.getAttribute('data-st');
    $$('button',chips).forEach(function(x){ x.classList.toggle('on',x===b); });
    terap();
  });
  terap();

  /* tautan ke kartu layer tertentu (tentang.php#l-karang): buka & sorot */
  function sorot(){
    var h=(location.hash||'').replace('#',''); if(!h) return;
    var el=document.getElementById(h); if(!el) return;
    if(el.tagName==='DETAILS') el.open=true;
    el.classList.add('dl-sorot'); setTimeout(function(){ el.classList.remove('dl-sorot'); },2200);
  }
  window.addEventListener('hashchange',sorot); window.addEventListener('load',sorot);
})();
