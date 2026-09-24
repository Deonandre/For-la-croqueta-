# The Possession Paradox

A statistical investigation into whether possession predicts FC Barcelona wins, built from StatsBomb open event data for the 524 La Liga matches Lionel Messi played between 2004/05 and 2020/21.

`index.html` is the finished interactive report (about 40 figures, several animated).

## Reproduce

Requirements: Python 3 with `numpy pandas scipy statsmodels scikit-learn`, and Node.js with `mathjax-full@3.2.2` (only for re-rendering the equations).

```bash
cd analysis
python3 fetch.py          # downloads 524 matches of StatsBomb events (~150 MB gzipped)
curl -sLo data/spain.csv https://raw.githubusercontent.com/jalapic/engsoccerdata/master/data-raw/spain.csv
python3 extract.py        # per-match features, game states, pass maps, shot lists
python3 elo.py            # tunes and runs the Elo system over every La Liga match since 1929
python3 build_master.py   # joins Elo, managers and coverage
python3 analysis1.py && python3 analysis2.py && python3 analysis3.py && python3 analysis4.py && python3 check_level_gap.py
python3 make_bundle.py    # writes ../build/data.json
cd ../build && node math.js && OUT=../index.html python3 build.py
```

Data: StatsBomb Open Data (free for non-commercial use with attribution) and engsoccerdata by James Curley.
