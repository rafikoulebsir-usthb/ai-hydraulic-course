---
sidebar_position: 2
title: Lab
---

import NotebookLinks from '@site/src/components/NotebookLinks';

# Pandas — Lab

*Week 2*

<NotebookLinks notebook="part-1-data-manipulation/02-pandas" />

Open the **Exercises** notebook in Colab (or download it and run it locally), replace every `...` with your code, and compare your results with the ✅ **Check** values given at the end of each exercise. The notebook reads its two data files directly from the course repository, so you need an internet connection.

## The data

This lab uses **real measurements**: ten years (2015–2024) of daily mean discharge at eight gauging stations of the [U.S. Geological Survey](https://waterdata.usgs.gov/) (USGS). They were chosen to cover very different climates and river sizes:

| Station | River | Climate / particularity |
|---|---|---|
| 01646500 | Potomac near Washington, DC | humid east |
| 07010000 | Mississippi at St. Louis, MO | very large basin (1.8 million km²) |
| 08158000 | Colorado at Austin, TX | semi-arid, regulated by reservoirs |
| 08279500 | Rio Grande at Embudo, NM | semi-arid, snowmelt |
| 09380000 | Colorado at Lees Ferry, AZ | just below Glen Canyon Dam |
| 09506000 | Verde near Camp Verde, AZ | semi-arid, flash floods |
| 11098000 | Arroyo Seco near Pasadena, CA | Mediterranean, small and ephemeral (41 km²) |
| 11446500 | American at Fair Oaks, CA | Mediterranean, below Folsom Dam |

Two files are provided in the [`data/`](https://github.com/rafikoulebsir-usthb/ai-hydraulic-course/tree/main/data) folder of the repository:

- **`usgs_sites.csv`** — one row per station: `site_no`, `station_name`, `state`, `latitude`, `longitude`, `drainage_area_mi2`, `altitude_ft`.
- **`usgs_daily_discharge.csv`** — 29 223 rows, one per station and day: `site_no`, `date`, `discharge_cfs` (ft³/s) and `qualifier` (USGS quality flags such as `ESTIMATED`).

The values are kept in the original US units: converting them is part of the lab. The files are a snapshot downloaded with the script [`data/download_usgs.py`](https://github.com/rafikoulebsir-usthb/ai-hydraulic-course/blob/main/data/download_usgs.py), which uses the [`dataretrieval`](https://github.com/DOI-USGS/dataretrieval-python) package. You can adapt it to download other stations. USGS data are in the public domain.

## Exercises

| # | Exercise | Pandas skills | Lecture sections |
|---|---|---|---|
| 1 | The station table | `read_csv`, `dtype`, new columns, `set_index`, `idxmax`, `value_counts` | §3, §4, §5, §6 |
| 2 | The daily discharge record | `parse_dates`, `.dt`, counting records, finding a missing date | §4, §6 |
| 3 | Data quality flags | `fillna`, `.str.contains`, masking with `.loc`, NaN-aware statistics | §6, §8 |
| 4 | Selecting floods and dry days | boolean filtering, `nlargest`, combining tables by index | §5, §7 |
| 5 | Statistics per station | `groupby`, named aggregation, `unstack`, flow regimes | §9 |
| 6 | Comparing catchments | `merge`, specific discharge, runoff depth, `to_csv` | §4, §6, §10 |
| Bonus | Do neighbouring rivers flood together? | `pivot`, `corr`, `stack` | §10 |

### 1. The station table

Load the station metadata, see what happens to the station codes when you forget `dtype=str`, convert the drainage areas and altitudes to SI units, and answer a few questions about the stations.

### 2. The daily discharge record

Load the 29 223 daily values, convert ft³/s to m³/s, check that every station has a complete record, and find the one missing day.

### 3. Data quality flags

Explore the USGS qualifiers, flag the estimated values, replace them by `NaN` and see how pandas statistics silently skip missing values.

### 4. Selecting floods and dry days

Find the largest floods of the American River, count the zero-flow days of the ephemeral Arroyo Seco during the 2021–2022 drought, and compare all rivers on the day of the Mississippi's highest flow.

### 5. Statistics per station

Compute per-station statistics and the coefficient of variation to rank the rivers from most regular (a river below a large dam) to most irregular (a flashy semi-arid river). Then build annual and monthly tables and relate the **flow regimes** to the climate: snowmelt, Mediterranean winter rains.

### 6. Comparing catchments

Merge the statistics with the station table and compute the specific discharge, the runoff depth and the specific peak, the quantities hydrologists use to compare catchments of very different sizes. Save the summary to a CSV file.

### Bonus: correlation between rivers

Reshape the record to one column per station and compute the correlation matrix. Is a high correlation a sign of shared storms, or just of a shared seasonal cycle?
