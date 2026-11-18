# Shark Incident Explorer

A classroom tool for investigating big data: filter, sort, graph (column, line, pie, histogram, scatter, map, with trendlines) and tabulate 1,296 recorded shark incidents in Australian waters.

Open `index.html` (or the GitHub Pages site). No server or build step needed; Chart.js is bundled locally so it works on restricted school networks.

## Files
- `index.html`, `app.js`: the interface
- `data.js`: cleaned data (generated)
- `chart.umd.min.js`: Chart.js 4.4.1
- `tools/build_data.py`: rebuilds `data.js` from the source spreadsheet (`pip install openpyxl`, then `python tools/build_data.py <xlsx> data.js`)

## Data
Source: Australian Shark-Incident Database, Public Version. Cleaning steps are listed on the "About the data" tab. Please cite the original database owner when using results.
