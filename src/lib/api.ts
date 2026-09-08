import matches from '../data/matches.json';
import type { Match, Result } from '../data/types';

export const archiveMatches = matches as Match[];

export type MatchQuery = {
  season?: string;
  result?: Result | 'all';
  from?: string;
  to?: string;
};

/**
 * Single source of truth API service for FC Barcelona match data.
 * Historical archive is from matches.json; current-season data
 * is overlaid at runtime by liveSync.ts in the App component.
 */
export const matchApi = {
  /**
   * Retrieves all verified match records across 34 seasons (1993/94–2026/27).
   */
  getAllMatches(): Match[] {
    return archiveMatches;
  },

  /**
   * Filters match records by query parameters.
   */
  queryMatches(query: MatchQuery): Match[] {
    return archiveMatches.filter((match) => {
      if (query.season && query.season !== 'all' && match.season !== query.season) return false;
      if (query.result && query.result !== 'all' && match.result !== query.result) return false;
      if (query.from && match.date < query.from) return false;
      if (query.to && match.date > query.to) return false;
      return true;
    });
  },

  /**
   * Returns all available seasons in reverse chronological order.
   */
  getSeasons(): string[] {
    return [...new Set(archiveMatches.map((m) => m.season))].reverse();
  },

  /**
   * Returns external provenance URL for a given match.
   */
  getSourceUrl(match: Match): { url: string; label: string } {
    if (match.season <= '2024/25') {
      const code = match.season.slice(2, 4) + match.season.slice(-2);
      return {
        url: `https://football-data.co.uk/mmz4281/${code}/SP1.csv`,
        label: 'View season source (Football-Data CSV)',
      };
    }
    if (match.season === '2025/26') {
      return {
        url: 'https://www.laliga.com/en-GB/laliga-easports/standing',
        label: 'View 2025/26 official record (LaLiga)',
      };
    }
    return {
      url: 'https://www.laliga.com/en-GB/clubs/fc-barcelona/results',
      label: 'View current campaign (LaLiga)',
    };
  },
};

