<?php $page='beranda'; $title='ECO-WAVE - Beranda'; $libs=[]; $js=['data','ecowave','beranda']; include __DIR__.'/includes/head.php'; ?>
<style>
body[data-page=beranda]{margin:0!important}
body[data-page=beranda] main{display:block!important}

/* ===== HERO gaya NOVA: gelap, minimal, rata kiri ===== */
#beranda.hero{position:relative!important;height:100vh!important;height:100svh!important;min-height:max(100svh,800px)!important;max-height:none!important;overflow:hidden!important;display:block!important;background:transparent!important}
#beranda .hero-shade{position:absolute!important;inset:0!important;pointer-events:none!important;
  background:linear-gradient(90deg,rgba(var(--space-cadet-rgb),.78) 0%,rgba(var(--space-cadet-rgb),.35) 52%,rgba(var(--space-cadet-rgb),.25) 100%),
             linear-gradient(180deg,rgba(var(--space-cadet-rgb),.55) 0%,transparent 22%,transparent 62%,rgba(var(--space-cadet-rgb),.85) 100%)!important}
#beranda .hero-stage{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:96px 56px 170px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;box-sizing:border-box!important;pointer-events:none!important;z-index:4}
#beranda .hero-stage a,#beranda .hero-stage button{pointer-events:auto!important}
#beranda .hero-copy{position:relative!important;right:auto!important;bottom:auto!important;left:auto!important;text-align:left!important;max-width:680px!important;width:100%!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:22px!important}

.status-pill{display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border-radius:999px;background:rgba(var(--cream-rgb),.06);border:1px solid rgba(var(--cream-rgb),.12);backdrop-filter:blur(12px);
  font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--cream)}
.status-pill b{font-weight:600;color:var(--acc)}
.status-pill i{width:6px;height:6px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 4px rgba(var(--tan-rgb),.15);animation:o-denyut 2.2s ease-in-out infinite}
@keyframes o-denyut{0%,100%{box-shadow:0 0 0 3px rgba(var(--tan-rgb),.18)}50%{box-shadow:0 0 0 8px rgba(var(--tan-rgb),.04)}}

#beranda .hero-copy h1{margin:0!important;font-family:'Sora','Inter',system-ui,sans-serif!important;font-weight:300!important;text-transform:uppercase;
  font-size:clamp(2rem,min(4.6vw,7svh),4.2rem)!important;line-height:1.08!important;letter-spacing:.01em!important;color:var(--cream)!important;text-shadow:none!important}
#beranda .hero-copy h1 .hl{color:var(--acc)!important;background:none!important;-webkit-text-fill-color:var(--acc);filter:none!important}
#beranda .hero-copy .lead{max-width:520px!important;margin:0!important;font-size:15.5px!important;line-height:1.7!important;color:var(--tan)!important;text-shadow:none!important;background:none!important;border:0!important;padding:0!important;backdrop-filter:none!important}
#beranda .hero-copy .btns{display:flex!important;gap:12px!important;flex-wrap:wrap!important;margin-top:6px!important;justify-content:flex-start!important}
#beranda .hero-copy .btn{display:inline-flex!important;align-items:center!important;gap:10px!important;background:var(--cream)!important;color:var(--space-cadet)!important;padding:15px 26px!important;border-radius:999px!important;font-weight:600!important;font-size:13px!important;letter-spacing:.06em;text-transform:uppercase;text-decoration:none!important;box-shadow:none!important;transition:transform .2s,box-shadow .2s}
#beranda .hero-copy .btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(var(--cream-rgb),.18)!important}
#beranda .hero-copy .btn2{display:inline-flex!important;align-items:center!important;gap:10px!important;background:rgba(var(--cream-rgb),.04)!important;border:1px solid rgba(var(--cream-rgb),.22)!important;color:var(--cream)!important;padding:15px 24px!important;border-radius:999px!important;font-weight:500!important;font-size:13px!important;letter-spacing:.06em;text-transform:uppercase;text-decoration:none!important;backdrop-filter:blur(10px)!important;transition:background .2s,transform .2s}
#beranda .hero-copy .btn2:hover{background:rgba(var(--cream-rgb),.14)!important;transform:translateY(-2px)}

/* rel statistik kanan */
.hero-rail{position:absolute;right:26px;top:50%;transform:translateY(-58%);z-index:5;display:flex;flex-direction:column;gap:22px;text-align:center;pointer-events:none}
.hero-rail div{padding-bottom:22px;border-bottom:1px solid rgba(var(--cream-rgb),.1)}
.hero-rail div:last-child{border:0;padding-bottom:0}
.hero-rail b{display:block;font-family:'Sora',sans-serif;font-weight:300;font-size:1.5rem;color:var(--cream);line-height:1.1}
.hero-rail span{display:block;margin-top:6px;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--slate-gray)}

/* ===== KPI (diisi beranda.js) - kartu kaca di bawah hero ===== */
#kpi.kpi-bawah{position:relative;z-index:6;display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:16px!important;max-width:1180px!important;margin:-120px auto 0!important;padding:0 24px!important;background:transparent!important}
#kpi.kpi-bawah .kpi{display:flex!important;flex-direction:column-reverse;justify-content:flex-end;gap:18px;min-height:140px;text-align:left!important;
  background:rgba(var(--space-cadet-rgb),.55)!important;border:1px solid rgba(var(--cream-rgb),.12)!important;border-radius:26px!important;padding:20px 22px!important;color:var(--cream)!important;
  box-shadow:0 18px 44px rgba(var(--space-cadet-rgb),.45),inset 0 1px 0 rgba(var(--cream-rgb),.07)!important;backdrop-filter:blur(18px);transition:transform .25s,border-color .25s}
#kpi.kpi-bawah .kpi:hover{transform:translateY(-5px);border-color:rgba(var(--tan-rgb),.45)!important}
#kpi.kpi-bawah .kpi::after{display:none}
#kpi.kpi-bawah .kpi .kn{font-family:'Sora',sans-serif;font-weight:300!important;font-size:2.1rem!important;letter-spacing:-.01em;background:none!important;-webkit-text-fill-color:var(--cream);color:var(--cream)!important}
#kpi.kpi-bawah .kpi .text-xs{font-size:11px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--slate-gray);margin:0}

/* ===== sections ===== */
.sec{max-width:1180px;margin:0 auto;padding:84px 24px 8px;position:relative;z-index:2}
.sec-head{text-align:left;max-width:680px;margin:0 0 34px}
.sec-kicker{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--acc)}
.sec-head h2{font-family:'Sora','Inter',sans-serif;margin:12px 0 10px;font-size:clamp(1.6rem,3vw,2.3rem);font-weight:300;letter-spacing:0;color:var(--cream);line-height:1.2}
.sec-head p{margin:0;color:var(--tan);font-size:15px}
.alur{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;position:relative}
.alur-step{position:relative;text-align:left;padding:24px 22px;border-radius:26px;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1);backdrop-filter:blur(16px);transition:transform .25s,border-color .25s,box-shadow .25s}
.alur-step:hover{transform:translateY(-5px);border-color:rgba(var(--tan-rgb),.4);box-shadow:0 18px 44px rgba(var(--space-cadet-rgb),.45)}
.alur-step .ic{width:56px;height:56px;margin:0 0 16px;border-radius:50%;display:grid;place-items:center;background:rgba(var(--cream-rgb),.06);border:1px solid rgba(var(--cream-rgb),.14);color:var(--acc)}
.alur-step .ic svg{width:26px;height:26px}
.alur-step .no{position:absolute;right:20px;top:18px;font-size:11px;font-weight:500;color:var(--slate-gray);letter-spacing:.14em}
.alur-step h3{margin:0 0 6px;font-family:'Sora',sans-serif;font-size:1rem;font-weight:400;color:var(--cream)}
.alur-step p{margin:0;font-size:13px;line-height:1.65;color:var(--tan)}
.alur-step code{display:inline-block;margin-top:10px;padding:5px 11px;border-radius:999px;background:rgba(var(--tan-rgb),.1);border:1px solid rgba(var(--tan-rgb),.28);color:var(--tan);font-size:11.5px;font-weight:500}
.menu{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.menu a{display:flex;flex-direction:column;gap:8px;padding:24px 22px;border-radius:26px;text-decoration:none;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1);backdrop-filter:blur(16px);color:var(--cream);position:relative;overflow:hidden;transition:transform .25s,border-color .25s,box-shadow .25s}
.menu a:hover{transform:translateY(-5px);border-color:rgba(var(--tan-rgb),.45);box-shadow:0 18px 44px rgba(var(--space-cadet-rgb),.45)}
.menu svg{color:var(--acc)}
.menu b{font-family:'Sora',sans-serif;font-size:1rem;font-weight:400}
.menu span{font-size:13px;line-height:1.6;color:var(--tan)}
.menu em{margin-top:auto;padding-top:8px;font-style:normal;font-size:11.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--acc)}

