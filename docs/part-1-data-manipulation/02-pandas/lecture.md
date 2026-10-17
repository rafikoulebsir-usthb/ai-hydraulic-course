---
sidebar_position: 1
title: Lecture
---

# Pandas — Lecture

*Week 2*

## Learning objectives

By the end of this chapter you will be able to:

- explain what pandas adds to NumPy: **labels**, **mixed column types** and **missing-value handling**;
- create `Series` and `DataFrame` objects and inspect them with `head`, `info`, `describe` and `value_counts`;
- read real measurement files with `read_csv`, including the options that matter (`dtype`, `parse_dates`, `na_values`, `sep`, `decimal`);
- select data by label (`.loc`), by position (`.iloc`) and with boolean conditions;
- add computed columns, such as unit conversions or specific discharge, without loops;
- detect, count, drop and fill **missing values**;
- summarize data with **groupby** (per station, per year) and reshape it with `pivot_table`, `unstack` and `melt`;
- combine tables with `merge` and `concat`.

## Key concepts

### 1. Why pandas?

NumPy arrays are perfect for **homogeneous numbers**: a vector of depths, a grid of discharges. Real hydraulic data looks different. A gauging record is a **table**: a station code (text), a date, a discharge (float), a quality flag (text), sometimes empty cells. You want to refer to columns by **name** (`"discharge"`), not by position (`[:, 2]`), and select stations by **code**, not by row number.

pandas (*panel data*) provides exactly this. It is built on top of NumPy: each column is stored as a NumPy array, so vectorized operations are still fast, but every row and column now carries a **label**.

| | NumPy `ndarray` | pandas `DataFrame` |
|---|---|---|
| Types | one type for the whole array | one type **per column** |
| Access | by position: `a[3, 1]` | by label: `df.loc["08279500", "mean_Q"]` |
| Missing values | `np.nan` for floats only | `NaN` in any column, `isna`, `fillna`, … |
| Files | `np.loadtxt` (numbers only) | `read_csv`, `read_excel`, … |
| Grouping, joining | by hand | `groupby`, `merge`, `pivot_table` |

pandas is the tool you will use to **load, clean and prepare** data before any machine-learning model in Part 2.

:::tip[Convention]
pandas is always imported as `pd`, together with NumPy: `import pandas as pd` and `import numpy as np`.
:::

### 2. Series and DataFrame

A **Series** is a one-dimensional array with an **index** (row labels) and an optional name. Here: mean discharges (m³/s) of four US rivers over 2015–2024:

```python
import numpy as np
import pandas as pd

q = pd.Series([321.3, 7072.2, 25.6, 19.1],
              index=["Potomac", "Mississippi", "Colorado TX", "Rio Grande"],
              name="mean_Q")
print(q)
# Potomac         321.3
# Mississippi    7072.2
# Colorado TX      25.6
# Rio Grande       19.1
# Name: mean_Q, dtype: float64

q["Rio Grande"]   # 19.1    by label
q.iloc[0]         # 321.3   by position
q.values          # [ 321.3 7072.2   25.6   19.1]   the underlying NumPy array
q * 1000          # vectorized, labels are kept (L/s)
```

A **DataFrame** is a table: a collection of Series (the **columns**) sharing the same index. The easiest way to build one is from a dictionary *column name → values*. The table below describes the eight USGS gauging stations used in the lab:

```python
stations = pd.DataFrame({
    "site_no":  ["01646500", "07010000", "08158000", "08279500",
                 "09380000", "09506000", "11098000", "11446500"],
    "river":    ["Potomac", "Mississippi", "Colorado", "Rio Grande",
                 "Colorado", "Verde", "Arroyo Seco", "American"],
    "state":    ["MD", "MO", "TX", "NM", "AZ", "AZ", "CA", "CA"],
    "area_km2": [29940, 1805222, 101033, 26936, 289561, 12973, 41, 4890],
    "mean_Q":   [321.3, 7072.2, 25.6, 19.1, 332.8, 9.5, 0.16, 107.5],
})
print(stations)
#     site_no        river state  area_km2   mean_Q
# 0  01646500      Potomac    MD     29940   321.30
# 1  07010000  Mississippi    MO   1805222  7072.20
# 2  08158000     Colorado    TX    101033    25.60
# 3  08279500   Rio Grande    NM     26936    19.10
# 4  09380000     Colorado    AZ    289561   332.80
# 5  09506000        Verde    AZ     12973     9.50
# 6  11098000  Arroyo Seco    CA        41     0.16
# 7  11446500     American    CA      4890   107.50
```

