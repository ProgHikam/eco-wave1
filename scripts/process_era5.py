#!/usr/bin/env python3
"""
Pengolahan ERA5 gelombang untuk ECO-WAVE / PLTGL Banten Selatan.

Input: NetCDF ERA5 dengan Hs (swh atau significant_height_of_combined_wind_waves_and_swell)
dan Tp (pp1d atau peak_wave_period).
Output: raster mean tahunan + DJF/MAM/JJA/SON dan CSV per sel grid.

Penting:
- Te = 0.9 * Tp adalah asumsi proyek, bukan pengukuran langsung ERA5.
- P = 0.49 * Hs**2 * Te menghasilkan kW/m (daya gelombang per satuan lebar).
- Raster mempertahankan resolusi sumber. Reproject/resample bukan peningkatan akurasi.
"""
from __future__ import annotations
import argparse
from pathlib import Path
import warnings
import numpy as np
import pandas as pd
import xarray as xr

HS_CANDIDATES = ("swh", "significant_height_of_combined_wind_waves_and_swell", "VHM0")
TP_CANDIDATES = ("pp1d", "peak_wave_period", "VTPK")
TIME_CANDIDATES = ("valid_time", "time", "forecast_time")
SEASONS = ("DJF", "MAM", "JJA", "SON")

def find_name(names, candidates, what):
    for name in candidates:
        if name in names:
            return name
    raise KeyError(f"Variabel/dimensi {what} tidak ditemukan. Tersedia: {list(names)}")

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input", default="01_raw/era5_wave/*.nc", help="Glob file NetCDF")
    ap.add_argument("--output", default="02_processed", help="Folder output")
    ap.add_argument("--hs", default=None, help="Nama variabel Hs jika autodeteksi gagal")
    ap.add_argument("--tp", default=None, help="Nama variabel Tp jika autodeteksi gagal")
    ap.add_argument("--time", default=None, help="Nama dimensi waktu jika autodeteksi gagal")
    ap.add_argument("--te-factor", type=float, default=0.9, help="Faktor asumsi Te/Tp (default 0.9)")
    ap.add_argument("--chunks", default=None, help="Opsional, mis. time:24")
    args = ap.parse_args()

    files = sorted(Path(".").glob(args.input))
    if not files:
        raise SystemExit(f"Tidak ada file input: {args.input}")
    outdir = Path(args.output); outdir.mkdir(parents=True, exist_ok=True)

    ds = xr.open_mfdataset([str(p) for p in files], combine="by_coords")
    try:
        hs_name = args.hs or find_name(ds.data_vars, HS_CANDIDATES, "Hs")
        tp_name = args.tp or find_name(ds.data_vars, TP_CANDIDATES, "Tp")
        time_name = args.time or find_name(ds.dims, TIME_CANDIDATES, "waktu")
        hs, tp = xr.align(ds[hs_name], ds[tp_name], join="inner")
        hs = hs.where(hs >= 0)
        tp = tp.where(tp > 0)
        te = args.te_factor * tp
        power = (0.49 * hs ** 2 * te).rename("wave_power_kw_m")
        power.attrs.update(units="kW m-1", long_name="Wave power per unit crest length",
                           formula="0.49 * Hs^2 * Te", te_assumption=f"Te = {args.te_factor} * Tp")
        # Hilangkan nilai yang tidak valid, kemudian statistik klimatologi.
        power = power.where(np.isfinite(power))
        annual = power.mean(time_name, skipna=True)
        annual.attrs.update(power.attrs)
        annual_path = outdir / "P_annual.tif"
        write_raster(annual, annual_path)

        seasonal = power.groupby(f"{time_name}.season").mean(time_name, skipna=True)
        for season in SEASONS:
            if "season" in seasonal.dims and season in seasonal["season"].values:
                layer = seasonal.sel(season=season, drop=True)
                layer.attrs.update(power.attrs)
                write_raster(layer, outdir / f"P_{season}.tif")

        # Ringkasan per sel; koordinat lon/lat dipertahankan untuk CSV.
        lat_name = next((n for n in ("latitude", "lat") if n in annual.coords), None)
        lon_name = next((n for n in ("longitude", "lon") if n in annual.coords), None)
        if not lat_name or not lon_name:
            raise KeyError(f"Koordinat lat/lon tidak ditemukan: {list(annual.coords)}")
        frame = annual.to_dataframe(name="P_annual_kw_m").reset_index()
        frame = frame.rename(columns={lat_name: "latitude", lon_name: "longitude"})
        frame.to_csv(outdir / "P_per_grid.csv", index=False)

        # Simpan metadata agar asumsi dan sumber tidak hilang saat data dipindahkan.
        metadata = pd.DataFrame([{
            "input_files": ";".join(p.name for p in files),
            "Hs_variable": hs_name, "Tp_variable": tp_name, "time_dimension": time_name,
            "Te_factor_assumption": args.te_factor,
            "formula": "P(kW/m)=0.49*Hs(m)^2*Te(s)",
            "annual_raster": str(annual_path),
            "note": "ERA5 grid; bukan pengukuran lapangan dan bukan daya listrik terbangkit"
        }])
        metadata.to_csv(outdir / "processing_metadata.csv", index=False)
        print(f"Selesai. Output ada di {outdir.resolve()}")
    finally:
        ds.close()

def write_raster(da, path):
    try:
        import rioxarray  # noqa: F401
    except ImportError as exc:
        raise SystemExit("Pasang rioxarray dan rasterio: pip install rioxarray rasterio") from exc
    # ERA5 umumnya memakai latitude/longitude; rioxarray perlu spatial dims.
    lat = next((n for n in ("latitude", "lat") if n in da.dims), None)
    lon = next((n for n in ("longitude", "lon") if n in da.dims), None)
    if not lat or not lon:
        raise ValueError(f"Dimensi spasial tidak dikenali: {da.dims}")
    da = da.rio.set_spatial_dims(x_dim=lon, y_dim=lat, inplace=False)
    da = da.rio.write_crs("EPSG:4326", inplace=False)
    da.rio.to_raster(path, compress="LZW")

if __name__ == "__main__":
    main()