@media(max-width:1100px){.hero-rail{display:none}}
@media(max-width:1000px){.alur,.menu{grid-template-columns:repeat(2,1fr)}#kpi.kpi-bawah{grid-template-columns:repeat(2,1fr)!important}}
@media(max-width:700px){
  #beranda.hero{height:auto!important;min-height:100svh!important}
  #beranda .hero-stage{position:relative!important;inset:auto!important;height:auto!important;min-height:100svh!important;padding:128px 20px 190px!important}
  .alur,.menu{grid-template-columns:1fr}
  #kpi.kpi-bawah{margin-top:-130px!important;padding:0 14px!important}
}
@media(prefers-reduced-motion:reduce){.status-pill i{animation:none!important}}

/* ===== pantauan langsung ===== */
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--tan);box-shadow:0 0 0 0 rgba(var(--tan-rgb),.6);animation:lv-d 2s infinite}
@keyframes lv-d{0%{box-shadow:0 0 0 0 rgba(var(--tan-rgb),.55)}70%{box-shadow:0 0 0 9px rgba(var(--tan-rgb),0)}100%{box-shadow:0 0 0 0 rgba(var(--tan-rgb),0)}}
.live-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.live-card{padding:22px;border-radius:26px;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1);backdrop-filter:blur(16px);transition:border-color .25s,transform .25s}
.live-card:hover{transform:translateY(-4px);border-color:rgba(var(--tan-rgb),.4)}
.live-card h3{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px;font-family:'Sora',sans-serif;font-size:.95rem;font-weight:400;color:var(--cream)}
.live-card h3 i.bi{color:var(--acc)}
.lv-stat{margin-left:auto;padding:2px 9px;border-radius:999px;font:600 10px/1.5 'Inter',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--tan);background:rgba(var(--cream-rgb),.07)}
.lv-stat.ok{color:var(--cream);background:rgba(var(--tan-rgb),.14)}.lv-stat.bad{color:var(--cream);background:rgba(var(--tan-rgb),.16)}.lv-stat.demo{color:var(--space-cadet);background:var(--tan);font-weight:800}
.lv-body{font-size:13px;line-height:1.65;color:var(--tan)}
.lv-big{display:flex;align-items:baseline;gap:6px;font-family:'Sora',sans-serif;font-weight:300;font-size:2rem;color:var(--cream);line-height:1.1}
.lv-big small{font-size:.8rem;color:var(--slate-gray)}
.lv-row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px solid rgba(var(--cream-rgb),.07)}
.lv-row span{color:var(--slate-gray)}.lv-row b{color:var(--cream);font-weight:500;text-align:right}
.lv-note{margin-top:8px;font-size:11.5px;color:var(--slate-gray)}
.lv-link{display:inline-block;margin-top:8px;font-size:11.5px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);text-decoration:none}
.lv-spark{display:block;width:100%;height:46px;margin:8px 0 2px}
.lv-top li{display:flex;align-items:center;gap:10px;padding:6px 0;border-top:1px solid rgba(var(--cream-rgb),.07);list-style:none}
.lv-top{margin:0;padding:0}.lv-top b{color:var(--cream);font-weight:500}.lv-top em{margin-left:auto;font-style:normal;padding:2px 9px;border-radius:999px;font-weight:700;color:var(--space-cadet);font-size:11.5px}
@media(max-width:1100px){.live-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.live-grid{grid-template-columns:1fr}}

/* ===== penyegaran beranda (v7): tetap sederhana ===== */
#beranda .hero-copy h1{font-size:clamp(2.1rem,min(5vw,7.4svh),4.6rem)!important;line-height:1.06!important}
#beranda .hero-copy h1 .hl{background:linear-gradient(90deg,var(--acc),var(--tan))!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;color:transparent!important}
#beranda .hero-copy::before{content:"";position:absolute;left:-120px;top:-60px;width:520px;height:420px;background:radial-gradient(closest-side,rgba(var(--tan-rgb),.13),transparent);pointer-events:none;z-index:-1}
.hero-chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 0;padding:0;list-style:none;max-width:520px}
.hero-chips li{padding:6px 13px;border-radius:999px;font-size:11.5px;letter-spacing:.06em;color:var(--tan);background:rgba(var(--cream-rgb),.04);border:1px solid rgba(var(--cream-rgb),.1);transition:color .2s,border-color .2s}
.hero-chips li:hover{color:var(--cream);border-color:rgba(var(--tan-rgb),.45)}
.hero-waves{position:absolute;left:0;right:0;bottom:0;height:150px;overflow:hidden;pointer-events:none;z-index:3;-webkit-mask-image:linear-gradient(180deg,transparent,var(--space-cadet) 60%);mask-image:linear-gradient(180deg,transparent,var(--space-cadet) 60%)}
.hero-waves svg{position:absolute;left:0;bottom:0;width:200%;height:100%}
.hero-waves .w1{animation:o-ombak 22s linear infinite}.hero-waves .w1 path{fill:rgba(var(--tan-rgb),.10)}
.hero-waves .w2{animation:o-ombak 34s linear infinite reverse;height:80%}.hero-waves .w2 path{fill:rgba(var(--tan-rgb),.08)}
@keyframes o-ombak{to{transform:translateX(-50%)}}
.sec-head h2{font-weight:300}
.sec-head h2::after{content:"";display:block;width:44px;height:2px;margin-top:14px;border-radius:2px;background:linear-gradient(90deg,var(--acc),transparent)}
@media(max-width:700px){.hero-chips{display:none}}
@media(prefers-reduced-motion:reduce){.hero-waves svg{animation:none!important}}

