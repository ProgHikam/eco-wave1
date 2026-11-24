#!/usr/bin/env python3
"""
Ubah NetCDF gelombang (ERA5 atau CMEMS) menjadi CSV ringkas untuk menu "Impor Data Gelombang" di admin.php.

Untuk tiap titik yang diminta, dipilih sel grid TERDEKAT, lalu dihitung dari seluruh deret waktu:
  P = 0,49 * Hs^2 * Te (kW/m); rata-rata (p), median (med), P90 = persentil ke-10 (nilai yang dilampaui 90% waktu),
  maks, CV = simpangan baku / rata-rata, serta rata-rata Hs dan Te.

Variabel dikenali otomatis:
  Hs : VHM0 (CMEMS), swh (ERA5)
  Te : VTM10 (CMEMS, periode energi) -> dipakai langsung
       pp1d / VTPK (periode puncak)  -> Te = --te-factor * Tp (asumsi proyek, default 0,9; BUKAN pengukuran)
Sel yang seluruhnya NaN (daratan pada grid kasar) dilewati dengan peringatan.

Contoh:
  python scripts/nc_ke_titik.py 01_raw/era5_wave/*.nc --sumber ERA5 \
      --titik "P4 Cikeusik,-7.40,105.50" --titik "-7.35,106.00" --keluar 02_processed/titik_era5.csv
  (titik tanpa nama diberi nama otomatis di halaman admin)

Catatan: skrip ini ditulis tanpa bisa dijalankan terhadap berkas NetCDF asli di lingkungan pengembangan; periksa
hasil CSV (kolom sel_lat/sel_lng dan jarak_km) sebelum diimpor.
"""
from __future__ import annotations
import argparse
import csv
import glob
import math
import sys

HS_CANDIDATES = ("VHM0", "swh", "significant_height_of_combined_wind_waves_and_swell")
TE_CANDIDATES = ("VTM10",)
TP_CANDIDATES = ("pp1d", "VTPK", "peak_wave_period")
LAT_NAMES = ("latitude", "lat")
LON_NAMES = ("longitude", "lon")
TIME_NAMES = ("valid_time", "time", "forecast_time")


def ringkas(hs, te):
    """hs, te: array numpy 1-D (sudah sejajar waktu). Mengembalikan dict statistik, atau None bila tak ada data valid."""
    import numpy as np
    hs = np.asarray(hs, dtype=float)
    te = np.asarray(te, dtype=float)
    ok = np.isfinite(hs) & np.isfinite(te) & (hs >= 0) & (te > 0)
    if not ok.any():
        return None
    hs, te = hs[ok], te[ok]
    p = 0.49 * hs ** 2 * te
    m = float(p.mean())
    return {
        "p": m, "med": float(np.percentile(p, 50)), "p90": float(np.percentile(p, 10)), "maks": float(p.max()),
        "cv": float(p.std() / m) if m > 0 else None, "hs": float(hs.mean()), "te": float(te.mean()), "n": int(ok.sum()),
    }


def jarak_km(lat1, lon1, lat2, lon2):
    r = math.pi / 180
    a = math.sin((lat2 - lat1) * r / 2) ** 2 + math.cos(lat1 * r) * math.cos(lat2 * r) * math.sin((lon2 - lon1) * r / 2) ** 2
    return 12742 * math.asin(math.sqrt(a))


def pilih(names, kandidat):
    for k in kandidat:
        if k in names:
            return k
    return None


