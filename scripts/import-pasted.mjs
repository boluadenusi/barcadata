import { readFile, writeFile } from 'node:fs/promises';

// Paste format: tab-separated rows inside season blocks headed
// "SpainPrimera División 1939/1940". The result column lost its brackets when
// copied: it is the full-time score immediately followed by the half-time
// score, sharing the middle colon. Both scores are Barcelona-oriented
// (first number = Barça, second = opponent) in home AND away rows, since the
// letter column confirms it (e.g. away "5:71:3" L = FT 5:7, HT 1:3).
//
// FT a:b + HT c:d -> "a:bc:d", so the token has three colon-separated groups:
//   seg1 = Barça FT, middle = opp-FT digits + Barça-HT digits, seg3 = opp HT.
// Decoding tries every split of the middle digits and keeps only feasible ones
// (half-time <= full-time per side, no side > 12 goals in a LaLiga match, and
// the decoded result must equal the pasted W/D/L letter). That combination
// resolves every row to a unique split; anything else fails loudly.

const MAX_GOALS = 12; // no team has ever scored more in a single LaLiga match

function decodeScore(token, letter) {
  const segs = token.split(':');
  if (segs.length !== 3) throw new Error(`Unexpected score token: ${JSON.stringify(token)}`);
  const [barcaFTStr, mid, oppHTStr] = segs;
  const barcaFT = Number(barcaFTStr);
  const oppHT = Number(oppHTStr);
  const options = new Map();
  for (let i = 1; i < mid.length; i += 1) {
    const ftDigits = mid.slice(0, i);
    const htDigits = mid.slice(i);
    // Written scores are never zero-padded and never blank: "01" or "" cannot
    // be a score component. This kills bogus splits like FT 0:10 or FT 2:01.
    if (ftDigits.length > 1 && ftDigits.startsWith('0')) continue;
    if (htDigits.length > 1 && htDigits.startsWith('0')) continue;
    const oppFT = Number(ftDigits);
    const barcaHT = Number(htDigits);
    if (oppFT > MAX_GOALS || barcaHT > barcaFT || oppHT > oppFT) continue;
    const result = barcaFT > oppFT ? 'W' : barcaFT < oppFT ? 'L' : 'D';
    if (result !== letter) continue;
    options.set(`${oppFT}|${barcaHT}`, { barcaFT, oppFT, barcaHT, oppHT });
  }
  if (options.size !== 1) {
    throw new Error(
      `${options.size === 0 ? 'No feasible' : 'Ambiguous'} decode for "${token}" (${letter}): ${[...options.keys()].join(' / ')}`,
    );
  }
  return [...options.values()][0];
}

// Canonical opponent names match the archive's dominant vocabulary (the names
// TeamLogo resolves and opponent rankings aggregate). The 1986/87 block uses
// long forms and is canonicalized in the same pass.
const canonical = {
  'Celta de Vigo': 'Celta Vigo',
  'RCD Espanyol': 'Espanyol',
  'Deportivo A Coruña': 'Deportivo',
  'Real Betis': 'Betis',
  'Real Valladolid': 'Valladolid',
  'Real Oviedo': 'Oviedo',
  'RCD Mallorca': 'Mallorca',
  'CD Tenerife': 'Tenerife',
  'CD Logroñés': 'Logrones',
  'UD Las Palmas': 'Las Palmas',
  'Real Murcia': 'Murcia',
  'Real Zaragoza': 'Zaragoza',
  'Sevilla FC': 'Sevilla',
  'Valencia CF': 'Valencia',
  'Hércules CF': 'Hércules',
  'Granada CF': 'Granada',
  'Málaga CF': 'Málaga',
  'Lleida CF': 'Lerida',
  'Cultural Leonesa': 'CD Leonesa',
  'Gimnàstic de Tarragona': 'Gimnastic',
  'CD Alavés': 'Alavés',
  'Rayo Vallecano': 'Rayo',
  'Cádiz CF': 'Cádiz',
  'Athletic Club': 'Athletic Club',
  'Atlético Madrid': 'Atlético Madrid',
  'Real Madrid': 'Real Madrid',
  'Real Sociedad': 'Real Sociedad',
  'CA Osasuna': 'Osasuna',
  'Sporting Gijón': 'Sporting Gijón',
  'Racing Santander': 'Racing Santander',
  'Real Jaén': 'Real Jaén',
  'CD Castellón': 'CD Castellón',
  'CE Sabadell': 'CE Sabadell',
  'CD Alcoyano': 'CD Alcoyano',
  'CD Condal': 'CD Condal',
  'Atlético Tetuán': 'Atlético Tetuán',
  Albacete: 'Albacete',
  'Burgos CF': 'Burgos CF',
};