/* ===== animasi PLTGL di sisi kiri hero (v7) ===== */
.hero-art{position:absolute;left:20px;top:calc(50% - 24px);transform:translateY(-50%);width:min(920px,calc(100vw - 772px));aspect-ratio:7/5;z-index:2;pointer-events:none;-webkit-mask-image:linear-gradient(90deg,transparent 0,var(--space-cadet) 9%,var(--space-cadet) 91%,transparent 100%),linear-gradient(180deg,transparent 0,var(--space-cadet) 7%,var(--space-cadet) 89%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0,var(--space-cadet) 9%,var(--space-cadet) 91%,transparent 100%),linear-gradient(180deg,transparent 0,var(--space-cadet) 7%,var(--space-cadet) 89%,transparent 100%);mask-composite:intersect}
.hero-art svg{display:block;width:100%;height:100%;overflow:visible}
.ha-w1{animation:ha-geser1 var(--ha-w1,5s) linear infinite}
.ha-w2{animation:ha-geser2 var(--ha-w2,8s) linear infinite}
@keyframes ha-geser1{to{transform:translateX(-300px)}}
@keyframes ha-geser2{to{transform:translateX(-200px)}}
.ha-bob{animation:ha-bob var(--ha-bob,5s) ease-in-out infinite}
@keyframes ha-bob{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(calc(var(--ha-amp,14px)*-1)) rotate(-1.6deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(var(--ha-amp,14px)) rotate(1.6deg)}100%{transform:translateY(0) rotate(0)}}
.ha-bob{transform-box:view-box;transform-origin:300px 232px}
.ha-bolt{animation:ha-bolt var(--ha-bob,5s) ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ha-bolt{0%,12%,40%,100%{opacity:.15;transform:scale(.9)}25%{opacity:1;transform:scale(1.1)}}
.ha-led{animation:ha-led 2.4s ease-in-out infinite}
@keyframes ha-led{0%,100%{opacity:.35}50%{opacity:1}}
.ha-cable{animation:ha-alir var(--ha-alir,1.1s) linear infinite}
@keyframes ha-alir{to{stroke-dashoffset:-20}}
.ha-win{animation:ha-win var(--ha-bob,5s) ease-in-out infinite;opacity:.25}
.ha-win.w2{animation-delay:.3s}.ha-win.w3{animation-delay:.6s}.ha-win.w4{animation-delay:.9s}
@keyframes ha-win{0%,28%{opacity:.2}42%,86%{opacity:1}100%{opacity:.2}}
.ha-grass path{transform-box:fill-box;transform-origin:50% 100%;animation:ha-goyang 4s ease-in-out infinite alternate}
.ha-grass .s2{animation-delay:-.8s}.ha-grass .s3{animation-delay:-1.6s}.ha-grass .s4{animation-delay:-2.4s}
@keyframes ha-goyang{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
.ha-fish.f1{animation:ha-ikan1 18s linear infinite}.ha-fish.f2{animation:ha-ikan2 26s linear infinite}
@keyframes ha-ikan1{0%{transform:translate(-30px,334px)}50%{transform:translate(300px,322px)}100%{transform:translate(640px,334px)}}
@keyframes ha-ikan2{0%{transform:translate(640px,362px) scaleX(-1)}50%{transform:translate(320px,372px) scaleX(-1)}100%{transform:translate(-30px,362px) scaleX(-1)}}
/* kartu parameter di dalam animasi: angka dibaca dari data situs (beranda.js -> renderHero/renderEko) */
.ha-card rect{fill:rgba(var(--space-cadet-rgb),.64);stroke:rgba(var(--cream-rgb),.18);stroke-width:1}
.ha-card text{font-family:'Inter',system-ui,sans-serif;font-size:11.5px;fill:var(--tan)}
.ha-card .t{font-size:9.5px;font-weight:600;letter-spacing:1.4px;fill:var(--tan)}
.ha-card .v{fill:var(--cream);font-weight:600}
.ha-lead{fill:none;stroke:var(--cream);stroke-opacity:.32;stroke-dasharray:3 4}
.ha-buf{animation:ha-alir 3s linear infinite}
/* animasi diperbesar: isi seluruh ruang kosong di kiri teks. Di layar lebar, teks digeser ke kanan (tanpa batas lebar panggung) agar animasi bisa sampai 920px */
@media(min-width:1460px){#beranda .hero-stage{max-width:none!important;padding-right:160px!important}.hero-art{width:min(920px,calc(100vw - 880px))}}
@media(max-width:1259px){.hero-art{display:none}}
@media(max-width:1560px){.hero-art .lbl{display:none}}
@media(prefers-reduced-motion:reduce){.hero-art *{animation:none!important}.hero-art .ha-win{opacity:1}}

/* ===== struktur & keterbacaan (v8) ===== */
.sub-nav{position:sticky;top:64px;z-index:20;max-width:1180px;margin:28px auto 0;padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;border-radius:999px;background:rgba(var(--space-cadet-rgb),.72);border:1px solid rgba(var(--cream-rgb),.12);backdrop-filter:blur(14px)}
.sub-nav a{padding:7px 14px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;color:var(--cream);transition:background .2s,color .2s}
.sub-nav a:hover,.sub-nav a:focus-visible{background:rgba(var(--tan-rgb),.16);color:var(--cream);outline:none}
.catatan-awal{max-width:1180px;margin:22px auto 0;padding:0 24px;position:relative;z-index:2}
.catatan-awal div{display:flex;gap:14px;align-items:flex-start;padding:16px 20px;border-radius:20px;background:rgba(var(--tan-rgb),.28);border:1px solid rgba(var(--tan-rgb),.35);font-size:13.5px;line-height:1.65;color:var(--cream)}
.catatan-awal i{font-size:1.2rem;color:var(--tan);margin-top:2px}.catatan-awal a{color:var(--tan);font-weight:600}
.sec{scroll-margin-top:130px}
.sec-kicker .no{display:inline-grid;place-items:center;min-width:24px;height:24px;padding:0 6px;border-radius:8px;background:rgba(var(--tan-rgb),.16);border:1px solid rgba(var(--tan-rgb),.35);font-size:11px;letter-spacing:.04em}
.sec-head p{max-width:64ch}
.alur-step:not(:last-child)::before{content:"";position:absolute;right:-13px;top:50%;width:10px;height:10px;border-top:2px solid rgba(var(--tan-rgb),.55);border-right:2px solid rgba(var(--tan-rgb),.55);transform:translateY(-50%) rotate(45deg)}
.alur-step code{display:block;width:fit-content;max-width:100%;white-space:normal}
.ind-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.ind{padding:22px;border-radius:26px;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1);backdrop-filter:blur(16px)}
.ind .bw{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.ind h3{margin:0;font-family:'Sora',sans-serif;font-size:1rem;font-weight:400;color:var(--cream)}
.ind .bw b{font-family:'Sora',sans-serif;font-weight:300;font-size:1.8rem;color:var(--tan)}
.ind .bar{height:6px;border-radius:6px;background:rgba(var(--cream-rgb),.1);margin:12px 0}.ind .bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--slate-gray),var(--tan))}
.ind p{margin:0;font-size:13px;line-height:1.65;color:var(--cream)}
.kelas-leg{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:22px 0 6px}
.kelas-leg div{padding:10px 12px;border-radius:14px;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1);font-size:12.5px;color:var(--cream)}
.kelas-leg i{display:block;height:8px;border-radius:6px;margin-bottom:8px}.kelas-leg b{display:block;color:var(--cream);font-weight:600}
.cta-baris{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.cta-baris a{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:999px;font-size:12.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(var(--cream-rgb),.22);color:var(--cream);background:rgba(var(--cream-rgb),.05)}
.cta-baris a.utama{background:var(--tan);color:var(--space-cadet);border-color:transparent}
.cta-baris a:hover{transform:translateY(-2px)}
.ringkas-akhir{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.ringkas-akhir article{padding:22px;border-radius:26px;background:rgba(var(--space-cadet-rgb),.55);border:1px solid rgba(var(--cream-rgb),.1)}
.ringkas-akhir h3{margin:0 0 6px;font-family:'Sora',sans-serif;font-size:.98rem;font-weight:400;color:var(--cream)}.ringkas-akhir p{margin:0;font-size:13px;line-height:1.65;color:var(--cream)}
.ringkas-akhir a{color:var(--tan);font-weight:600}
@media(max-width:1000px){.ind-grid{grid-template-columns:repeat(2,1fr)}.kelas-leg{grid-template-columns:repeat(2,1fr)}.ringkas-akhir{grid-template-columns:1fr}.alur-step::before{display:none}.sub-nav{border-radius:20px}}
@media(max-width:700px){.ind-grid{grid-template-columns:1fr}.sub-nav{top:56px}}

/* ===== v8: tampilan korporat biru + emas (gaya PPT referensi) ===== */
body[data-page=beranda] #beranda.hero{padding:84px 24px 24px!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
#beranda .hero-shade,#beranda .hero-waves{display:none!important}
#beranda .hero-stage{position:relative!important;inset:auto!important;height:auto!important;max-width:1272px!important;margin:0 auto!important;padding:0 0 92px!important;display:grid!important;grid-template-columns:1.08fr 1fr!important;align-items:stretch!important;border-radius:30px;overflow:hidden;box-shadow:0 30px 80px rgba(var(--space-cadet-rgb),.55);background:var(--space-cadet);pointer-events:auto!important;min-height:640px}
.hero-judul{grid-area:1/1;position:relative;z-index:3;padding:46px 0 0 48px;pointer-events:none;align-self:start}
.hero-judul b{display:block;font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(3.4rem,8vw,7.2rem);line-height:.88;letter-spacing:-.02em;color:var(--cream);text-shadow:0 6px 30px rgba(var(--space-cadet-rgb),.45)}
.hero-judul span{display:block;margin-top:16px;font-family:'Sora',sans-serif;font-weight:700;font-size:clamp(1.4rem,3vw,2.6rem);color:rgba(var(--cream-rgb),.28);letter-spacing:.08em}
#beranda .hero-art{grid-area:1/1;position:relative!important;left:auto!important;top:auto!important;transform:none!important;width:100%!important;height:100%;aspect-ratio:auto!important;display:flex!important;align-items:flex-end;z-index:2;-webkit-mask-image:none!important;mask-image:none!important;
  background:linear-gradient(180deg,var(--tan) 0%,var(--slate-gray) 45%,var(--space-cadet) 100%)}
#beranda .hero-art svg{width:100%;height:auto;max-height:100%;margin-bottom:8px}
#beranda .hero-art .lbl{display:inline!important}
#beranda .hero-copy{grid-area:1/2;max-width:none!important;width:auto!important;padding:56px 48px 40px!important;gap:18px!important;justify-content:center;background:linear-gradient(160deg,var(--space-cadet),var(--space-cadet));position:relative;z-index:3}
#beranda .hero-copy::before{display:none}
#beranda .hero-copy .status-pill{background:none;border:0;padding:0;color:var(--tan);font-weight:700;letter-spacing:.18em;backdrop-filter:none}
#beranda .hero-copy h1{color:var(--cream)!important;font-weight:700!important;font-size:clamp(1.7rem,3.1vw,2.8rem)!important;line-height:1.12!important}
#beranda .hero-copy h1 .hl{-webkit-text-fill-color:var(--tan);color:var(--tan)!important;background:none!important}
#beranda .hero-copy .lead{color:var(--cream)!important;max-width:none!important}
#beranda .hero-copy .btn{background:var(--tan)!important;color:var(--space-cadet)!important;border-radius:12px!important;font-weight:700!important}
#beranda .hero-copy .btn2{border-radius:12px!important;border-color:rgba(var(--tan-rgb),.55)!important;color:var(--tan)!important}
.hero-tagline{margin:6px 0 0;font-family:'Sora',sans-serif;font-weight:700;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--cream)}
.hero-tagline i{font-style:normal;color:var(--tan);margin:0 .6em}
.hero-url{margin:0;font-size:12.5px;letter-spacing:.06em;color:var(--tan)}
.hero-url i{color:var(--tan)}
#beranda .hero-rail{display:flex!important;flex-direction:row!important;position:absolute!important;left:50%!important;right:auto!important;top:auto!important;bottom:24px!important;transform:translateX(-50%)!important;width:min(1272px,calc(100% - 48px));gap:0!important;z-index:6;
  background:linear-gradient(90deg,var(--tan),var(--coffee));border-radius:0 0 30px 30px;height:84px;align-items:center}
