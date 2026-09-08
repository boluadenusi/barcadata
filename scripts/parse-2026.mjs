import { readFile } from 'node:fs/promises';

const fullContent = await readFile('C:/Users/hp/.gemini/antigravity-ide/brain/98343bb9-fe78-440c-afef-6a021afe95c9/.system_generated/steps/224/content.md', 'utf8');
const laLigaStart = fullContent.indexOf('id="La_Liga"');
const copaStart = fullContent.indexOf('id="Copa_del_Rey"');
const content = fullContent.slice(laLigaStart, copaStart !== -1 ? copaStart : undefined);

// Match all data-mw containing Football box collapsible
const matches = [];
const blocks = content.split('Template:Football_box_collapsible');

function cleanWiki(str) {
  if (!str) return '';
  return str.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1').trim();
}

function parseDate(dateStr) {
  // e.g. "23 August 2025"
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

for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i].slice(0, 10000);
  const roundMatch = block.match(/"round":\{"wt":"([^"]+)"\}/);
  const dateMatch = block.match(/"date":\{"wt":"([^"]+)"\}/);
  const scoreMatch = block.match(/"score":\{"wt":"(\d+)[–-](\d+)"\}/);
  const team1Match = block.match(/"team1":\{"wt":"([^"]+)"\}/);
  const team2Match = block.match(/"team2":\{"wt":"([^"]+)"\}/);
  const resultMatch = block.match(/"result":\{"wt":"([WDL])"\}/);

  if (roundMatch && dateMatch && scoreMatch && team1Match && team2Match) {
    const roundRaw = cleanWiki(roundMatch[1]);
    const round = Number(roundRaw.replace(/\D/g, ''));
    const team1 = cleanWiki(team1Match[1]);
    const team2 = cleanWiki(team2Match[1]);
    const isHome = team1.toLowerCase().includes('barcelona');
    const opponent = isHome ? team2 : team1;
    const score1 = Number(scoreMatch[1]);
    const score2 = Number(scoreMatch[2]);
    const gf = isHome ? score1 : score2;
    const ga = isHome ? score2 : score1;
    const isoDate = parseDate(dateMatch[1]);

    // Check if this is a La Liga match (rounds 1-38)
    if (round >= 1 && round <= 38 && isoDate) {
      matches.push({
        round,
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

console.log(`Parsed ${matches.length} matches`);
const wins = matches.filter(m => m.result === 'W').length;
const draws = matches.filter(m => m.result === 'D').length;
const losses = matches.filter(m => m.result === 'L').length;
const gf = matches.reduce((s, m) => s + m.gf, 0);
const ga = matches.reduce((s, m) => s + m.ga, 0);
console.log({ wins, draws, losses, gf, ga });
// Sort by date
matches.sort((a, b) => a.date.localeCompare(b.date));
console.log(JSON.stringify(matches.slice(0, 5), null, 2));
console.log(JSON.stringify(matches.slice(-5), null, 2));
