import { readFile, writeFile } from 'node:fs/promises';

// Football-Data's historical CSV files are kept outside the shipped app.
// Normalize scores to Barcelona's perspective and reject incomplete seasons.
function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { cells.push(cell); cell = ''; }
    else cell += char;
  }
  cells.push(cell);
  return cells;
}

const names = {
  'Ath Bilbao': 'Athletic Club', 'Ath Madrid': 'Atlético Madrid',
  'Sociedad': 'Real Sociedad', 'Betis': 'Real Betis', 'Espanol': 'Espanyol',
  'La Coruna': 'Deportivo', 'Celta': 'Celta Vigo', 'Santander': 'Racing Santander',
  'Sp Gijon': 'Sporting Gijón', 'Alaves': 'Alavés', 'Almeria': 'Almería',
  'Malaga': 'Málaga', 'Cordoba': 'Córdoba', 'Cadiz': 'Cádiz', 'Hercules': 'Hércules',
};
const records = [];
for (let start = 1993; start <= 2024; start += 1) {
  const code = `${String(start).slice(-2)}${String(start + 1).slice(-2)}`;
  const csv = await readFile(new URL(`../.cache/football-data/${code}.csv`, import.meta.url), 'utf8');
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift()).map((header) => header.trim());
  const seasonMatches = [];
  for (const line of lines) {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((key, i) => [key, values[i]?.trim()]));
    if (row.HomeTeam !== 'Barcelona' && row.AwayTeam !== 'Barcelona') continue;
    if (!row.Date || row.FTHG === '' || row.FTAG === '') throw new Error(`Missing result in ${code}`);
    const [day, month, rawYear] = row.Date.split('/');
    const year = rawYear.length === 4 ? rawYear : `${Number(rawYear) >= 90 ? '19' : '20'}${rawYear}`;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const home = row.HomeTeam === 'Barcelona';
    const gf = Number(home ? row.FTHG : row.FTAG);
    const ga = Number(home ? row.FTAG : row.FTHG);
    const opponent = home ? row.AwayTeam : row.HomeTeam;
    if (!Number.isInteger(gf) || !Number.isInteger(ga) || Number.isNaN(Date.parse(date))) throw new Error(`Invalid row in ${code}`);
    seasonMatches.push({ date, season: `${start}/${String(start + 1).slice(-2)}`, opponent: names[opponent] ?? opponent, venue: home ? 'H' : 'A', gf, ga, result: gf > ga ? 'W' : gf < ga ? 'L' : 'D' });
  }
  const expected = start === 1995 || start === 1996 ? 42 : 38;
  if (seasonMatches.length !== expected) throw new Error(`${code}: expected ${expected} Barcelona games, got ${seasonMatches.length}`);
  records.push(...seasonMatches);
}
records.sort((a, b) => a.date.localeCompare(b.date));
if (new Set(records.map((match) => match.date)).size !== records.length) throw new Error('Duplicate dates in archive');
await writeFile(new URL('../src/data/matches.json', import.meta.url), `${JSON.stringify(records)}\n`);
console.log(`Imported ${records.length} verified fixtures, ${records[0].date} to ${records.at(-1).date}.`);
