import { describe, expect, it } from 'vitest';
import type { Match } from '../src/data/types';
import { mergeArchiveWithLive } from '../src/lib/liveSync';

const match = (overrides: Partial<Match>): Match => ({
  date: '2026-08-16',
  season: '2026/27',
  opponent: 'Elche',
  venue: 'H',
  gf: 5,
  ga: 0,
  result: 'W',
  ...overrides,
});

describe('live match archive merge', () => {
  it('replaces static current-season records when providers use different opponent names', () => {
    const merged = mergeArchiveWithLive(
      [match({ opponent: 'Elche' })],
      [match({ opponent: 'Elche CF', gf: 4 })],
      '2026/27',
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ opponent: 'Elche CF', gf: 4 });
  });

  it('removes repeated live events for the same match date', () => {
    const merged = mergeArchiveWithLive(
      [],
      [
        match({ opponent: 'Rayo Vallecano', date: '2026-08-29', gf: 5 }),
        match({ opponent: 'Rayo Vallecano', date: '2026-08-29', gf: 5 }),
      ],
      '2026/27',
    );

    expect(merged).toHaveLength(1);
    expect(new Set(merged.map((item) => item.date)).size).toBe(merged.length);
  });

  it('removes static records even when the live season label differs', () => {
    const merged = mergeArchiveWithLive(
      [match({ season: '2026/27', opponent: 'Elche' })],
      [match({ season: '2025/26', opponent: 'Elche CF', gf: 4 })],
      '2025/26',
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ opponent: 'Elche CF', gf: 4 });
  });

  it('does not retain current-season snapshot rows beside live rows', () => {
    const merged = mergeArchiveWithLive(
      [
        match({ date: '2026-08-16', opponent: 'Elche' }),
        match({ date: '2026-08-23', opponent: 'Athletic Club' }),
      ],
      [match({ date: '2026-08-17', opponent: 'Elche CF', sourceId: 'espn-elche' })],
      '2026/27',
    );

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ opponent: 'Elche CF', date: '2026-08-17' });
  });

  it('deduplicates repeated live events by provider event id', () => {
    const merged = mergeArchiveWithLive(
      [],
      [
        match({ date: '2026-08-16', sourceId: 'espn-elche' }),
        match({ date: '2026-08-17', sourceId: 'espn-elche' }),
      ],
      '2026/27',
    );

    expect(merged).toHaveLength(1);
  });
});