def parse_titik(teks):
    bagian = [x.strip() for x in teks.split(",")]
    try:
        if len(bagian) == 2:
            return "", float(bagian[0]), float(bagian[1])
        if len(bagian) == 3:
            return bagian[0], float(bagian[1]), float(bagian[2])
    except ValueError:
        pass
    raise SystemExit(f'Format --titik salah: "{teks}". Pakai "lat,lng" atau "nama,lat,lng".')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", nargs="+", help="Berkas .nc (boleh pola glob)")
    ap.add_argument("--titik", action="append", required=True, help='"lat,lng" atau "nama,lat,lng" (boleh diulang)')
    ap.add_argument("--sumber", default="Lainnya", choices=["CMEMS", "ERA5", "BMKG", "Windy", "Pengukuran", "Lainnya"])
    ap.add_argument("--te-factor", type=float, default=0.9, help="Te = faktor * Tp bila hanya ada periode puncak (default 0.9)")
    ap.add_argument("--keluar", default="titik_gelombang.csv")
    ap.add_argument("--maks-jarak-km", type=float, default=60.0, help="Peringatkan bila sel terdekat lebih jauh dari ini")
    args = ap.parse_args()

    try:
        import numpy as np  # noqa: F401
        import xarray as xr
    except ImportError:
        raise SystemExit("Pasang dulu: pip install xarray netCDF4 numpy")

    berkas = sorted({f for pola in args.input for f in (glob.glob(pola) or [pola])})
    if not berkas:
        raise SystemExit("Tidak ada berkas input.")
    ds = xr.open_mfdataset(berkas, combine="by_coords")
    try:
        hs_n = pilih(ds.data_vars, HS_CANDIDATES)
        te_n = pilih(ds.data_vars, TE_CANDIDATES)
        tp_n = None if te_n else pilih(ds.data_vars, TP_CANDIDATES)
        lat_n, lon_n, t_n = pilih(ds.coords, LAT_NAMES), pilih(ds.coords, LON_NAMES), pilih(list(ds.dims) + list(ds.coords), TIME_NAMES)
        if not hs_n or not (te_n or tp_n) or not lat_n or not lon_n or not t_n:
            raise SystemExit(f"Variabel tidak dikenali. Variabel: {list(ds.data_vars)}; koordinat: {list(ds.coords)}. "
                             "Perlu Hs (VHM0/swh), periode (VTM10 atau pp1d/VTPK), latitude/longitude, dan waktu.")
        if tp_n:
            print(f"PERINGATAN: hanya ada periode puncak ({tp_n}). Te = {args.te_factor} x Tp (asumsi, bukan pengukuran).", file=sys.stderr)
        baris = []
        for teks in args.titik:
            nama, lat, lng = parse_titik(teks)
            sel = ds.sel({lat_n: lat, lon_n: lng}, method="nearest")
            slat, slng = float(sel[lat_n]), float(sel[lon_n])
            jr = jarak_km(lat, lng, slat, slng)

            def seri(var):
                da = sel[var]
                for d in list(da.dims):          # buang dimensi selain waktu (mis. 'number', 'expver')
                    if d != t_n:
                        da = da.isel({d: 0})
                return da.values.astype(float)

            hs = seri(hs_n)
            te = seri(te_n) if te_n else args.te_factor * seri(tp_n)
            r = ringkas(hs, te)
            if r is None:
                print(f"LEWATI ({lat},{lng}): sel terdekat ({slat:.3f},{slng:.3f}) tanpa data valid (kemungkinan daratan di grid ini).", file=sys.stderr)
                continue
            if jr > args.maks_jarak_km:
                print(f"PERINGATAN ({lat},{lng}): sel terdekat berjarak {jr:.0f} km.", file=sys.stderr)
            baris.append({"nama": nama, "lat": lat, "lng": lng, "p": round(r["p"], 2), "med": round(r["med"], 2), "p90": round(r["p90"], 2),
                          "maks": round(r["maks"], 2), "cv": None if r["cv"] is None else round(r["cv"], 2), "hs": round(r["hs"], 2), "te": round(r["te"], 2),
                          "sumber": args.sumber, "sel_lat": round(slat, 4), "sel_lng": round(slng, 4), "jarak_km": round(jr, 1), "langkah_waktu": r["n"]})
        if not baris:
            raise SystemExit("Tidak ada titik yang menghasilkan data.")
        kolom = ["nama", "lat", "lng", "p", "med", "p90", "maks", "cv", "hs", "te", "sumber", "sel_lat", "sel_lng", "jarak_km", "langkah_waktu"]
        with open(args.keluar, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=kolom)
            w.writeheader()
            w.writerows(baris)
        print(f"Selesai: {len(baris)} titik -> {args.keluar}")
    finally:
        ds.close()


if __name__ == "__main__":
    main()
