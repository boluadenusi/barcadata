import { describe, expect, it } from 'vitest';
import rawMatches from '../src/data/matches.json';
import { trophies } from '../src/data/history';
import type { Match } from '../src/data/types';
import { getLifetimeStats, trophiesSince } from '../src/lib/stats';

const matches = rawMatches as Match[];

// Pre-1993 seasons come from historical league records, so their fixture count
// equals the league size of that era; 1986/87 includes the season's playoff group.
const historicalSizes: Record<string, number> = {
  '1939/1940': 22,
  '1940/1941': 22,
  '1941/1942': 26,
  '1942/1943': 26,
  '1943/1944': 26,
  '1944/1945': 26,
  '1945/1946': 26,
  '1946/1947': 26,
  '1947/1948': 26,
  '1948/1949': 26,
  '1949/1950': 26,
  '1950/1951': 30,
  '1951/1952': 30,
  '1952/1953': 30,
  '1953/1954': 30,
  '1954/1955': 30,
  '1955/1956': 30,
  '1956/1957': 30,
  '1957/1958': 30,
  '1958/1959': 30,
  '1959/1960': 30,
  '1960/1961': 30,
  '1961/1962': 30,
  '1962/1963': 30,
  '1963/1964': 30,
  '1964/1965': 30,
  '1965/1966': 30,
  '1966/1967': 30,
  '1967/1968': 30,
  '1968/1969': 30,
  '1969/1970': 30,
  '1970/1971': 30,
  '1971/1972': 34,
  '1972/1973': 34,
  '1973/1974': 34,
  '1974/1975': 34,
  '1975/1976': 34,
  '1976/1977': 34,
  '1977/1978': 34,
  '1978/1979': 34,
  '1979/1980': 34,
  '1980/1981': 34,
  '1981/1982': 34,
  '1982/1983': 34,
  '1983/1984': 34,
  '1984/1985': 34,
  '1985/1986': 34,
  '1986/87': 44,
  '1990/91': 38,
  '1991/92': 38,
  '1992/93': 38,
};

describe('sourced archive integrity', () => {
  it('contains every Barcelona league fixture across all archived seasons', () => {
    expect(matches).toHaveLength(2956);
    const seasons = new Set(matches.map((match) => match.season));
    expect(seasons.size).toBe(88);
    for (const season of seasons) {
      const expected = historicalSizes[season] ?? (['1995/96', '1996/97'].includes(season) ? 42 : 38);
      if (season === '2026/27') {
        // The current campaign is partial and grows via liveSync.
        expect(matches.filter((match) => match.season === season).length).toBeGreaterThan(0);
      } else {
        expect(matches.filter((match) => match.season === season)).toHaveLength(expected);
      }
    }
    expect(new Set(matches.map((match) => match.date)).size).toBe(matches.length);
  });
  it('stays chronologically sorted with Barcelona-oriented scores', () => {
    for (let i = 1; i < matches.length; i += 1) expect(matches[i].date > matches[i - 1].date).toBe(true);
    for (const match of matches) {
      expect(match.result).toBe(match.gf > match.ga ? 'W' : match.gf < match.ga ? 'L' : 'D');
    }
  });
  it('matches the published 2024/25 league record', () => {
    const season = getLifetimeStats(matches.filter((match) => match.season === '2024/25'), '1900-01-01');
    expect([season.wins, season.draws, season.losses, season.goalsFor, season.goalsAgainst]).toEqual([28, 4, 6, 102, 39]);
  });
  it('normalizes home and away results in the historical seasons', () => {
    expect(matches.find((match) => match.date === '1949-09-11')).toMatchObject({ gf: 10, ga: 1, venue: 'H', result: 'W' });
    expect(matches.find((match) => match.date === '1940-09-29')).toMatchObject({ gf: 1, ga: 1, venue: 'A', result: 'D' });
  });
  it('normalizes both home and away Clásicos from Barcelona’s perspective', () => {
    expect(matches.find((match) => match.date === '2010-11-29')).toMatchObject({ gf: 5, ga: 0, venue: 'H', result: 'W' });
    expect(matches.find((match) => match.date === '2009-05-02')).toMatchObject({ gf: 6, ga: 2, venue: 'A', result: 'W' });
  });
  it('counts the major honours won since the example birthday, including a trophy on the birthday', () => {
    expect(trophiesSince('1999-11-29', trophies)).toHaveLength(25);
    expect(trophiesSince('2026-05-10', trophies)).toHaveLength(1);
    expect(trophiesSince('2026-05-11', trophies)).toHaveLength(0);
  });
});
