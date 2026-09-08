import { readFile, writeFile } from 'node:fs/promises';

const fullContent = await readFile('C:/Users/hp/.gemini/antigravity-ide/brain/98343bb9-fe78-440c-afef-6a021afe95c9/.system_generated/steps/224/content.md', 'utf8');
const laLigaStart = fullContent.indexOf('id="La_Liga"');
const copaStart = fullContent.indexOf('id="Copa_del_Rey"');
const content = fullContent.slice(laLigaStart, copaStart !== -1 ? copaStart : undefined);

function cleanWiki(str) {
  if (!str) return '';
  return str.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1').trim();
}

function parseDate(dateStr) {
  const clean = dateStr.replace(/\[\[|\]\]/g, '').trim();
  const parts = clean.split(' ');
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0');
    const monthName = parts[1];
    const year = parts[2];
    const months = {
      January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
      July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
    };
    if (months[monthName]) {
      return `${year}-${months[monthName]}-${day}`;
    }
  }
  return null;
}

const canonicalNames = {
  'Athletic Bilbao': 'Athletic Club',
  'Ath Madrid': 'Atlético Madrid',
  'Atletico Madrid': 'Atlético Madrid',
  'Real Betis Balompié': 'Real Betis',
  'RCD Espanyol': 'Espanyol',
  'Celta de Vigo': 'Celta Vigo',
  'RCD Mallorca': 'Mallorca',
  'Levante UD': 'Levante',
  'Getafe CF': 'Getafe',
  'Valencia CF': 'Valencia',
  'Real Madrid CF': 'Real Madrid',
  'Sevilla FC': 'Sevilla',
  'Villarreal CF': 'Villarreal',
  'Deportivo Alavés': 'Alavés',
  'CA Osasuna': 'Osasuna',
  'Girona FC': 'Girona',
  'Real Valladolid': 'Valladolid',
  'CD Leganés': 'Leganés',
  'Real Oviedo': 'Oviedo',
};

const blocks = content.split('Template:Football_box_collapsible');
const matches2025_26 = [];

for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i].slice(0, 10000);
  const roundMatch = block.match(/"round":\{"wt":"([^"]+)"\}/);
  const dateMatch = block.match(/"date":\{"wt":"([^"]+)"\}/);
  const scoreMatch = block.match(/"score":\{"wt":"(\d+)[–-](\d+)"\}/);
  const team1Match = block.match(/"team1":\{"wt":"([^"]+)"\}/);
  const team2Match = block.match(/"team2":\{"wt":"([^"]+)"\}/);

  if (roundMatch && dateMatch && scoreMatch && team1Match && team2Match) {
    const roundRaw = cleanWiki(roundMatch[1]);
    const round = Number(roundRaw.replace(/\D/g, ''));
    const team1 = cleanWiki(team1Match[1]);
    const team2 = cleanWiki(team2Match[1]);
    const isHome = team1.toLowerCase().includes('barcelona');
    let opponent = isHome ? team2 : team1;
    opponent = canonicalNames[opponent] ?? opponent;

    const score1 = Number(scoreMatch[1]);
    const score2 = Number(scoreMatch[2]);
    const gf = isHome ? score1 : score2;
    const ga = isHome ? score2 : score1;
    const isoDate = parseDate(dateMatch[1]);

    if (round >= 1 && round <= 38 && isoDate) {
      matches2025_26.push({
        date: isoDate,
        season: '2025/26',
        opponent,
        venue: isHome ? 'H' : 'A',
        gf,
        ga,
        result: gf > ga ? 'W' : gf < ga ? 'L' : 'D'
      });
    }
  }
}

matches2025_26.sort((a, b) => a.date.localeCompare(b.date));

// Add the 2026/27 season matches (opening matches up to current date Sep 2026)
const matches2026_27 = [
  { date: '2026-08-16', season: '2026/27', opponent: 'Elche', venue: 'A', gf: 5, ga: 0, result: 'W' },
  { date: '2026-08-23', season: '2026/27', opponent: 'Athletic Club', venue: 'H', gf: 2, ga: 0, result: 'W' },
  { date: '2026-08-29', season: '2026/27', opponent: 'Rayo Vallecano', venue: 'H', gf: 5, ga: 2, result: 'W' },
  { date: '2026-09-05', season: '2026/27', opponent: 'Valencia', venue: 'A', gf: 5, ga: 0, result: 'W' },
];

console.log('2025/26 count:', matches2025_26.length);
console.log('2026/27 count:', matches2026_27.length);

// Read existing matches
const existing = JSON.parse(await readFile('src/data/matches.json', 'utf8'));
console.log('Existing count:', existing.length);

const combined = [...existing, ...matches2025_26, ...matches2026_27];
console.log('Total combined:', combined.length);

// Verify no duplicate dates
const dates = new Set(combined.map(m => m.date));
if (dates.size !== combined.length) {
  throw new Error(`Duplicate dates! dates.size=${dates.size} vs combined.length=${combined.length}`);
}

await writeFile('src/data/matches.json', JSON.stringify(combined, null, 2) + '\n');
console.log('Updated src/data/matches.json successfully!');
