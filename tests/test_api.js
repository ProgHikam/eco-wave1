// Uji API & PHP: sintaks semua berkas PHP + perilaku endpoint tanpa database (galat harus rapi, berupa JSON).
const {execSync,spawn}=require('child_process');const fs=require('fs');const path=require('path');const http=require('http');
const root=path.join(__dirname,'..');let gagal=0;const ok=(c,m)=>{if(!c){gagal++;console.log('GAGAL:',m)}};
function php(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);
  return e.isDirectory()?(['arsip','node_modules','tests','_versi_lama'].includes(e.name)?[]:php(p)):(p.endsWith('.php')?[p]:[])})}
const files=php(root);files.forEach(f=>{try{execSync('php -l '+JSON.stringify(f),{stdio:'pipe'})}catch(e){ok(false,'sintaks PHP: '+f)}});
const port=18000+Math.floor(Math.random()*1000);
const srv=spawn('php',['-S','127.0.0.1:'+port,'-t',root],{stdio:'ignore'});
const get=(u,m='GET')=>new Promise(r=>{const q=http.request({host:'127.0.0.1',port,path:u,method:m},s=>{let b='';s.on('data',d=>b+=d);s.on('end',()=>r({c:s.statusCode,t:s.headers['content-type']||'',b}))});q.on('error',()=>r({c:0,t:'',b:''}));q.end()});
(async()=>{await new Promise(r=>setTimeout(r,900));
 const kasus=[['/api/get_location.php',400],['/api/get_location.php?lat=abc&lng=1',400],['/api/windy.php',400],['/api/locations.php',405],['/api/auth.php',400]];
 for(const [u,kode] of kasus){const r=await get(u);ok(r.c===kode,u+' harus '+kode+', dapat '+r.c);ok(/json/.test(r.t),u+' harus JSON');
   try{ok(!!JSON.parse(r.b).error,u+' harus memuat "error"')}catch(e){ok(false,u+' bukan JSON valid')}}
 for(const u of ['/api/get_weights.php','/api/referensi.php','/api/calculate.php','/api/bmkg.php']){const r=await get(u);
   ok(r.c>=400&&r.c<600,u+' tanpa DB/jaringan harus galat terkendali, dapat '+r.c);ok(!/Fatal error|Stack trace|Warning:/.test(r.b),u+' membocorkan galat PHP')}
 for(const p of ['index.php','peta.php','kalkulator.php','terbaik.php','hasil.php','teknologi.php','tentang.php']){const r=await get('/'+p);
   ok(r.c===200,p+' harus 200, dapat '+r.c);ok(!/Fatal error|Parse error|Warning:|Notice:/.test(r.b),p+' memuat pesan galat PHP')}
 const fx=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/bmkg_contoh.json'),'utf8'));ok(fx&&typeof fx==='object','fixture BMKG valid');
 {const r=await get('/celah.php');ok(r.c===302,'celah.php harus dialihkan (khusus admin), dapat '+r.c)}
 srv.kill();console.log(gagal?gagal+' kegagalan uji API':'OK: uji API/PHP lolos ('+files.length+' berkas PHP, sintaks bersih)');process.exit(gagal?1:0)})();
