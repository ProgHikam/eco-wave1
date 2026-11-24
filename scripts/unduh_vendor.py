#!/usr/bin/env python3
"""Unduh pustaka pihak ketiga ke assets/vendor/ agar situs jalan tanpa CDN. Jalankan sekali dengan internet:
    python scripts/unduh_vendor.py
includes/head.php otomatis memakai salinan lokal bila berkasnya ada."""
import os, urllib.request
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'vendor')
LEAF = 'https://unpkg.com/leaflet@1.9.4/dist/'
ICON = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/'
B = [
  (LEAF + 'leaflet.css', 'leaflet/leaflet.css'), (LEAF + 'leaflet.js', 'leaflet/leaflet.js'),
  *[(LEAF + 'images/' + f, 'leaflet/images/' + f) for f in ('marker-icon.png', 'marker-icon-2x.png', 'marker-shadow.png', 'layers.png', 'layers-2x.png')],
  ('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js', 'chart.umd.min.js'),
  ('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', 'html2canvas.min.js'),
  (ICON + 'bootstrap-icons.min.css', 'bootstrap-icons/bootstrap-icons.min.css'),
  (ICON + 'fonts/bootstrap-icons.woff2', 'bootstrap-icons/fonts/bootstrap-icons.woff2'),
  (ICON + 'fonts/bootstrap-icons.woff', 'bootstrap-icons/fonts/bootstrap-icons.woff'),
]
for url, rel in B:
    dst = os.path.join(R, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
    urllib.request.urlretrieve(url, dst); print('ok', rel)
print('Selesai. Font Google dan tile peta tetap memerlukan internet.')