#beranda .hero-rail div{flex:1;border:0!important;padding:0!important;border-right:1px solid rgba(var(--space-cadet-rgb),.25)!important}
#beranda .hero-rail div:last-child{border-right:0!important}
#beranda .hero-rail b{color:var(--space-cadet)!important;font-weight:800!important;font-size:1.7rem!important}
#beranda .hero-rail span{color:var(--space-cadet)!important;margin-top:2px;font-weight:600}
@media(max-width:1100px){#beranda .hero-rail{display:flex!important}}
@media(max-width:900px){
  #beranda .hero-stage{grid-template-columns:1fr!important;min-height:0}
  .hero-judul{grid-area:1/1;padding:28px 0 0 24px}
  #beranda .hero-art{grid-area:1/1;min-height:340px}
  #beranda .hero-copy{grid-area:2/1;padding:32px 24px 36px!important}
  #beranda .hero-art .lbl{display:none!important}
  #beranda .hero-rail{height:72px}#beranda .hero-rail b{font-size:1.25rem!important}
}
/* ===== CONTENTS: 4 kolom tinggi PART 01-04 ===== */
.menu{gap:0!important;border-radius:26px;overflow:hidden;box-shadow:0 24px 60px rgba(var(--space-cadet-rgb),.45)}
.menu a{border-radius:0!important;border:0!important;border-right:1px solid rgba(var(--cream-rgb),.12)!important;min-height:340px;padding:34px 26px!important;gap:12px!important;background:linear-gradient(180deg,rgba(var(--slate-gray-rgb),.55),rgba(var(--space-cadet-rgb),.92))!important}
.menu a:nth-child(2){background:linear-gradient(180deg,rgba(var(--slate-gray-rgb),.6),rgba(var(--space-cadet-rgb),.95))!important}
.menu a:nth-child(3){background:linear-gradient(180deg,rgba(var(--slate-gray-rgb),.45),rgba(var(--space-cadet-rgb),.95))!important}
.menu a:last-child{border-right:0!important}
.menu a:hover{transform:none!important;box-shadow:inset 0 0 0 2px var(--tan)!important}
/* cincin hover mengikuti sudut membulat wadahnya (dulu terpotong di pojok kartu pertama/terakhir) */
.menu a:first-child{border-top-left-radius:26px!important;border-bottom-left-radius:26px!important}
.menu a:last-child{border-top-right-radius:26px!important;border-bottom-right-radius:26px!important}
@media(max-width:1000px){.menu a:nth-child(1){border-radius:26px 0 0 0!important}.menu a:nth-child(2){border-radius:0 26px 0 0!important}.menu a:nth-child(3){border-radius:0 0 0 26px!important}.menu a:nth-child(4){border-radius:0 0 26px 0!important}}
@media(max-width:700px){.menu a:nth-child(n){border-radius:0!important}.menu a:first-child{border-radius:26px 26px 0 0!important}.menu a:last-child{border-radius:0 0 26px 26px!important}}
.menu .part{text-decoration:none;font-family:'Sora',sans-serif;font-weight:800;font-size:13px;letter-spacing:.2em;color:var(--tan);order:-2}
.menu svg{order:-1;opacity:.9;margin:6px 0 4px}
.menu b{font-size:1.35rem!important;font-weight:700!important;color:var(--cream)}
.menu b::after{content:"";display:block;width:44px;height:3px;background:var(--tan);margin-top:12px;border-radius:2px}
.menu span{color:var(--cream)!important}
@media(max-width:1000px){.menu a{min-height:0;border-right:0!important;border-bottom:1px solid rgba(var(--cream-rgb),.12)!important}}

#beranda .hero-art svg{height:100%!important;max-height:none!important;margin:0!important}
.hero-judul span{position:absolute;top:58px;right:30px;margin:0;font-size:clamp(1rem,1.8vw,1.5rem)}
#beranda .hero-copy h1 .hl{background:none!important;-webkit-background-clip:border-box!important;background-clip:border-box!important;-webkit-text-fill-color:var(--tan)!important;color:var(--tan)!important;display:inline}
#kpi.kpi-bawah{margin-top:8px!important}
#kpi.kpi-bawah .kpi .text-xs{color:var(--cream)!important}
#kpi.kpi-bawah .kpi .kn{font-weight:700!important;color:var(--tan)!important;-webkit-text-fill-color:var(--tan)!important}

#beranda .hero-art{padding-top:250px;box-sizing:border-box}
#beranda .hero-art svg{height:auto!important;width:100%!important}

#beranda .hero-stage{column-gap:0!important;gap:0!important}
#beranda .hero-art,#beranda .hero-copy,.hero-judul{margin:0!important;width:auto!important;max-width:none!important}
#beranda .hero-art{justify-self:stretch}
#beranda .hero-copy{align-self:stretch!important}

/* ===== v9: potongan layar penuh, foto ombak kiri + biru tua kanan ===== */
body[data-page=beranda] #beranda.hero{padding:68px 0 0!important}
#beranda .hero-stage{max-width:none!important;border-radius:0!important;box-shadow:none!important;grid-template-columns:1fr 1fr!important;min-height:calc(100svh - 68px - 84px)!important;padding-bottom:0!important}
#beranda .hero-art{background:linear-gradient(180deg,rgba(var(--space-cadet-rgb),.35),rgba(var(--space-cadet-rgb),.75) 70%),url(assets/video/bg-samudra.jpg) center/cover no-repeat!important;padding:300px 36px 36px!important;align-items:flex-end}
#beranda .hero-art svg{width:84%!important;margin-left:auto!important;filter:drop-shadow(0 12px 30px rgba(var(--space-cadet-rgb),.5))}
.hero-judul{padding:56px 0 0 64px}
.hero-judul b{font-size:clamp(4rem,9vw,8.4rem);line-height:.86}
.hero-judul span{top:72px;right:36px;color:rgba(var(--cream-rgb),.55)}
#beranda .hero-copy{padding:72px 72px 48px 64px!important;background:linear-gradient(160deg,var(--space-cadet),var(--space-cadet))!important;overflow:hidden}
.hero-bigword{position:absolute;right:-20px;top:18px;font-family:'Sora',sans-serif;font-weight:800;font-size:clamp(7rem,16vw,15rem);line-height:.8;color:rgba(var(--cream-rgb),.06);letter-spacing:-.03em;pointer-events:none;z-index:0}
#beranda .hero-copy>*:not(.hero-bigword){position:relative;z-index:1}
#beranda .hero-copy h1{font-size:clamp(2rem,3.6vw,3.4rem)!important;color:var(--tan)!important}
#beranda .hero-copy h1 .hl{color:var(--cream)!important;-webkit-text-fill-color:var(--cream)!important}
#beranda .hero-rail{left:0!important;transform:none!important;width:100%!important;bottom:0!important;border-radius:0!important;height:84px}
body[data-page=beranda] #beranda.hero{padding-bottom:84px!important}
#kpi.kpi-bawah{margin-top:36px!important}
@media(max-width:900px){#beranda .hero-stage{grid-template-columns:1fr!important}#beranda .hero-art{padding:220px 16px 20px!important}#beranda .hero-copy{padding:32px 24px!important}.hero-judul{padding:32px 0 0 24px}}
#beranda .hero-copy h1{font-size:clamp(1.8rem,2.7vw,2.6rem)!important}

/* ===== CTA utama = Caput Mortuum ===== */
#beranda .hero-copy .btn,.cta-baris a.utama,.btn-primary,button.primary,#hitungBtn{background:var(--caput-mortuum)!important;color:var(--cream)!important;border-color:var(--caput-mortuum)!important}

/* ===== v10: beranda gaya "Caring for the planet": hero tengah + jendela dasbor ===== */
#beranda .hero-art,.hero-judul,.hero-bigword,.hero-tagline,.hero-url,#beranda .hero-shade,#beranda .hero-waves{display:none!important}
body[data-page=beranda] #beranda.hero{margin:14px 14px 0!important;padding:112px 24px 230px!important;border-radius:40px;overflow:hidden!important;position:relative;
  background:linear-gradient(180deg,rgba(var(--slate-gray-rgb),.55) 0%,rgba(var(--slate-gray-rgb),.10) 42%,rgba(var(--space-cadet-rgb),.78) 100%),url(assets/video/bg-samudra.jpg) center 40%/cover no-repeat!important}
#beranda .hero-stage{display:flex!important;flex-direction:column;align-items:center;justify-content:center;max-width:860px!important;min-height:0!important;padding:0!important;background:none!important;box-shadow:none!important;border-radius:0!important;overflow:visible!important;margin:0 auto!important}
#beranda .hero-copy{display:flex!important;flex-direction:column;align-items:center!important;text-align:center!important;background:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:none!important;padding:0!important;gap:18px!important;max-width:760px!important}
#beranda .hero-copy .status-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(var(--cream-rgb),.85)!important;color:var(--space-cadet)!important;padding:6px 14px!important;border-radius:999px;font-size:11px;letter-spacing:.16em}
#beranda .hero-copy h1{font-family:'Sora','Inter',system-ui,sans-serif!important;text-transform:none!important;font-weight:300!important;letter-spacing:-.035em!important;font-size:clamp(2.2rem,4.8vw,4rem)!important;line-height:1.1!important;color:var(--space-cadet)!important;text-shadow:0 2px 20px rgba(var(--cream-rgb),.35)}
#beranda .hero-copy h1 .hl{color:var(--caput-mortuum)!important;-webkit-text-fill-color:var(--caput-mortuum)!important}
#beranda .hero-copy .lead{color:var(--space-cadet)!important;text-align:center;font-size:16px!important;max-width:620px!important;font-weight:500}
#beranda .hero-copy .hero-cari{max-width:520px;width:100%;background:rgba(var(--cream-rgb),.82)!important;color:var(--space-cadet)!important;border:0!important;border-radius:999px!important}
#beranda .hero-copy .hero-cari *{color:var(--space-cadet)!important}
#beranda .hero-copy .btns{justify-content:center!important}
#beranda .hero-copy .btn{background:var(--caput-mortuum)!important;color:var(--cream)!important;border-radius:10px!important;font-weight:600!important;text-transform:none!important;letter-spacing:0!important}
#beranda .hero-copy .btn2{background:var(--cream)!important;color:var(--space-cadet)!important;border:0!important;border-radius:10px!important;font-weight:600!important;text-transform:none!important;letter-spacing:0!important}
#beranda .hero-rail{display:flex!important;flex-direction:row!important;position:absolute!important;left:50%!important;bottom:150px!important;top:auto!important;right:auto!important;transform:translateX(-50%)!important;width:min(560px,calc(100% - 48px))!important;height:auto!important;border-radius:999px!important;padding:12px 8px;background:rgba(var(--cream-rgb),.88)!important;box-shadow:0 10px 30px rgba(var(--space-cadet-rgb),.3)}
#beranda .hero-rail b,#beranda .hero-rail span{color:var(--space-cadet)!important;text-shadow:none!important}
#beranda .hero-rail b{font-size:1.25rem!important}
/* jendela dasbor "browser" */
#langsung{position:relative;z-index:5;margin-top:-118px!important;padding-top:0!important}
#langsung .sec-head,#langsung>div:first-child{position:relative;z-index:2}
#langsung .live-grid{position:relative;background:var(--cream)!important;border-radius:22px;padding:64px 18px 18px!important;box-shadow:0 30px 70px rgba(var(--space-cadet-rgb),.45);gap:14px!important}
#langsung .live-grid::before{content:"";position:absolute;left:0;right:0;top:0;height:46px;border-radius:22px 22px 0 0;border-bottom:1px solid rgba(var(--slate-gray-rgb),.25);
  background:radial-gradient(circle at 22px 23px,var(--caput-mortuum) 5px,transparent 5.5px),radial-gradient(circle at 42px 23px,var(--tan) 5px,transparent 5.5px),radial-gradient(circle at 62px 23px,var(--slate-gray) 5px,transparent 5.5px)}
