// Transisi halaman ECO-WAVE ("Ocean Wave"): lihat assets/css/loading.css. Ringan: tanpa canvas/JS animasi, hanya transform & opacity lewat CSS.
// Alur: klik tautan internal / kirim form / pindah halaman lewat skrip -> gelombang naik menutup layar SAAT ITU JUGA (navigasi tidak ditunda).
// Halaman baru langsung tertutup dan melanjutkan animasi dari titik terakhir (head.php menghitung --pw-e), lalu gelombang membuka begitu halaman siap.
(function(){
  var root=document.documentElement, el=document.getElementById('pageLoader');
  if(!el) return;
  var IN=600, OUT=800, MIN=(window.ECOWAVE_LOADING_MIN>=0?window.ECOWAVE_LOADING_MIN:2100), SIAP_MAKS=4500, BATAL=6000, t0=window.__pwB||Date.now(), bukaT, batalT, tampil=false;

  function selesai(){ clearTimeout(bukaT); clearTimeout(batalT); root.classList.remove('pl-boot'); el.classList.remove('pw-in','pw-out'); tampil=false; }
  function buka(){ clearTimeout(bukaT); clearTimeout(batalT);
    el.classList.remove('pw-in'); root.classList.remove('pl-boot'); el.classList.add('pw-out'); tampil=false;
    bukaT=setTimeout(selesai,OUT+60); }
  // layar loading tampil minimal MIN ms sejak gelombang mulai naik (supaya animasi sempat terlihat); bila halaman lebih lambat, menunggu halaman siap
  function siap(){ var e0=window.__pwE, dasar=(e0!=null&&e0<9999)?e0:0, sisa=Math.max(0,MIN-(dasar+(Date.now()-t0))); setTimeout(buka,sisa); }
  function tutup(){ if(tampil) return; tampil=true; try{ sessionStorage.setItem('pw_t',String(Date.now())); }catch(_){}
    clearTimeout(bukaT); el.classList.remove('pw-out'); root.classList.remove('pl-boot'); void el.offsetWidth; root.style.setProperty('--pw-e','0ms'); el.classList.add('pw-in'); 
    batalT=setTimeout(function(){ try{ sessionStorage.removeItem('pw_t'); }catch(_){} buka(); },BATAL); }   // navigasi batal (unduhan, dialog, dll) -> buka lagi

  // halaman baru: sudah tertutup sejak <head>; buka saat siap
  if(document.readyState==='complete') siap(); else window.addEventListener('load',siap);
  setTimeout(function(){ if(root.classList.contains('pl-boot')) siap(); },SIAP_MAKS);
  // Back/Forward dari bfcache: halaman dipulihkan apa adanya -> pastikan tidak tertutup
  window.addEventListener('pageshow',function(e){ if(e.persisted){ try{ sessionStorage.removeItem('pw_t'); }catch(_){} selesai(); } });
  window.addEventListener('pagehide',function(){ clearTimeout(batalT); });

  // klik tautan internal
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return;
    var h=a.getAttribute('href');
    if(!h||h.charAt(0)==='#'||/^(javascript:|mailto:|tel:)/i.test(h)) return;
    if(a.target&&a.target!=='_self') return;
    if(a.hasAttribute('download')||a.hasAttribute('data-no-loader')) return;
    var u; try{ u=new URL(a.href,location.href); }catch(_){ return; }
    if(u.origin!==location.origin) return;
    if(u.pathname===location.pathname&&u.search===location.search) return;   // hanya hash / halaman sama
    if(/logout\.php$/.test(u.pathname)&&a.hasAttribute('onclick')) return;   // biar confirm() jalan dulu
    tutup();
  });
  // kirim form (login, dll.) - hanya bila benar-benar menavigasi halaman ini
  document.addEventListener('submit',function(e){ if(e.defaultPrevented) return; var f=e.target; if(f&&f.target&&f.target!=='_self') return; tutup(); });
  // pindah halaman lewat skrip (location.href = ...), tombol "Lihat di Peta", dll.
  window.addEventListener('beforeunload',function(){ if(!tampil) tutup(); });
})();
