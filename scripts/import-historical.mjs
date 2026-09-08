import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CACHE_DIR = new URL('../.cache/rsssf/', import.meta.url);
const OUTPUT = new URL('../src/data/matches.json', import.meta.url);
const USER_AGENT = 'CuleNumbersArchive/1.0 (historical data import)';

function seasonLabel(year) {
  return year === 29 ? '1929' : `${1900 + year - 1}/${String(year).padStart(2, '0')}`;
}

function parseSeason(html, year) {
  const pre = html.match(/<pre>([\s\S]*?)<\/pre>/i)?.[1] ?? '';
  const lines = pre.replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').split(/\r?\n/);
  const matches = [];
  let date = null;

  for (const line of lines) {
    const dated = line.match(/^\s*(\d{2})-(\d{2})-(\d{4})\s+/);
    if (dated) date = `${dated[3]}-${dated[2]}-${dated[1]}`;
    const result = line.match(/^\s*(?:\d{2}-\d{2}-\d{4}\s+)?(.+?)\s+-\s+(.+?)\.{2,}\s+(\d+)-(\d+)\s*$/);
    if (!date || !result) continue;

    const home = result[1].trim();
    const away = result[2].trim();
    if (!/barcelona/i.test(home) && !/barcelona/i.test(away)) continue;

    const homeGoals = Number(result[3]);
    const awayGoals = Number(result[4]);
    const atHome = /barcelona/i.test(home);
    const gf = atHome ? homeGoals : awayGoals;
    const ga = atHome ? awayGoals : homeGoals;
    matches.push({
      date,
      season: seasonLabel(year),
      opponent: (atHome ? away : home).replace(/\.+$/, '').trim(),
      venue: atHome ? 'H' : 'A',
      gf,
      ga,
      result: gf > ga ? 'W' : gf < ga ? 'L' : 'D',
    });
  }
  return matches;
}

async function fetchSeason(year) {
  const cacheFile = new URL(`span${String(year).padStart(2, '0')}.html`, CACHE_DIR);
  try {
    return await readFile(cacheFile, 'utf8');
  } catch {
    const response = await fetch(`https://www.rsssf.org/tabless/span${String(year).padStart(2, '0')}.html`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!response.ok) throw new Error(`RSSSF request failed for span${year}: ${response.status}`);
    const html = await response.text();
    await writeFile(cacheFile, html);
    return html;
  }
}

await mkdir(CACHE_DIR, { recursive: true });
const historical = [];
for (let year = 29; year <= 93; year += 1) {
  if ([37, 38, 39].includes(year)) continue;
  const matches = parseSeason(await fetchSeason(year), year);
  if (matches.length === 0) throw new Error(`No Barcelona results parsed for ${seasonLabel(year)}`);
  console.log(`${seasonLabel(year)}: ${matches.length} matches`);
  historical.push(...matches);
}

const current = JSON.parse(await readFile(OUTPUT, 'utf8'));
const combined = [...historical, ...current].sort((a, b) => a.date.localeCompare(b.date));
if (new Set(combined.map((match) => match.date)).size !== combined.length) {
  throw new Error('Duplicate match dates found while merging historical results');
}
await writeFile(OUTPUT, `${JSON.stringify(combined)}\n`);
console.log(`Imported ${historical.length} historical fixtures; archive now contains ${combined.length}.`);