#langsung .live-grid::after{content:"ecowave.local";position:absolute;left:50%;top:11px;transform:translateX(-50%);width:min(340px,50%);text-align:center;font-size:12px;color:var(--slate-gray);background:rgba(var(--slate-gray-rgb),.14);border-radius:8px;padding:5px 0}
#langsung .live-grid .live-card{background:var(--cream)!important;border:1px solid rgba(var(--slate-gray-rgb),.28)!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;color:var(--space-cadet)!important;border-radius:18px!important}
#langsung .live-grid .live-card,#langsung .live-grid .live-card *{color:var(--space-cadet)!important}
#langsung .live-grid .live-card .lv-stat{color:var(--caput-mortuum)!important}
#langsung .live-grid .live-card h3{font-family:'Sora','Inter',sans-serif;font-weight:400;letter-spacing:-.01em}
@media(max-width:700px){body[data-page=beranda] #beranda.hero{padding:96px 16px 220px!important;border-radius:28px}}

body[data-page=beranda] #beranda.hero{background:linear-gradient(180deg,rgba(var(--space-cadet-rgb),.72) 0%,rgba(var(--space-cadet-rgb),.38) 45%,rgba(var(--space-cadet-rgb),.80) 100%),url(assets/video/bg-samudra.jpg) center 40%/cover no-repeat!important}
#beranda .hero-copy h1{color:var(--cream)!important;text-shadow:0 3px 24px rgba(var(--space-cadet-rgb),.6)!important}
#beranda .hero-copy h1 .hl{color:var(--tan)!important;-webkit-text-fill-color:var(--tan)!important}
#beranda .hero-copy .lead{color:var(--cream)!important;text-shadow:0 2px 14px rgba(var(--space-cadet-rgb),.7)}
body[data-page=beranda] #beranda .hero-rail div b,body[data-page=beranda] #beranda .hero-rail div span{color:var(--space-cadet)!important;text-shadow:none!important}
#langsung .sec-head *,#langsung>div:first-child *{color:var(--cream)!important;text-shadow:0 2px 14px rgba(var(--space-cadet-rgb),.7)}

body[data-page=beranda] #beranda.hero{padding-bottom:330px!important}
#beranda .hero-rail{bottom:270px!important}
#langsung{margin-top:-120px!important}
#langsung .live-grid .live-card em,.lv-top em{background:var(--tan)!important;color:var(--space-cadet)!important}
#beranda .hero-rail{bottom:140px!important}
body[data-page=beranda] #beranda.hero{padding-bottom:230px!important}

/* v11: hero tanpa foto, video jadi latar */
body[data-page=beranda] #beranda.hero{background:none!important;border-radius:0!important;margin:0!important;overflow:visible!important}

/* simetri: hero benar-benar di tengah */
#beranda .hero-stage{padding:0!important;width:100%!important;align-items:center!important}
#beranda .hero-copy{position:relative!important;left:auto!important;right:auto!important;inset-inline:auto!important;transform:none!important;width:100%!important;max-width:760px!important;margin:0 auto!important;padding:0!important;align-self:center!important}
#beranda .hero-copy>*{margin-left:auto!important;margin-right:auto!important}
#beranda .hero-copy .btns{width:100%}
#beranda .hero-copy .btn,#beranda .hero-copy .btn2{min-width:230px;justify-content:center!important}
#beranda .hero-rail{width:520px!important}

.menu a{align-items:center!important;text-align:center!important}
.menu b::after{margin-left:auto!important;margin-right:auto!important}
.menu a .more,.menu a em,.menu a>:last-child{margin-left:auto;margin-right:auto}
.catatan-awal>*{text-align:center!important;border-left:1px solid rgba(var(--cream-rgb),.30)!important;border-top:4px solid var(--tan)!important;justify-content:center}
.sub-nav{justify-content:center!important}
.sub-nav{top:76px!important}

/* tipografi hero modern: kontras bobot, rapat, ringan di mata (bukan huruf tipis raksasa) */
#beranda .hero-copy .status-pill{background:rgba(var(--cream-rgb),.10)!important;color:var(--cream)!important;border:1px solid rgba(var(--cream-rgb),.32);font-size:10.5px!important;font-weight:600;letter-spacing:.22em!important;padding:7px 16px!important}
#beranda .hero-copy h1{font-weight:600!important;letter-spacing:-.045em!important;line-height:1.06!important;font-size:clamp(2rem,4.3vw,3.5rem)!important;max-width:100%;overflow-wrap:break-word;text-wrap:balance}
#beranda .hero-copy h1 .hl{font-weight:300!important;letter-spacing:-.03em}
#beranda .hero-copy .lead{font-weight:400!important;font-size:15.5px!important;line-height:1.75!important;max-width:540px!important;color:var(--cream)!important;opacity:.9;text-wrap:pretty}
#beranda .hero-copy{gap:20px!important}
</style>

<header id="beranda" class="page hero active">
  <div class="hero-shade"></div>
  <div class="hero-waves" aria-hidden="true"><svg viewBox="0 0 2400 120" preserveAspectRatio="none" class="w1"><path d="M0 60Q150 20 300 60T600 60T900 60T1200 60T1500 60T1800 60T2100 60T2400 60V120H0Z"/></svg><svg viewBox="0 0 2400 120" preserveAspectRatio="none" class="w2"><path d="M0 70Q200 30 400 70T800 70T1200 70T1600 70T2000 70T2400 70V120H0Z"/></svg></div>
  <div class="hero-stage">
  <div class="hero-judul" aria-hidden="true"><b>ECO<br>WAVE</b><span>2015&ndash;2024</span></div>
  <div class="hero-art" aria-hidden="true">
    <svg viewBox="-30 0 700 500" preserveAspectRatio="xMidYMax meet" focusable="false">
      <defs>
        <linearGradient id="ha-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#617891" stop-opacity=".30"/><stop offset="1" stop-color="#25344F" stop-opacity=".10"/></linearGradient>
        <linearGradient id="ha-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25344F"/><stop offset="1" stop-color="#25344F"/></linearGradient>
        <linearGradient id="ha-buoy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F5EFE6"/><stop offset="1" stop-color="#D5B893"/></linearGradient>
        <radialGradient id="ha-glow"><stop offset="0" stop-color="#D5B893" stop-opacity=".9"/><stop offset="1" stop-color="#D5B893" stop-opacity="0"/></radialGradient>
        <clipPath id="ha-clip"><rect x="-40" y="0" width="720" height="396"/></clipPath>
      </defs>
      <g class="ha-w2"><path d="M-200 240Q-150 222 -100 240T0 240T100 240T200 240T300 240T400 240T500 240T600 240T700 240T800 240T900 240T1000 240V500H-200Z" fill="rgba(213,184,147,.10)"/></g>
      <g clip-path="url(#ha-clip)"><g class="ha-bob">
        <rect x="297" y="250" width="6" height="170" rx="2" fill="#D5B893"/><rect x="298.2" y="250" width="1.6" height="170" fill="#F5EFE6"/>
        <rect x="298" y="190" width="4" height="26" rx="1.5" fill="#F5EFE6"/>
        <circle class="ha-led" cx="300" cy="187" r="9" fill="url(#ha-glow)"/><circle cx="300" cy="187" r="3.2" fill="#D5B893"/>
        <path d="M262 232a38 20 0 0 1 76 0v10a14 14 0 0 1-14 14h-48a14 14 0 0 1-14-14z" fill="url(#ha-buoy)"/>
        <rect x="262" y="236" width="76" height="6" fill="#D5B893" opacity=".9"/>
        <path class="ha-bolt" d="M304 146l-14 22h9l-5 18 17-25h-10z" fill="#D5B893"/>
      </g></g>
      <rect x="276" y="394" width="48" height="30" rx="7" fill="#25344F" stroke="#D5B893" stroke-opacity=".6"/><rect x="292" y="386" width="16" height="10" rx="2" fill="#25344F"/><circle class="ha-led" cx="300" cy="409" r="3" fill="#D5B893"/>
      <g class="ha-grass" fill="none" stroke="#D5B893" stroke-width="3.2" stroke-linecap="round" opacity=".85">
        <path class="s1" d="M76 438Q72 410 78 380"/><path class="s2" d="M88 438Q92 404 86 366"/><path class="s3" d="M100 438Q96 408 102 372"/><path class="s4" d="M112 438Q118 412 112 384"/><path class="s1" d="M124 438Q120 404 128 368"/><path class="s2" d="M136 438Q140 414 134 388"/><path class="s3" d="M148 438Q144 410 150 382"/>
      </g>
      <g fill="none" stroke-linecap="round"><g stroke="#D5B893" stroke-width="4.5"><path d="M204 444V408M204 424l-10-14M204 418l10-12"/></g><g stroke="#D5B893" stroke-width="4.5"><path d="M232 444V400M232 420l-11-13M232 412l12-12M232 428l11-9"/></g></g>
      <g fill="#D5B893"><circle cx="194" cy="409" r="3"/><circle cx="214" cy="406" r="3"/></g><g fill="#D5B893"><circle cx="221" cy="406" r="3"/><circle cx="244" cy="399" r="3"/><circle cx="243" cy="419" r="3"/><circle cx="232" cy="398" r="3"/></g>
      <ellipse cx="262" cy="428" rx="14" ry="6" fill="#D5B893" opacity=".9"/>
      <g class="ha-fish f1"><g fill="#D5B893" opacity=".85"><ellipse cx="0" cy="0" rx="9" ry="4.5"/><path d="M8 0l9-6v12z"/></g></g>
      <g class="ha-fish f2"><g fill="#D5B893" opacity=".7" transform="scale(.8)"><ellipse cx="0" cy="0" rx="9" ry="4.5"/><path d="M8 0l9-6v12z"/></g></g>
      <g class="ha-w1"><path d="M-300 230Q-225 200 -150 230T0 230T150 230T300 230T450 230T600 230T750 230T900 230T1050 230V500H-300Z" fill="url(#ha-sea)"/><path d="M-300 230Q-225 200 -150 230T0 230T150 230T300 230T450 230T600 230T750 230T900 230T1050 230" fill="none" stroke="#D5B893" stroke-opacity=".75" stroke-width="2"/></g>
      <path d="M-40 436Q90 418 180 430T330 428T400 420Q448 414 466 340Q478 262 506 226L540 216Q600 208 720 212V500H-40Z" fill="url(#ha-sand)"/>
      <path d="M-40 436Q90 418 180 430T330 428T400 420Q448 414 466 340Q478 262 506 226L540 216Q600 208 720 212" fill="none" stroke="#F5EFE6" stroke-opacity=".14" stroke-width="1.5"/>
      <path d="M324 410Q362 426 400 421Q448 414 462 352Q474 272 506 230" fill="none" stroke="#617891" stroke-width="3.2" stroke-linecap="round"/>
      <path class="ha-cable" d="M324 410Q362 426 400 421Q448 414 462 352Q474 272 506 230" fill="none" stroke="#D5B893" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 16"/>
      <g fill="#617891"><g><rect x="521" y="226" width="3" height="10" fill="#25344F"/><circle cx="522" cy="222" r="8"/></g><g><rect x="530" y="222" width="3" height="10" fill="#25344F"/><circle cx="531" cy="217" r="7"/></g></g>
      <g><rect x="502" y="208" width="18" height="18" rx="2" fill="#25344F" stroke="#D5B893" stroke-opacity=".6"/><path d="M506 208v-9M516 208v-9M503 203h16" stroke="#D5B893" stroke-width="1.6" fill="none"/><circle class="ha-led" cx="511" cy="217" r="2.6" fill="#D5B893"/></g>
      <g><path d="M546 214v-19l11-9 11 9v19z" fill="#25344F"/><path d="M544 196l13-11 13 11z" fill="#617891"/><rect class="ha-win w1" x="552" y="198" width="7" height="7" rx="1" fill="#D5B893"/><rect class="ha-win w2" x="562" y="198" width="5" height="16" rx="1" fill="#D5B893"/></g>
      <g><path d="M576 213v-17l9-8 9 8v17z" fill="#25344F"/><path d="M574 197l11-10 11 10z" fill="#617891"/><rect class="ha-win w3" x="580" y="199" width="6" height="6" rx="1" fill="#D5B893"/><rect class="ha-win w4" x="588" y="203" width="4" height="10" rx="1" fill="#D5B893"/></g>
      <ellipse class="ha-buf" cx="160" cy="410" rx="108" ry="44" fill="none" stroke="#D5B893" stroke-opacity=".6" stroke-width="1.4" stroke-dasharray="5 7"/>
      <g class="ha-data">
        <path class="ha-lead" d="M300 130V142"/><path class="ha-lead" d="M598 118L588 184"/><path class="ha-lead" d="M92 340V366"/>
        <g class="ha-card"><rect x="148" y="26" width="228" height="104" rx="12"/>
          <text class="t" x="162" y="44" id="haGelT">TERBAIK · MEMUAT…</text>
          <text x="162" y="62" id="haSkor">Skor · kelas · penapisan awal</text>
          <text x="162" y="79"><tspan>Hs </tspan><tspan class="v" id="haHs">2,13 m</tspan><tspan> · Te </tspan><tspan class="v" id="haTe">10,8 s</tspan><tspan class="m"> CMEMS</tspan></text>
          <text x="162" y="96"><tspan>Daya </tspan><tspan class="v" id="haP">25,57 kW/m</tspan><tspan id="haCm"> · P0 25,57</tspan></text>
          <text x="162" y="113" id="haBmkg">BMKG: memuat…</text></g>
        <g class="ha-card"><rect x="385" y="36" width="228" height="82" rx="12"/>
          <text class="t" x="399" y="55">LISTRIK → JARINGAN</text>
          <text x="399" y="75"><tspan class="v" id="haKw">76,7 kW</tspan><tspan id="haPar"> · 1 × 10 m · 30%</tspan></text>
          <text x="399" y="92" id="haJar">Gardu · jalur listrik: memuat…</text>
          <text x="399" y="109"><tspan class="v" id="haRumah">170</tspan><tspan> rumah 450 VA</tspan></text></g>
        <g class="ha-card"><rect x="-26" y="252" width="236" height="88" rx="12"/>
          <text class="t" x="-12" y="271">EKOSISTEM TERJAGA</text>
          <text x="-12" y="289" id="haEko1">Karang · Lamun: memuat…</text>
          <text x="-12" y="306" id="haEko2">Reef · Mangrove</text>
          <text x="-12" y="323" id="haEko3">Penyangga: karang 1 km</text></g>
      </g>
      <g class="lbl" fill="#D5B893" font-family="Inter,system-ui,sans-serif" font-size="10.5" letter-spacing="1.4">
        <path d="M30 156H112L262 224" fill="none" stroke="#F5EFE6" stroke-opacity=".28" stroke-dasharray="3 4"/><text x="30" y="148">PELAMPUNG PENYERAP GELOMBANG</text>
        <path d="M112 452V440" stroke="#F5EFE6" stroke-opacity=".28" stroke-dasharray="3 4"/><text x="30" y="470">KARANG &amp; LAMUN TETAP TERJAGA</text>
        <path d="M350 452V424" stroke="#F5EFE6" stroke-opacity=".28" stroke-dasharray="3 4"/><text x="262" y="470">GENERATOR DI DASAR LAUT</text>
        <path d="M566 172V186" stroke="#F5EFE6" stroke-opacity=".28" stroke-dasharray="3 4"/><text x="590" y="166" text-anchor="end">KABEL &#8594; GARDU &#8594; RUMAH</text>
      </g>
    </svg>
  </div>
  <div class="hero-copy">
      <span class="status-pill"><i></i>Ecosystem-aware Wave Energy</span>
      <h1>Energi gelombang,<br>tanpa mengorbankan<br><span class="hl">ekosistem.</span></h1>
      <span class="hero-bigword" aria-hidden="true">WAVE</span>
      <p class="lead">ECO-WAVE (<i>Ecosystem-aware Wave Energy</i>): peta interaktif zona PLTGL ramah ekosistem di pesisir selatan Banten. Penapisan awal untuk potensi gelombang, sensitivitas ekosistem, dan estimasi rumah terlayani 450 / 900 / 1300 VA dalam satu peta.</p>
      <button type="button" class="hero-cari" data-cari><i class="bi bi-search"></i><span>Cari kata kunci: mangrove, rumus daya, BMKG, Bayah…</span><kbd>/</kbd></button>
      <div class="btns"><a href="peta.php" class="btn">Mulai Eksplorasi Peta <i class="bi bi-arrow-up-right"></i></a><a href="kalkulator.php" class="btn2">Buka Kalkulator <i class="bi bi-plus-lg"></i></a></div>
      <p class="hero-tagline">Gelombang<i>/</i>Ekosistem<i>/</i>Energi<i>/</i>Pesisir</p>
      <p class="hero-url"><i class="bi bi-geo-alt"></i> Pesisir Selatan Banten &middot; CMEMS 2015&ndash;2024</p>
    </div>
  </div>
  <nav class="hero-rail" aria-label="Ringkasan data">
    <div><b><em id="rPuncak">Jul</em><small id="rPuncakP">39,1 kW/m</small></b><span>Gelombang puncak</span><a class="hr-go" href="kalkulator.php#k-sumber" title="Pola bulanan &amp; musiman CMEMS di Kalkulator"><svg class="hr-ic" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><u>Lihat pola musiman di Kalkulator</u></a></div>
    <div><b><em id="rTahun">10</em><small>CMEMS 2015&ndash;2024</small></b><span>Tahun data</span><a class="hr-go" href="tentang.php#sumber-data" title="Sumber &amp; keandalan data"><svg class="hr-ic" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><u>Lihat sumber data</u></a></div>
    <div><b><em id="rRumah">170</em><small id="rRumahP">1 unit &middot; 76,7 kW</small></b><span>Rumah 450 VA</span><a class="hr-go" href="kalkulator.php#k-energi" title="Hitung listrik &amp; rumah terlayani"><svg class="hr-ic" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><u>Hitung listrik &amp; rumah di Kalkulator</u></a></div>
  </nav>
</header>

<nav class="sub-nav" aria-label="Bagian halaman beranda">
  <a href="#langsung">Pantauan langsung</a><a href="#cara-kerja">Cara kerja</a><a href="#jelajahi">Jelajahi</a><a href="#ecowave">Metode ECO-WAVE</a><a href="#transparansi">Catatan data</a>
</nav>

<section class="sec" id="langsung" style="padding-top:56px;padding-bottom:8px">
  <div class="sec-head">
    <span class="sec-kicker"><span class="no">01</span><i class="live-dot"></i>Pantauan langsung</span>
    <h2>Terhubung dengan Peta &amp; Kalkulator</h2>
    <p>Angka di bawah ini dibaca dari sumber yang sama dengan halaman lain: bobot MCA, parameter perangkat, dan analisis terakhir ikut berubah seketika bila Anda mengubahnya di Peta atau Kalkulator (juga lintas tab).</p>
  </div>
  <div class="live-win">
    <div class="lw-bar">
      <span class="lw-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="lw-nav" aria-hidden="true"><i class="bi bi-layout-sidebar"></i><i class="bi bi-chevron-left"></i><i class="bi bi-chevron-right"></i></span>
      <span class="lw-url" aria-hidden="true"><i class="bi bi-shield-fill-check"></i><b>ecowave.local</b><i class="bi bi-arrow-clockwise"></i></span>
      <span class="lw-act" aria-hidden="true"><i class="bi bi-download"></i><i class="bi bi-plus-lg"></i><i class="bi bi-copy"></i></span>
    </div>
    <div class="lw-body">
      <div class="live-grid">
    <article class="live-card" id="lvBmkg"><h3><i class="bi bi-broadcast"></i> Gelombang BMKG <span class="lv-stat" id="lvBmkgStat">memuat…</span></h3><div class="lv-body">Memuat prakiraan BMKG Maritim…</div></article>
      <article class="live-card" id="lvParam"><h3><i class="bi bi-sliders"></i> Parameter aktif <span class="lv-stat">bersama</span></h3><div class="lv-body"></div></article>
      <article class="live-card" id="lvTerakhir"><h3><i class="bi bi-crosshair"></i> Analisis terakhir <span class="lv-stat">Peta / Kalkulator</span></h3><div class="lv-body"></div></article>
      <article class="live-card" id="lvTop"><h3><i class="bi bi-trophy"></i> Peringkat kandidat <span class="lv-stat ok">DATA NYATA</span></h3><div class="lv-body"></div></article>
      </div>
    </div>
  </div>
</section>

<section class="kpi-bawah" id="kpi"></section>

<div class="catatan-awal" role="note"><div><i class="bi bi-info-circle"></i><span><b>Penapisan awal, bukan studi kelayakan.</b> Angka di halaman ini membantu membandingkan lokasi. Bobot dan ambang skor adalah asumsi tim yang belum divalidasi, dan sebagian data masih berstatus acuan atau simulasi. Rinciannya ada di <a href="tentang.php#sumber-data">Tentang Data</a>.</span></div></div>

<section class="sec" id="cara-kerja">
  <div class="sec-head">
    <span class="sec-kicker"><span class="no">02</span>Cara Kerja</span>
    <h2>Dari gelombang laut menjadi listrik</h2>
    <p>Empat langkah penapisan awal: ukur gelombang, hitung daya, ubah jadi listrik, lalu perkirakan rumah yang terlayani.</p>
  </div>
  <div class="alur">
    <article class="alur-step"><span class="no">01</span>
      <div class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2 9c2.5-3 4.5-3 7 0s4.5 3 7 0 3-2.5 6-1.5"/><path d="M2 14.5c2.5-3 4.5-3 7 0s4.5 3 7 0 3-2.5 6-1.5"/><path d="M2 20c2.5-3 4.5-3 7 0s4.5 3 7 0 3-2.5 6-1.5"/></svg></div>
      <h3>Gelombang Laut</h3><p>Tinggi (Hs) dan periode (Te) gelombang dari data CMEMS 2015-2024 di titik P0-P3.</p></article>
    <article class="alur-step"><span class="no">02</span>
      <div class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><path d="M6 20V10m4 10V4m4 16v-7m4 7V8"/></svg></div>
      <h3>Daya Gelombang</h3><p>Setiap titik dihitung dayanya per meter muka gelombang.</p><code>P = 0,49 x Hs² x Te</code></article>
    <article class="alur-step"><span class="no">03</span>
      <div class="ic"><svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/></svg></div>
      <h3>Listrik</h3><p>Lebar tangkap 10 m dan efisiensi 30% menghasilkan daya listrik per perangkat.</p><code id="aKode3">25,57 x 10 x 30% = 76,7 kW</code></article>
    <article class="alur-step"><span class="no">04</span>
      <div class="ic"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg></div>
      <h3>Rumah Terlayani</h3><p>Perkiraan jumlah rumah pada daya 450 / 900 / 1300 VA di tiap lokasi.</p><code id="aKode4">170 / 85 / 59 rumah (P0)</code></article>
  </div>
</section>



<section class="sec" id="jelajahi" style="padding-bottom:24px">
  <div class="sec-head">
    <span class="sec-kicker"><span class="no">03</span>Jelajahi</span>
    <h2>Mulai dari mana?</h2>
  </div>
  <nav class="menu" aria-label="Menu cepat">
    <a href="peta.php"><u class="part">PART 01</u><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg><b>Peta Analisis</b><span>Klik peta untuk estimasi gelombang CMEMS (bulanan &amp; musiman), listrik, rumah terlayani, jarak desa, dan Final Score.</span><em>Buka peta →</em></a>
    <a href="kalkulator.php"><u class="part">PART 02</u><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg><b>Kalkulator</b><span>Hitung satu titik secara rinci, memakai data gelombang CMEMS atau BMKG.</span><em>Buka kalkulator →</em></a>
    <a href="terbaik.php"><u class="part">PART 03</u><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg><b>Lokasi Terbaik</b><span>Tiga lokasi dengan skor kelayakan tertinggi menurut bobot MCA.</span><em>Lihat ranking →</em></a>
    <a href="tentang.php"><u class="part">PART 04</u><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg><b>Tentang Data</b><span>Sumber data, rumus, asumsi, dan keterbatasan estimasi.</span><em>Baca metode →</em></a>
  </nav>
</section>
<section class="sec" id="ecowave" style="padding-bottom:24px">
  <div class="sec-head">
    <span class="sec-kicker"><span class="no">04</span>Metode ECO-WAVE</span>
    <h2>Zona PLTGL ramah ekosistem</h2>
    <p>Ecosystem-aware Wave Energy: daya gelombang CMEMS atau prakiraan BMKG digabung dengan data nyata mangrove, karang, lamun, konservasi, batimetri, gardu, dan jalur listrik dalam analisis MCDA. Empat indikator dinilai 1&ndash;5, lalu dijumlahkan menurut bobotnya.</p>
  </div>
  <div class="ind-grid" id="indGrid" aria-live="polite"></div>
  <div class="kelas-leg" id="kelasLeg" aria-label="Kelas kelayakan"></div>
  <p class="lv-note">Titik di dalam kawasan terlarang (buffer eksklusi) otomatis bernilai 0. Bobot adalah asumsi tim dan dapat diubah di Kalkulator.</p>
  <div class="cta-baris">
    <a class="utama" href="kalkulator.php"><i class="bi bi-calculator"></i> Kalkulator ECO-WAVE</a>
    <a href="peta.php"><i class="bi bi-layers"></i> Layer data PLTGL di Peta</a>
  </div>
  <p class="lv-note" style="margin-top:14px">Kalkulator: daya, listrik, rumah terlayani, dan skor MCDA per titik; sumber CMEMS, BMKG Maritim, atau manual. Peta: aktifkan layer ekosistem, batimetri, jaringan listrik, dan pelayaran, lalu hitung zona ECO-WAVE.</p>
</section>

<section class="sec" id="transparansi" style="padding-bottom:56px">
  <div class="sec-head">
    <span class="sec-kicker"><span class="no">05</span>Transparansi</span>
    <h2>Seberapa bisa angka ini dipercaya?</h2>
  </div>
  <div class="ringkas-akhir">
    <article><h3>Data nyata dan acuan</h3><p>Gelombang CMEMS 2015&ndash;2024, prakiraan BMKG Maritim, serta layer ekosistem dan batimetri. Sumber dan tahun tiap data dicatat di <a href="tentang.php#sumber-data">Tabel sumber</a>.</p></article>
    <article><h3>Asumsi dan simulasi</h3><p>Bobot 40:30:15:15, ambang skor, dan parameter perangkat adalah asumsi tim. Data desa berstatus Data Simulasi. Lihat <a href="tentang.php#literatur">Studi literatur</a>.</p></article>
    <article><h3>Cara memakai hasilnya</h3><p>Pakai untuk menyaring lokasi awal, lalu verifikasi di lapangan. Hasil analisis dapat diekspor ke PNG atau PDF dari Peta dan Kalkulator.</p></article>
  </div>
</section>
<script>
document.addEventListener('DOMContentLoaded',function(){
  var E=window.ECOWAVE;if(!E||!E.FAKTOR)return;
  var g=document.getElementById('indGrid'),l=document.getElementById('kelasLeg');
  if(g)g.innerHTML=E.FAKTOR.map(function(f){var p=Math.round(f.bobot*100);return '<article class="ind"><div class="bw"><h3>'+f.nama+'</h3><b>'+p+'%</b></div><div class="bar"><i style="width:'+p*2.2+'%"></i></div><p>'+(f.arti||'')+'</p></article>'}).join('');
  if(l)l.innerHTML=E.KELAS_LEGENDA.slice().reverse().map(function(k){return '<div><i style="background:'+k.warna+'"></i><b>'+k.nama+'</b>'+k.teks+'</div>'}).join('');
});
</script>
<link rel="stylesheet" href="assets/css/beranda-baru.css?v=<?= @filemtime(__DIR__.'/assets/css/beranda-baru.css') ?: 1 ?>">
<?php include __DIR__.'/includes/foot.php'; ?>
