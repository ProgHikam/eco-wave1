#!/usr/bin/env python3
"""ECO-WAVE - siapkan data PLTGL untuk web.
Membaca GeoJSON asli (01_raw/Data_PLTGL), memotong ke kotak studi, menyederhanakan
geometri (Douglas-Peucker) dan membulatkan koordinat, lalu menulis ke assets/data/pltgl/.
Data asli TIDAK diubah. Jalankan dari root proyek:  python scripts/prepare_pltgl.py [folder_raw]
"""
import json, os, sys, glob

RAW = sys.argv[1] if len(sys.argv) > 1 else '01_raw/Data_PLTGL'
OUT = 'assets/data/pltgl'
BBOX = (104.5, -8.0, 107.0, -6.0)      # W,S,E,N = kotak studi proyek (sama dengan batas klik peta)
os.makedirs(OUT, exist_ok=True)

def find(sub):
    # cocokkan nama BERKAS (bukan nama folder); sub boleh berisi beberapa alternatif dipisah '|'
    alt = [a.lower() for a in sub.split('|')]
    f = [p for p in sorted(glob.glob(os.path.join(RAW, '**', '*.geojson'), recursive=True))
         if any(a in os.path.basename(p).lower() for a in alt)]
    if not f: raise SystemExit('Berkas tidak ditemukan: ' + sub)
    return f[0]

def rdp(pts, eps):
    if len(pts) < 3: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True
    st = [(0, len(pts)-1)]
    while st:
        a, b = st.pop()
        (x1, y1), (x2, y2) = pts[a][:2], pts[b][:2]
        dx, dy = x2-x1, y2-y1; n = dx*dx+dy*dy; md = -1; mi = -1
        for i in range(a+1, b):
            x, y = pts[i][:2]
            if n == 0: d = ((x-x1)**2+(y-y1)**2)**.5
            else:
                t = max(0, min(1, ((x-x1)*dx+(y-y1)*dy)/n)); d = ((x-x1-t*dx)**2+(y-y1-t*dy)**2)**.5
            if d > md: md, mi = d, i
        if md > eps: keep[mi] = True; st += [(a, mi), (mi, b)]
    return [p for p, k in zip(pts, keep) if k]

def r5(p): return [round(p[0], 5), round(p[1], 5)]
def line(c, eps): return [r5(p) for p in rdp(c, eps)]
def ring(c, eps):
    s = rdp(c[:-1] if c[0] == c[-1] else c, eps)
    if len(s) < 3: return None
    s = [r5(p) for p in s]; return s + [s[0]]

def bb(c):
    xs = [p[0] for p in c]; ys = [p[1] for p in c]; return min(xs), min(ys), max(xs), max(ys)
def hit(b):
    return not (b[2] < BBOX[0] or b[0] > BBOX[2] or b[3] < BBOX[1] or b[1] > BBOX[3])

def flat(g):
    t = g['type']
    if t == 'GeometryCollection':
        for x in g['geometries']: yield from flat(x)
    elif t == 'MultiPolygon':
        for p in g['coordinates']: yield ('Polygon', p)
    elif t == 'MultiLineString':
        for l in g['coordinates']: yield ('LineString', l)
    else: yield (t, g['coordinates'])

def build(src, name, eps, keys=(), min_extent=0.0, merge_props=None):
    d = json.load(open(find(src), encoding='utf-8')); feats = []
    for f in d['features']:
        if not f.get('geometry'): continue
        pr = {k: f['properties'][k] for k in keys if f['properties'].get(k) not in (None, '')}
        if merge_props: pr.update(merge_props)
        for t, c in flat(f['geometry']):
            if t == 'Polygon':
                rs = [ring(r, eps) for r in c]
                if not rs[0]: continue
                b = bb(rs[0])
                if not hit(b) or max(b[2]-b[0], b[3]-b[1]) < min_extent: continue
                feats.append({'type': 'Feature', 'properties': pr, 'geometry': {'type': 'Polygon', 'coordinates': [r for r in rs if r]}})
            elif t == 'LineString':
                if len(c) < 2: continue
                s = line(c, eps)
                if not hit(bb(s)) or len(s) < 2: continue
                if max(bb(s)[2]-bb(s)[0], bb(s)[3]-bb(s)[1]) < min_extent: continue
                feats.append({'type': 'Feature', 'properties': pr, 'geometry': {'type': 'LineString', 'coordinates': s}})
            elif t == 'Point':
                if hit((c[0], c[1], c[0], c[1])):
                    feats.append({'type': 'Feature', 'properties': pr, 'geometry': {'type': 'Point', 'coordinates': r5(c)}})
    return save(name, feats)