The numbers on the left (0 to 7) are the default **index**, a `RangeIndex`. Each column has its own **dtype**:

```python
stations.shape     # (8, 5)
stations.columns   # Index(['site_no', 'river', 'state', 'area_km2', 'mean_Q'], dtype='object')
stations.dtypes
# site_no      object     ← text is stored as "object"
# river        object
# state        object
# area_km2      int64
# mean_Q      float64
```

### 3. A first look at the data

Four methods give you an overview of any new table. Run them **every time** you load a file.

```python
stations.head(3)    # first rows (tail() for the last ones)
stations.info()     # columns, dtypes, number of non-null values
# RangeIndex: 8 entries, 0 to 7
# Data columns (total 5 columns):
#  #   Column    Non-Null Count  Dtype
# ---  ------    --------------  -----
#  0   site_no   8 non-null      object
#  1   river     8 non-null      object
#  ...
#  4   mean_Q    8 non-null      float64

stations.describe().round(1)   # statistics of the numeric columns
#         area_km2  mean_Q
# count        8.0     8.0
# mean    283824.5   986.0
# std     622236.0  2463.0
# min         41.0     0.2
# 25%      10952.2    16.7
# 50%      28438.0    66.6
# 75%     148165.0   324.2
# max    1805222.0  7072.2

stations["state"].value_counts()   # how many stations per state
# AZ    2
# CA    2
# MO    1
# ...
```

`info()` tells you whether a column has **missing values** (non-null count smaller than the number of rows) and whether numbers were read as text (dtype `object` where you expected `float64`). `describe()` reveals outliers: here the mean discharge (986 m³/s) is far above the median (66.6 m³/s) because of the Mississippi.

### 4. Reading and writing files

Most data arrives as **CSV** (comma-separated values) files. `pd.read_csv` accepts a local path **or a URL**:

```python
daily = pd.read_csv("usgs_daily_discharge.csv",
                    dtype={"site_no": str},       # keep the leading zeros!
                    parse_dates=["date"])         # text → datetime64
daily.head()
#     site_no       date  discharge_cfs qualifier
# 0  01646500 2015-01-01         6660.0       NaN
# 1  01646500 2015-01-02         6230.0       NaN
# 2  01646500 2015-01-03         5910.0       NaN
# ...
daily.shape    # (29223, 4)
```

The options you will need most often:

| Option | Purpose | Example |
|---|---|---|
| `dtype` | force the type of some columns | `dtype={"site_no": str}` |
| `parse_dates` | convert date columns | `parse_dates=["date"]` |
| `na_values` | extra codes meaning "missing" | `na_values=[-999, "n/a"]` |
| `sep` | column separator | `sep=";"` |
| `decimal` | decimal mark | `decimal=","` |
| `usecols` | read only some columns | `usecols=["date", "Q"]` |
| `skiprows` | skip a header block | `skiprows=10` |

:::warning[Station codes are text, not numbers]
Without `dtype={"site_no": str}`, pandas reads `01646500` as the integer `1646500`: the leading zero is lost, and the code no longer matches other files. The same applies to postal codes, phone numbers and many station identifiers.
:::

**French-style files.** Files exported by a French-language Excel use `;` as separator, `,` as decimal mark and day-first dates. Agencies also often code missing values as `-999`:

```python
# station;date;Q
# Oued Isser;01/02/2023;12,5
# Oued Isser;02/02/2023;-999
fr = pd.read_csv("isser.csv", sep=";", decimal=",", na_values=[-999],
                 parse_dates=["date"], dayfirst=True)
#       station       date     Q
# 0  Oued Isser 2023-02-01  12.5
# 1  Oued Isser 2023-02-02   NaN
```

