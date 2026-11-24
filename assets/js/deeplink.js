/* ECO-WAVE - tautan langsung ke bagian fitur.
   Peta:        peta.php#layer | #mca | #windy | #bmkg | #asumsi | #info   -> membuka tab/panel yang sesuai di dock bawah.
   Kalkulator:  kalkulator.php#k-rank dst. -> loncat natively lewat id; di sini hanya membuka <details> yang tertutup & memberi sorotan singkat. */
(function(){
  'use strict';
  function sorot(el){ if(!el) return; el.classList.add('dl-sorot'); setTimeout(function(){ el.classList.remove('dl-sorot'); },2200); }
  function jalankan(){
    var h=(location.hash||'').replace(/^#/,''); if(!h) return;
    var page=document.body.getAttribute('data-page');
    if(page==='peta'){
      var dock=document.getElementById('hudDock'); if(!dock) return;
      var b=dock.querySelector('button[data-tab="'+h+'"]')||dock.querySelector('button[data-act="'+h+'"]');
      if(b) b.click();
    }else{
      var el=document.getElementById(h); if(!el) return;
      if(el.tagName==='DETAILS') el.open=true;
      /* hasil kalkulator tersembunyi sebelum "Hitung" ditekan: arahkan ke bagian input */
      if(el.offsetParent===null){ var f=document.getElementById('k-perangkat'); if(f){ f.scrollIntoView({behavior:'smooth',block:'start'}); sorot(f); } return; }
      setTimeout(function(){ el.scrollIntoView({behavior:'smooth',block:'start'}); sorot(el); },120);
    }
  }
  window.addEventListener('load',function(){ setTimeout(jalankan,350); });
  window.addEventListener('hashchange',jalankan);
})();
