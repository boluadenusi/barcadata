import { describe, expect, it } from 'vitest';
import rawMatches from '../src/data/matches.json';
import { trophies } from '../src/data/history';
import type { Match } from '../src/data/types';
import { getLifetimeStats, trophiesSince } from '../src/lib/stats';

const matches = rawMatches as Match[];

describe('sourced archive integrity', () => {
  it('contains every Barcelona league fixture in 32 complete seasons', () => {
    expect(matches).toHaveLength(1224);
    const seasons = new Set(matches.map((match) => match.season));
    expect(seasons.size).toBe(32);
    for (const season of seasons) {
      expect(matches.filter((match) => match.season === season)).toHaveLength(['1995/96', '1996/97'].includes(season) ? 42 : 38);
    }
    expect(new Set(matches.map((match) => match.date)).size).toBe(matches.length);
  });
  it('matches the published 2024/25 league record', () => {
    const season = getLifetimeStats(matches.filter((match) => match.season === '2024/25'), '1900-01-01');
    expect([season.wins, season.draws, season.losses, season.goalsFor, season.goalsAgainst]).toEqual([28, 4, 6, 102, 39]);
  });
  it('normalizes both home and away Clásicos from Barcelona’s perspective', () => {
    expect(matches.find((match) => match.date === '2010-11-29')).toMatchObject({ gf: 5, ga: 0, venue: 'H', result: 'W' });
    expect(matches.find((match) => match.date === '2009-05-02')).toMatchObject({ gf: 6, ga: 2, venue: 'A', result: 'W' });
  });
  it('counts the 24 major honours won since the example birthday, including a trophy on the birthday', () => {
    expect(trophiesSince('1999-11-29', trophies)).toHaveLength(24);
    expect(trophiesSince('2025-05-15', trophies)).toHaveLength(1);
    expect(trophiesSince('2025-05-16', trophies)).toHaveLength(0);
  });
});