**Writing** is symmetric: `df.to_csv("summary.csv", index=False)` (`index=False` avoids saving the 0, 1, 2… row numbers as an extra column). Excel files are read and written with `pd.read_excel` / `df.to_excel` (they need the `openpyxl` package).

### 5. Selecting data

**Columns** are selected with square brackets. One name gives a Series, a **list** of names gives a DataFrame:

```python
stations["river"]               # Series
stations[["river", "mean_Q"]]   # DataFrame with 2 columns (note the double brackets)
```

**Rows and columns by label: `.loc[rows, columns]`.** It is much more readable when the index is meaningful, so let's use the station code as index:

```python
st = stations.set_index("site_no")

st.loc["08279500", "mean_Q"]       # 19.1         one value
st.loc["08279500"]                 # one row, as a Series
st.loc[["09380000", "09506000"], ["river", "mean_Q"]]
#              river  mean_Q
# site_no
# 09380000  Colorado   332.8
# 09506000     Verde     9.5
```

**By position: `.iloc[rows, columns]`.** It works like NumPy indexing (end excluded):

```python
st.iloc[0:3, 0:2]
#                 river state
# site_no
# 01646500      Potomac    MD
# 07010000  Mississippi    MO
# 08158000     Colorado    TX
```

:::info[`.loc` slices include the end]
`st.loc["01646500":"08158000"]` returns three rows, **including** `"08158000"`. `.iloc[0:3]` excludes position 3, like Python and NumPy.
:::

**Boolean filtering** works exactly like NumPy masks, with the same operators `&`, `|`, `~` and the same mandatory parentheses:

```python
stations[stations["mean_Q"] > 100]                              # 4 stations
stations[(stations["state"] == "AZ") & (stations["mean_Q"] < 50)]   # Verde only
stations[stations["state"].isin(["AZ", "CA", "NM"])]            # the south-west
stations.query("area_km2 > 100_000 and mean_Q < 1000")          # the two Colorado rivers
```

To filter rows **and** choose columns in one step, combine a mask with `.loc`: `stations.loc[stations["mean_Q"] > 100, ["river", "mean_Q"]]`.

### 6. Computing new columns

Assigning to a new column name creates it. The operations are vectorized, as in NumPy. Two quantities let us compare rivers of very different sizes:

- the **specific discharge** $q = Q / A$, in L/s/km²;
- the **runoff depth** $R = Q \cdot \Delta t / A$, the depth of water (mm/year) that leaves the whole catchment.

```python
stations["q_spec"] = stations["mean_Q"] / stations["area_km2"] * 1000        # L/s/km²
stations["runoff_mm"] = (stations["mean_Q"] * 365.25 * 86400
                         / (stations["area_km2"] * 1e6) * 1000)              # mm/year
stations["regime"] = np.where(stations["runoff_mm"] < 50, "arid", "humid")

stations[["river", "q_spec", "runoff_mm", "regime"]].round(1)
#          river  q_spec  runoff_mm regime
# 0      Potomac    10.7      338.7  humid
# 1  Mississippi     3.9      123.6  humid
# 2     Colorado     0.3        8.0   arid
# 3   Rio Grande     0.7       22.4   arid
# 4     Colorado     1.1       36.3   arid
# 5        Verde     0.7       23.1   arid
# 6  Arroyo Seco     3.9      123.2  humid
# 7     American    22.0      693.8  humid
```

The Mississippi carries about 40 000 times more water than the Arroyo Seco, but per km² they produce the same runoff. The four "arid" rivers yield less than 40 mm/year, a hydrological situation close to that of many Algerian wadis.

**Text columns** have vectorized string methods under `.str`:

```python
stations["river"].str.upper()                  # POTOMAC, MISSISSIPPI, …
stations["site_no"].str.startswith("11").sum() # 2   California stations
daily["qualifier"].str.contains("ESTIMATED")   # True / False / NaN
```

**Date columns** have date methods under `.dt` (`.dt.year`, `.dt.month`, `.dt.dayofyear`, …):

