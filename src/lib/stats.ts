import type { Match, Result, Trophy } from '../data/types';

export const ARCHIVE_START = '1939-12-03';
/** Dynamic cutoff: use today's date so live-synced matches and trophies are always included. */
export const ARCHIVE_END = new Date().toISOString().slice(0, 10);
export const EXAMPLE_BIRTHDAY = '1999-11-29';

export function parseBirthday(day: string, month: string, year: string, today = new Date()) {
  const invalid = (error: string) => ({ date: null, error });
  if (!day || !month || !year) return invalid('Complete your day, month, and year to begin.');
  if (![day, month, year].every((value) => /^\d+$/.test(value))) return invalid('Use whole numbers for your birthday.');
  const [d, m, y] = [Number(day), Number(month), Number(year)];
  if (year.length !== 4 || y < 1900) return invalid('Enter a four-digit year from 1900 onwards.');
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return invalid('That is not a real calendar date. Give it another try.');
  }
  const iso = date.toISOString().slice(0, 10);
  if (iso > today.toISOString().slice(0, 10)) return invalid('Your birthday cannot be in the future.');
  return { date: iso, error: null };
}

export function getLifetimeStats(archive: Match[], birthday: string) {
  const matches = archive.filter((match) => match.date >= birthday);
  const wins = matches.filter((match) => match.result === 'W').length;
  const draws = matches.filter((match) => match.result === 'D').length;
  return {
    matches, wins, draws,
    losses: matches.length - wins - draws,
    goalsFor: matches.reduce((sum, match) => sum + match.gf, 0),
    goalsAgainst: matches.reduce((sum, match) => sum + match.ga, 0),
    cleanSheets: matches.filter((match) => match.ga === 0).length,
    winRate: matches.length ? wins / matches.length * 100 : 0,
    firstMatch: matches[0] ?? null,
  };
}

export type LifetimeStats = ReturnType<typeof getLifetimeStats>;

export function closestPlayer(players: { name: string; birthday: string }[], birthday: string) {
  return players.map((player) => ({
    ...player, gap: Math.round(Math.abs(Date.parse(player.birthday) - Date.parse(birthday)) / 86_400_000),
  })).sort((a, b) => a.gap - b.gap)[0] ?? null;
}

export function filterMatches(matches: Match[], result: Result | 'all', season: string) {
  return matches.filter((match) => (result === 'all' || match.result === result) && (season === 'all' || match.season === season));
}

export function getOpponentRankings(matches: Match[]) {
  const byOpponent = new Map<string, { opponent: string; matches: number; wins: number; draws: number; goalsFor: number; goalsAgainst: number }>();
  for (const match of matches) {
    const current = byOpponent.get(match.opponent) ?? { opponent: match.opponent, matches: 0, wins: 0, draws: 0, goalsFor: 0, goalsAgainst: 0 };
    current.matches += 1;
    current.wins += match.result === 'W' ? 1 : 0;
    current.draws += match.result === 'D' ? 1 : 0;
    current.goalsFor += match.gf;
    current.goalsAgainst += match.ga;
    byOpponent.set(match.opponent, current);
  }
  return [...byOpponent.values()]
    .map((item) => ({ ...item, winRate: item.matches ? item.wins / item.matches * 100 : 0 }))
    .sort((a, b) => b.matches - a.matches || b.wins - a.wins || a.opponent.localeCompare(b.opponent));
}

export function ageOn(birthday: string, date: string) {
  if (date < birthday) return null;
  const age = Number(date.slice(0, 4)) - Number(birthday.slice(0, 4));
  return age - (date.slice(5) < birthday.slice(5) ? 1 : 0);
}

export function trophiesSince(birthday: string, trophies: Trophy[]) {
  return trophies.filter((trophy) => trophy.date >= birthday && trophy.date <= ARCHIVE_END);
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', ...options, timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

export const number = (value: number) => new Intl.NumberFormat('en-GB').format(value);
export const matchLabel = (match: Match) => `Barcelona ${match.gf}–${match.ga} ${match.opponent}`;
