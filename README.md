# Sources

## Rod Edwards: Edo Historical Ratings

[Edo Historical Ratings](http://www.edochess.ca/index.html) covers 1809-1928. Data scraped from Rod's website with [scrape.py](./scripts/scrape.py) appears in [edo.txt](./data/edo.txt)

## Jeff Sonas: Chessmetrics

[Chessmetrics](http://www.chessmetrics.com/cm/) covers 1843-2005. Data scraped from Jeff's website with [scrape.py](./scripts/scrape.py) appears in [cmr.txt](./data/cmr.txt).

## Mark Weeks: FIDE Historical Ratings

[FIDE Historical Ratings](https://www.mark-weeks.com/chess/ratings/) covers 1975-2000. Data downloaded from Mark's website, and compiled with [combine_weeks.py](./scripts/combine_weeks.py), appears in [fide_hist.txt](./data/fide_hist.txt)

## FIDE Ratings Archive

The [current archive](http://ratings.fide.com/download.phtml) on the FIDE website covers 2001-2020. Right now, only the top player from each country from each year is shown in [fide_current.txt](./data/fide_current.txt). More information on this process can be seen from my previous [chess leaflet project](https://github.com/ecl2020/chess-leaflet/blob/master/preparing_geojson/description.md). An improved process description should arrive soon, along with the complete data. 
