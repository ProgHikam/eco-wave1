#!/usr/bin/env python3
"""Bangun assets/data/cari_indeks.json untuk pencarian kata kunci ECO-WAVE.

Membaca teks semua halaman (index, peta, kalkulator, terbaik, tentang_web, tentang, teknologi),
memotongnya per bagian bertanda id (section / judul / blok k-*), lalu menambah entri fitur, lokasi/desa, dan layer data.
Jalankan ulang setiap kali isi halaman berubah:  python3 scripts/bangun_indeks_cari.py
"""
import html, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HALAMAN = ['index', 'peta', 'kalkulator', 'terbaik', 'tentang_web', 'tentang', 'teknologi']
NAMA = {'index': 'Beranda', 'peta': 'Peta', 'kalkulator': 'Kalkulator', 'terbaik': 'Lokasi Terbaik',
        'tentang_web': 'Tentang Web', 'tentang': 'Tentang Data', 'teknologi': 'Teknologi & Metode'}
LITERAL = re.compile(r"'((?:[^'\\]|\\.)*)'")
MAKS_TEKS = 9000


def bersih(teks):
    teks = re.sub(r'<[^>]+>', ' ', teks)
    teks = html.unescape(teks)
    return re.sub(r'\s+', ' ', teks).strip()


def blok_php(m):
    """Blok PHP pendek dibuang; blok panjang (larik teks, mis. tabel) dipertahankan sebagai kumpulan string."""
    isi = m.group(1)
    if len(isi) < 120:
        # judul halaman ($title='...') tetap berguna sebagai teks
        t = re.search(r"\$title\s*=\s*'([^']+)'", isi)
        return ' ' + t.group(1) + ' ' if t else ' '
    out = []
    for s in LITERAL.findall(isi):
        s = s.replace("\\'", "'").replace('\\\\', '\\')
        if len(s) >= 2 and re.search(r'[A-Za-z]{2}|\d', s) and not re.search(r'[$]|=>|::|\{|\}|^/|^[a-z_]+\.php|^(?:bi|info|ek)[ -]', s):
            out.append(s)
    return ' <p> ' + ' </p><p> '.join(out) + ' </p> '


def baca_halaman(nama):
    s = open(os.path.join(ROOT, nama + '.php'), encoding='utf-8').read()
    s = re.sub(r'<!--.*?-->', ' ', s, flags=re.S)
    s = re.sub(r'<style\b.*?</style>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<script\b.*?</script>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<\?(?:php|=)(.*?)\?>', blok_php, s, flags=re.S)
    return s


ANCHOR = re.compile(r'<(section|article|div|h[1-4])\b[^>]*?\bid="([A-Za-z][\w-]*)"[^>]*>', re.I)


def potong(nama, s):
    """Potong HTML menjadi bagian per anchor. Anchor yang dipakai: section, judul berid, dan blok k-* (kalkulator)."""
    titik = []
    for m in ANCHOR.finditer(s):
        tag, aid = m.group(1).lower(), m.group(2)
        if tag == 'section' or tag.startswith('h') or aid.startswith('k-'):
            titik.append((m.start(), aid))
    bagian = []
    awal = 0
    anchor = ''
    batas = [(0, '')] + titik + [(len(s), None)]
    for i in range(len(batas) - 1):
        a, aid = batas[i]
        b = batas[i + 1][0]
        html_b = s[a:b]
        teks = bersih(html_b)
        if len(teks) < 40:
            continue
        judul = ''
        h = re.search(r'<h[1-4][^>]*>(.*?)</h[1-4]>', html_b, flags=re.S | re.I)
        if h:
            judul = bersih(h.group(1))
            judul = re.sub(r'^\d+\s+', '', judul)  # buang nomor bagian "1 "
        if not judul:
            judul = aid.replace('-', ' ').replace('k ', '').strip().title() if aid else NAMA[nama]
        bagian.append({'p': nama + '.php', 'a': aid or '', 'pt': NAMA[nama], 't': judul[:110], 'x': teks[:MAKS_TEKS], 'j': 'Halaman'})
    return bagian


def fitur_dari_tentang_web(s):
    """Daftar fitur di tentang_web.php berbentuk ['Nama fitur','halaman.php#bagian']."""
    out = []
    for nama, tautan in re.findall(r"\['([^']{3,80})','([a-z_]+\.php(?:#[\w-]+)?)'\]", s):
        p, _, a = tautan.partition('#')
        out.append({'p': p, 'a': a, 'pt': NAMA.get(p[:-4], p), 't': nama, 'x': nama + '. Fitur ' + NAMA.get(p[:-4], p) + '.', 'j': 'Fitur'})
    return out