def save(name, feats):
    p = os.path.join(OUT, name + '.geojson')
    json.dump({'type': 'FeatureCollection', 'features': feats}, open(p, 'w', encoding='utf-8'), separators=(',', ':'), ensure_ascii=False)
    kb = os.path.getsize(p)/1024
    print(f'{name:16s} {len(feats):5d} fitur  {kb:8.1f} KB'); return {'file': name+'.geojson', 'fitur': len(feats), 'kb': round(kb, 1)}

def centroid_pts(src, name):
    d = json.load(open(find(src), encoding='utf-8')); feats = []
    for f in d['features']:
        g = f['geometry']; pr = {k: f['properties'].get(k) for k in ('name', 'operator', 'voltage', 'power') if f['properties'].get(k)}
        if g['type'] == 'Point': c = g['coordinates']
        else:
            r = g['coordinates'][0] if g['type'] == 'Polygon' else g['coordinates'][0][0]
            c = [sum(p[0] for p in r)/len(r), sum(p[1] for p in r)/len(r)]
        if hit((c[0], c[1], c[0], c[1])): feats.append({'type': 'Feature', 'properties': pr, 'geometry': {'type': 'Point', 'coordinates': r5(c)}})
    return save(name, feats)

man = {}
man['mangrove']   = build('hasil_data_mangrove', 'mangrove', 0.00008, ('nama',))
man['karang']     = build('karang_banten', 'karang', 0.00006, ('class',), 0.00015)
man['lamun']      = build('lamun_banten', 'lamun', 0.00006, ('class',), 0.00015)
man['reef']       = build('reef_extent', 'reef', 0.0001, ('class',))
man['konservasi'] = build('kawasan_konservasi', 'konservasi', 0.0002, ('nama',), 0.0008)
man['batimetri']  = build('batimetri_banten', 'batimetri', 0.0003, ('class_id', 'depth_range'))
man['perairan5km']= build('perairan', 'perairan5km', 0.0004, ('nama',))
man['pelabuhan']  = build('pelabuhan', 'pelabuhan', 0, ('name', 'amenity'))
man['gardu']      = centroid_pts('gardu', 'gardu')
man['jalur_listrik']   = build('jalurlistrik|jalur listrik', 'jalur_listrik', 0.0003, ('voltage', 'name', 'operator'))
man['jalur_pelayaran'] = build('jalurkapal|jalur pelayaran', 'jalur_pelayaran', 0.0005, ('name', 'operator', 'route'))
json.dump({'bbox_studi': BBOX, 'sumber': RAW, 'catatan': 'Disederhanakan untuk web; berkas asli ada di 01_raw/Data_PLTGL.', 'layer': man},
          open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---- raster batimetri ETOPO1 (GeoTIFF) -> JSON ringkas untuk pencarian kedalaman di browser
try:
    from PIL import Image
    import numpy as np
    tif = find_tif = [p for p in glob.glob(os.path.join(RAW, '**', '*.tif'), recursive=True)]
    if tif:
        im = Image.open(tif[0]); a = np.array(im).astype(int)
        sx, sy, _ = im.tag_v2[33550]; tp = im.tag_v2[33922]
        out = {'sumber': os.path.basename(tif[0]), 'x0': tp[3], 'y0': tp[4], 'dx': sx, 'dy': sy, 'nx': a.shape[1], 'ny': a.shape[0],
               'catatan': 'ETOPO1 ~1 menit busur (~1,85 km); meter, negatif = di bawah permukaan laut; baris dari utara ke selatan; pusat sel = pojok + 0,5 sel',
               'z': a.flatten().tolist()}
        json.dump(out, open(os.path.join(OUT, 'batimetri_grid.json'), 'w'), separators=(',', ':'))
        print('batimetri_grid   %dx%d  %.1f KB' % (a.shape[1], a.shape[0], os.path.getsize(os.path.join(OUT, 'batimetri_grid.json'))/1024))
except Exception as e:
    print('Raster batimetri dilewati:', e)
