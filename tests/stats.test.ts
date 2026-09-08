import { describe, expect, it } from 'vitest';
import { ageOn, closestPlayer, filterMatches, getLifetimeStats, parseBirthday } from '../src/lib/stats';
import type { Match } from '../src/data/types';

const matches: Match[] = [
  { date: '2000-05-01', season: '1999/00', opponent: 'Valencia', venue: 'H', gf: 2, ga: 1, result: 'W' },
  { date: '2000-05-06', season: '1999/00', opponent: 'Real Madrid', venue: 'A', gf: 0, ga: 0, result: 'D' },
  { date: '2000-05-10', season: '1999/00', opponent: 'Deportivo', venue: 'A', gf: 1, ga: 3, result: 'L' },
  { date: '2000-09-01', season: '2000/01', opponent: 'Athletic Club', venue: 'H', gf: 4, ga: 0, result: 'W' },
];

describe('birthday validation', () => {
  const today = new Date('2026-09-07T12:00:00Z');
  it('accepts real leap days and rejects a rolled-over calendar date', () => {
    expect(parseBirthday('29', '2', '2000', today).date).toBe('2000-02-29');
    expect(parseBirthday('29', '2', '2001', today).error).toMatch(/real calendar date/i);
    expect(parseBirthday('31', '4', '2000', today).date).toBeNull();
  });
  it('rejects missing fields, non-integers, and future birthdays', () => {
    expect(parseBirthday('', '5', '2000', today).error).toMatch(/complete/i);
    expect(parseBirthday('1.5', '5', '2000', today).date).toBeNull();
    expect(parseBirthday('8', '9', '2026', today).error).toMatch(/future/i);
    expect(parseBirthday('7', '9', '2026', today).date).toBe('2026-09-07');
  });
  it('rejects unsupported years instead of silently normalizing them', () => {
    expect(parseBirthday('1', '1', '99', today).date).toBeNull();
    expect(parseBirthday('1', '1', '1899', today).date).toBeNull();
  });
});

describe('lifetime statistics', () => {
  it('finds the nearest player birthday in either direction, including leap days', () => {
    const players = [{ name: 'Ferran Torres', birthday: '2000-02-29' }, { name: 'Riqui Puig', birthday: '1999-08-13' }];
    expect(closestPlayer(players, '1999-11-29')).toMatchObject({ name: 'Ferran Torres', gap: 92 });
    expect(closestPlayer([], '1999-11-29')).toBeNull();
  });
  it('includes the birthday and uses Barcelona-oriented home and away scores', () => {
    const stats = getLifetimeStats(matches, '2000-05-06');
    expect(stats.matches).toHaveLength(3);
    expect(stats.wins).toBe(1);
    expect(stats.draws).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.goalsFor).toBe(5);
    expect(stats.goalsAgainst).toBe(3);
    expect(stats.cleanSheets).toBe(2);
    expect(stats.winRate).toBeCloseTo(100 / 3);
    expect(stats.firstMatch?.date).toBe('2000-05-06');
  });
  it('returns an honest empty record for a birthday after the archive', () => {
    const stats = getLifetimeStats(matches, '2026-01-01');
    expect(stats.matches).toEqual([]);
    expect(stats.winRate).toBe(0);
    expect(stats.firstMatch).toBeNull();
  });
  it('does not count results before the requested birthday', () => {
    expect(getLifetimeStats(matches, '2000-09-01').goalsFor).toBe(4);
  });
  it('combines competition-season and result filters without changing source data', () => {
    expect(filterMatches(matches, 'W', '1999/00')).toEqual([matches[0]]);
    expect(filterMatches(matches, 'all', '2000/01')).toEqual([matches[3]]);
    expect(matches).toHaveLength(4);
  });
  it('calculates age on a historical match date with the birthday boundary', () => {
    expect(ageOn('1999-11-29', '2010-11-28')).toBe(10);
    expect(ageOn('1999-11-29', '2010-11-29')).toBe(11);
    expect(ageOn('1999-11-29', '1998-01-01')).toBeNull();
  });
});