FITUR_PETA = [
    ('layer', 'Layer peta', 'Nyalakan atau matikan layer: mangrove, terumbu karang, lamun, konservasi, batimetri, gardu, jalur listrik, jalur pelayaran.'),
    ('mca', 'Bobot MCA', 'Atur bobot kriteria analisis multikriteria (MCA/MCDA): daya gelombang, jarak ekosistem, jaringan listrik, kedalaman.'),
    ('windy', 'Prakiraan Windy', 'Prakiraan gelombang jangka pendek dari Windy atau Open-Meteo untuk titik yang diklik.'),
    ('bmkg', 'BMKG Maritim', 'Prakiraan tinggi gelombang 4 hari per zona perairan dari BMKG Maritim.'),
    ('asumsi', 'Asumsi perangkat', 'Lebar tangkap, efisiensi, dan asumsi konversi daya gelombang menjadi listrik.'),
    ('info', 'Info peta', 'Keterangan legenda, sumber data, dan cara membaca peta.'),
]


def data_js():
    s = open(os.path.join(ROOT, 'assets/js/data.js'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r"\{nama:'([^']+)',\s*lat:(-?[\d.]+),\s*lng:(-?[\d.]+),\s*p:([\d.]+),\s*med:[\d.]+,\s*p90:[\d.]+,\s*maks:([\d.]+),.*?hs:([\d.]+),\s*te:([\d.]+)", s):
        n, lat, lng, p, mk, hs, te = m.groups()
        out.append({'p': 'peta.php', 'a': 'peta', 'pt': 'Peta', 't': 'Titik gelombang ' + n,
                    'x': f'Titik data gelombang CMEMS {n} ({lat}, {lng}). Daya rata-rata {p} kW/m, maksimum {mk} kW/m, Hs {hs} m, Te {te} s.', 'j': 'Lokasi'})
    for m in re.finditer(r"\{nama:'([^']+)',\s*lat:(-?[\d.]+),\s*lng:(-?[\d.]+),\s*kec:'([^']+)',\s*penduduk:(\d+)\}", s):
        n, lat, lng, kec, pend = m.groups()
        out.append({'p': 'peta.php', 'a': 'peta', 'pt': 'Peta', 't': 'Desa ' + n,
                    'x': f'Desa {n}, kecamatan {kec}. Penduduk sekitar {int(pend):,}'.replace(',', '.') + f' jiwa. Koordinat {lat}, {lng}. Dipakai untuk jarak ke desa terdekat (skor sosial).', 'j': 'Lokasi'})
    return out


def layer_data():
    mf = json.load(open(os.path.join(ROOT, 'assets/data/pltgl/manifest.json'), encoding='utf-8'))
    ket = {'mangrove': 'hutan mangrove', 'karang': 'terumbu karang', 'lamun': 'padang lamun', 'reef': 'terumbu (reef)',
           'konservasi': 'kawasan konservasi', 'batimetri': 'batimetri kedalaman laut', 'perairan5km': 'perairan 5 km dari pantai',
           'pelabuhan': 'pelabuhan', 'gardu': 'gardu listrik', 'jalur_listrik': 'jalur jaringan listrik', 'jalur_pelayaran': 'jalur pelayaran'}
    out = []
    for k, v in mf['layer'].items():
        kb = str(v['kb']).replace('.', ',')
        out.append({'p': 'tentang.php', 'a': 'katalog', 'pt': 'Tentang Data', 't': 'Layer ' + ket.get(k, k).capitalize(),
                    'x': f"Layer data PLTGL {ket.get(k, k)} ({v['file']}): {v['fitur']} fitur, {kb} KB.", 'j': 'Data'})
    return out


def main():
    indeks = []
    for nama in HALAMAN:
        s = baca_halaman(nama)
        indeks += potong(nama, s)
        if nama == 'tentang_web':
            indeks += fitur_dari_tentang_web(s)
    for a, t, x in FITUR_PETA:
        indeks.append({'p': 'peta.php', 'a': a, 'pt': 'Peta', 't': t, 'x': x, 'j': 'Fitur'})
    indeks.append({'p': 'index.php', 'a': '', 'pt': 'Beranda', 't': 'Mode aksesibilitas (disabilitas)', 'j': 'Fitur',
                   'x': 'Tombol ikon orang di navbar atau Alt+A: perbesar teks, kontras tinggi gelap/terang, skala abu-abu, font mudah dibaca disleksia, jarak baris dan huruf, garis bawah tautan, fokus keyboard, kursor besar, hentikan animasi dan video, baca nyaring.'})
    indeks.append({'p': 'tentang_web.php', 'a': 'fitur', 'pt': 'Tentang Web', 't': 'Pencarian kata kunci', 'j': 'Fitur',
                   'x': 'Tombol kaca pembesar di navbar, bilah cari di Beranda, Ctrl+K atau tombol /. Mencari di seluruh isi halaman, fitur, lokasi/desa, dan layer data; semua kata harus ada; huruf besar/kecil dan aksen diabaikan.'})
    indeks += data_js() + layer_data()
    # buang duplikat persis
    lihat, bersih_ = set(), []
    for e in indeks:
        k = (e['p'], e['a'], e['t'])
        if k in lihat:
            continue
        lihat.add(k)
        bersih_.append(e)
    tujuan = os.path.join(ROOT, 'assets/data/cari_indeks.json')
    json.dump(bersih_, open(tujuan, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{len(bersih_)} entri -> {os.path.relpath(tujuan, ROOT)} ({os.path.getsize(tujuan)//1024} KB)')


if __name__ == '__main__':
    main()