function seasonLabel(year) {
  return `${year}/${String(year + 1).slice(-2)}`;
}

const files = ['.cache/pasted/paste-1.txt', '.cache/pasted/paste-2.txt', '.cache/pasted/paste-3.txt'];
const imported = [];
const warnings = [];

for (const file of files) {
  const chunks = (await readFile(file, 'utf8')).split(/\n(?=SpainPrimera)/);
  for (const chunk of chunks) {
    const header = chunk.match(/División (\d{4})\/(\d{4})/);
    if (!header) continue;
    if (header[2] !== String(Number(header[1]) + 1)) throw new Error(`Bad season header: ${header[0]}`);
    const label = seasonLabel(Number(header[1]));
    let count = 0;
    for (const line of chunk.split('\n').slice(1)) {
      if (!line.trim()) continue;
      const m = line.match(/^(\d{2})\.(\d{2})\.(\d{4})\tMatchday \d+\t([HA])\t(.+?)\t.+?\t([WDL])\t(\d+:\S+)$/);
      if (!m) { warnings.push(`${label}: unparsed line: ${JSON.stringify(line)}`); continue; }
      const [, dd, mm, yyyy, venue, nameLong, letter, score] = m;
      const { barcaFT, oppFT, barcaHT, oppHT } = decodeScore(score, letter);
      void barcaHT; void oppHT; // half-time scores validate the split; the Match type stores full-time only
      // Scores are Barcelona-oriented in home AND away rows.
      const gf = barcaFT;
      const ga = oppFT;
      const atHome = venue === 'H';
      const result = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      if (result !== letter) throw new Error(`${label}: result mismatch: ${line}`);
      const name = nameLong.trim();
      const opponent = canonical[name];
      if (!opponent) throw new Error(`${label}: unknown opponent: ${name}`);
      imported.push({
        date: `${yyyy}-${mm}-${dd}`,
        season: label,
        opponent,
        venue: atHome ? 'H' : 'A',
        gf,
        ga,
        result,
      });
      count += 1;
    }
    console.log(`${label}: ${count} matches`);
  }
}

if (warnings.length) {
  console.error(`\n${warnings.length} warnings:`);
  for (const w of warnings) console.error(` - ${w}`);
  process.exit(1);
}

const output = new URL('../src/data/matches.json', import.meta.url);
const current = JSON.parse(await readFile(output, 'utf8'));

// Canonicalize the 1986/87 block, which uses long-form opponent names.
for (const match of current) {
  if (match.season === '1986/87') {
    const mapped = canonical[match.opponent];
    if (mapped) match.opponent = mapped;
  }
}

const pre1993Dates = new Set(imported.map((match) => match.date));
const kept = current.filter((match) => !pre1993Dates.has(match.date));
const combined = [...imported, ...kept].sort((a, b) => a.date.localeCompare(b.date));
const dupes = combined.length - new Set(combined.map((match) => match.date)).size;
if (dupes) throw new Error(`${dupes} duplicate dates after merge`);

await writeFile(output, `${JSON.stringify(combined, null, 2)}\n`);
const seasons = [...new Set(combined.map((match) => match.season))];
console.log(`\nImported ${imported.length} pre-1993 fixtures; archive now holds ${combined.length} matches across ${seasons.length} seasons (${seasons[0]}–${seasons.at(-1)}).`);
