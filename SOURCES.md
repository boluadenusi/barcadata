# Data and image credits

This is an independent fan project. It is not affiliated with FC Barcelona.

## Match archive
FC Barcelona men's first-team LaLiga results, 1993/94–2024/25. Original CSV files: [Football-Data.co.uk](https://www.football-data.co.uk/spainm.php), at `https://football-data.co.uk/mmz4281/{season}/SP1.csv`.

Only completed league matches are included. Goals and results are normalized to Barcelona's perspective. Birthdays are inclusive. For birthdays before the archive begins, match statistics cover the available archive and are explicitly labelled. Dates after 25 May 2025 return an empty record, not invented results. No live-feed claim is made.

The import script requires 38 Barcelona fixtures in every season except 1995/96 and 1996/97 (42). It rejects duplicate match dates, missing scores, and incomplete seasons. Raw downloads stay in `.cache/football-data`; `node scripts/import-matches.mjs` produces the checked-in JSON.

## Honours and historical editorial content
Major honours count LaLiga, European Cup / Champions League, and Copa del Rey titles secured from 1993 through 25 May 2025. Super cups and other competitions are excluded. Trophy date means the league-clinching date or cup-final date, not the season's last match. The 1993 league title predates the first fixture season in the match archive; these coverages are deliberately documented separately.

- [FC Barcelona honours](https://www.fcbarcelona.com/en/football/first-team/honours)
- [FC Barcelona history](https://www.fcbarcelona.com/en/club/history)
- [UEFA: Barcelona history](https://www.uefa.com/uefachampionsleague/history/clubs/50080--barcelona/)
- [List of FC Barcelona managers](https://en.wikipedia.org/wiki/List_of_FC_Barcelona_managers)
- [FC Barcelona players](https://www.fcbarcelona.com/en/football/first-team/players)

Manager records cover May 1988–May 2025. Some caretaker gaps are left unassigned rather than inferred. Player peers are selected by nearest date of birth from a curated set of 81 notable men's first-team players, expanded with historical Barça players, not a claim about every player in club history. Memorable nights are a 20-item editorial selection from 1989 onward, across competitions, and are separate from LaLiga match totals.

## Photography
**Camp Nou aerial**, Oh-Barcelona.com, 6 June 2009. [Original and metadata](https://commons.wikimedia.org/wiki/File:Camp_Nou_aerial.jpg). [Creative Commons Attribution 2.0](https://creativecommons.org/licenses/by/2.0/). Cropped, desaturated, and colour-treated for the hero composition. The credit and license are also linked in the app's methodology dialog.

## Team crests
Team crests used in match and memorable-night cards are sourced from [Footylogos.com](https://www.footylogos.com/). The source credit is also shown in the app's methodology dialog.

## Reference
[Your Arsenal Life in Numbers](https://passmode.shop/numbers/) by @bootifulgame inspired the concept of mapping club records onto a fan's birthday. The layout, visual identity, implementation, and editorial copy here are original.