```python
daily["Q"] = daily["discharge_cfs"] * 0.0283168    # ft³/s → m³/s
daily["year"] = daily["date"].dt.year
```

Working with dates in depth (time index, resampling, rolling windows) is the topic of the next chapter.

:::tip[Avoid `apply` and loops]
`df.apply(func, axis=1)` and `for i, row in df.iterrows()` call Python code row by row: they are **slow** and rarely needed. Look first for a vectorized operation, `np.where`, `.str` or `.dt`.
:::

### 7. Sorting

```python
stations.sort_values("runoff_mm", ascending=False).head(3)   # American, Potomac, Mississippi
stations.nlargest(3, "area_km2")                             # Mississippi, Colorado AZ, Colorado TX
stations.sort_values(["state", "mean_Q"])                    # by state, then by discharge
```

`sort_index()` sorts by the index instead.

### 8. Missing values

pandas marks missing values as `NaN` (in numeric columns) or `None`/`NaN` (in text columns). Consider a few days with sensor failures:

```python
g = pd.DataFrame({"date": ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"],
                  "Q":    [393.6, np.nan, 750.4, np.nan, 736.2],
                  "flag": ["", "EQUIP", None, "EQUIP", ""]})

g.isna().sum()      # missing values per column
# date    0
# Q       2
# flag    1
```

Unlike NumPy, **pandas statistics skip NaN by default**: `g["Q"].mean()` returns 626.73 (the mean of the three valid values) and `g["Q"].count()` returns 3. This is convenient, but it can hide a problem: always check *how many* values were used.

| Goal | Code | Result for `Q` |
|---|---|---|
| Drop rows with a missing `Q` | `g.dropna(subset=["Q"])` | 3 rows left |
| Fill with a constant | `g["Q"].fillna(0)` | `[393.6, 0.0, 750.4, 0.0, 736.2]` |
| Linear interpolation | `g["Q"].interpolate()` | `[393.6, 572.0, 750.4, 743.3, 736.2]` |
| Mark values as missing | `g.loc[g["flag"] == "EQUIP", "Q"] = np.nan` | |

Filling a discharge gap with 0 is almost always **wrong**: it creates fake droughts. Interpolation is acceptable for short gaps. Long gaps should stay missing.

:::warning[Empty cells in text columns]
An empty cell in a CSV file is read as `NaN`, even in a text column. String methods then return `NaN` too: `daily["qualifier"].str.contains("ESTIMATED")` gives `True`, `False` **or** `NaN`. Use `.str.contains("ESTIMATED", na=False)` to get a clean boolean mask.
:::

### 9. Grouping: split – apply – combine

`groupby` is the most powerful tool in pandas. It **splits** the table into groups, **applies** a function to each group and **combines** the results:

```python
stations.groupby("state")["mean_Q"].mean()
# state
# AZ     171.15
# CA      53.83
# MD     321.30
# ...
```

Read it as: *"for each state, take the `mean_Q` column and compute its mean"*. Several statistics at once, with your own column names, use **named aggregation**:

```python
stations.groupby("regime").agg(n=("river", "count"),
                               total_area=("area_km2", "sum"),
                               mean_runoff=("runoff_mm", "mean")).round(1)
#         n  total_area  mean_runoff
# regime
# arid    4      430503         22.4
# humid   4     1840093        319.8
```

On the full daily record, grouping by **two keys** gives annual statistics for every station:

```python
annual = daily.groupby(["site_no", "year"])["Q"].mean()
annual.head(3)
# site_no   year
# 01646500  2015    262.326059
#           2016    283.812478
#           2017    253.239858
```

The result has a two-level index (a **MultiIndex**). `unstack()` moves the inner level into the columns and gives a readable station × year table:

```python
annual.unstack().round(1)
# year        2015    2016    2017    2018  ...
# site_no
# 01646500   262.3   283.8   253.2   731.2
# 07010000  7353.7  7651.8  7012.2  7693.9
# 08158000    10.2    61.4    23.4    61.5
# ...
```

`transform` is the companion of `agg`: it returns a result **aligned with the original rows**, which is useful to compare each row with its group. For example, the share of each station in the total discharge of its state:

