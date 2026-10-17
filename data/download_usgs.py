"""Download the USGS snapshot used in the Pandas chapter.

Creates two CSV files next to this script:

- usgs_sites.csv            one row per gauging station (metadata)
- usgs_daily_discharge.csv  daily mean discharge, 2015-2024, one row per station and day

Values are kept in the original USGS units (ft³/s, mi², ft): converting them
is part of the lab. Requires `pip install dataretrieval==1.4.0`.
"""

from pathlib import Path

import pandas as pd
from dataretrieval import waterdata

HERE = Path(__file__).parent
START, END = "2015-01-01", "2024-12-31"

SITES = [
    "01646500",  # Potomac River near Washington, DC (humid east)
    "07010000",  # Mississippi River at St. Louis, MO (very large basin)
    "08158000",  # Colorado River at Austin, TX
    "08279500",  # Rio Grande at Embudo, NM (semi-arid, snowmelt)
    "09380000",  # Colorado River at Lees Ferry, AZ (below Glen Canyon Dam)
    "09506000",  # Verde River near Camp Verde, AZ (semi-arid, flashy)
    "11098000",  # Arroyo Seco near Pasadena, CA (Mediterranean, ephemeral)
    "11446500",  # American River at Fair Oaks, CA (Mediterranean, below Folsom Dam)
]
IDS = [f"USGS-{s}" for s in SITES]


def download_sites():
    meta, _ = waterdata.get_monitoring_locations(monitoring_location_id=IDS)
    lon_lat = meta["geometry"].apply(lambda p: (p.x, p.y) if hasattr(p, "x") else tuple(p))
    sites = pd.DataFrame({
        "site_no": meta["monitoring_location_number"],
        "station_name": meta["monitoring_location_name"],
        "state": meta["state_name"],
        "latitude": lon_lat.str[1].round(5),
        "longitude": lon_lat.str[0].round(5),
        "drainage_area_mi2": meta["drainage_area"],
        "altitude_ft": meta["altitude"],
    })
    return sites.sort_values("site_no")


def download_daily():
    frames = []
    for site_id in IDS:
        df, _ = waterdata.get_daily(
            monitoring_location_id=site_id,
            parameter_code="00060",  # discharge
            statistic_id="00003",    # daily mean
            time=f"{START}/{END}",
            skip_geometry=True,
        )
        assert (df["unit_of_measure"] == "ft^3/s").all()
        frames.append(df)
    df = pd.concat(frames)
    qualifier = df["qualifier"].apply(
        lambda q: ";".join(q) if isinstance(q, (list, tuple)) else ("" if q is None else str(q))
    )
    daily = pd.DataFrame({
        "site_no": df["monitoring_location_id"].str.removeprefix("USGS-"),
        "date": pd.to_datetime(df["time"]).dt.strftime("%Y-%m-%d"),
        "discharge_cfs": df["value"],
        "qualifier": qualifier,
    })
    return daily.sort_values(["site_no", "date"])


if __name__ == "__main__":
    download_sites().to_csv(HERE / "usgs_sites.csv", index=False)
    download_daily().to_csv(HERE / "usgs_daily_discharge.csv", index=False)
    print("Done.")