```python
stations["share_of_state"] = stations["mean_Q"] / stations.groupby("state")["mean_Q"].transform("sum")
# Colorado AZ 0.97, Verde 0.03, Arroyo Seco 0.00, American 1.00 …
```

### 10. Reshaping and combining tables

**Long and wide formats.** The daily file is in **long** format: one row per (station, date). Many analyses and plots prefer a **wide** format: one column per station. `pivot_table` goes from long to wide while aggregating:

```python
daily.pivot_table(index="year", columns="site_no", values="Q", aggfunc="max")
# site_no  01646500  07010000  08158000  08279500  ...
# year
# 2015       1665.0   23361.0     348.0      62.0
# 2016       3087.0   23390.0     716.0      68.0
# ...
```

`melt` goes back from wide to long:

```python
wide = annual.unstack()
long = wide.reset_index().melt(id_vars="site_no", var_name="year", value_name="Q_mean")
```

**Joining two tables: `merge`.** Discharge records and station metadata usually live in different files, linked by a **key** (here the station code). `merge` combines them, like a join in a database or `VLOOKUP` in a spreadsheet:

```python
summary = daily.groupby("site_no")["Q"].agg(["mean", "max"]).reset_index()
table = stations[["site_no", "river", "area_km2"]].merge(summary, on="site_no", how="left")
#     site_no        river  area_km2    mean      max
# 0  01646500      Potomac     29940   321.3   4190.9
# 1  07010000  Mississippi   1805222  7072.2  26362.9
# ...
```

| `how=` | Keeps |
|---|---|
| `"inner"` (default) | only keys present in **both** tables |
| `"left"` | all rows of the left table (NaN where no match) |
| `"right"` | all rows of the right table |
| `"outer"` | all keys of both tables |

After a merge, always check the number of rows: an unexpected increase means duplicated keys, an unexpected decrease means keys that did not match (e.g. `1646500` vs `"01646500"`).

**Stacking tables: `concat`.** To put tables with the same columns one after the other (e.g. one file per year or per station): `pd.concat([df_2023, df_2024], ignore_index=True)`.

### 11. Common pitfalls

| Pitfall | Symptom | Fix |
|---|---|---|
| Codes read as numbers | leading zeros lost, merge finds no match | `dtype={"site_no": str}` |
| Dates read as text | `.dt` raises `AttributeError`, wrong sorting | `parse_dates=["date"]` or `pd.to_datetime` |
| Chained assignment `df[mask]["Q"] = 0` | `SettingWithCopyWarning`, data unchanged | `df.loc[mask, "Q"] = 0` |
| Modifying a filtered subset | `SettingWithCopyWarning` | `sub = df[mask].copy()` |
| `and` / `or` on columns | `ValueError: The truth value of a Series is ambiguous` | `&`, `\|`, `~` with parentheses |
| NaN silently skipped | means computed on fewer values than expected | check `.count()` or `.isna().sum()` |
| Loops over rows | very slow code | vectorized operations, `groupby` |
| Forgetting `index=False` | an extra `Unnamed: 0` column when re-reading | `to_csv(..., index=False)` |

## Further reading

- [10 minutes to pandas](https://pandas.pydata.org/docs/user_guide/10min.html) — official quick tour.
- [pandas User Guide: Group by](https://pandas.pydata.org/docs/user_guide/groupby.html) — split-apply-combine in detail.
- [pandas User Guide: Merge, join, concatenate](https://pandas.pydata.org/docs/user_guide/merging.html) — with diagrams.
- [Pandas Cheat Sheet](https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf) — two pages to keep next to you.
- J. VanderPlas, *Python Data Science Handbook*, chapter 3 "Data Manipulation with Pandas" — [free online](https://jakevdp.github.io/PythonDataScienceHandbook/).
- W. McKinney, *Python for Data Analysis*, 3rd ed. — by the creator of pandas, [free online](https://wesmckinney.com/book/).
- [USGS Water Data for the Nation](https://waterdata.usgs.gov/) — source of the discharge records used in this chapter.
