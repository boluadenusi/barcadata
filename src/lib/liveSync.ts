import type { Match, Result } from '../data/types';

/**
 * ESPN API configuration for FC Barcelona LaLiga schedule.
 * Team 83 = FC Barcelona, league esp.1 = LaLiga.
 */
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams/83/schedule';
const BARCA_ID = '83';
const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** The season year boundary — the current LaLiga season that should be overlaid with live data. */
function currentSeasonYear(): number {
  const now = new Date();
  // LaLiga seasons start in August. Before August we're still in the previous season year.
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

/** Converts a season year (e.g. 2026) to the display format used in the archive (e.g. "2026/27"). */
function seasonLabel(year: number): string {
  return `${year}/${String(year + 1).slice(-2)}`;
}

/** In-memory cache to avoid hammering ESPN on every render. */
let cache: { matches: Match[]; fetchedAt: number } | null = null;

/**
 * Parses ESPN schedule events into our Match format.
 * Only completed LaLiga matches are included.
 */
function parseEspnEvents(events: EspnEvent[], season: string): Match[] {
  const parsed: Match[] = [];

  for (const event of events) {
    const comp = event.competitions?.[0];
    if (!comp) continue;

    // Only include completed matches
    const status = comp.status;
    if (!status?.type?.completed) continue;

    // Find Barcelona and the opponent in the competitors array
    const barca = comp.competitors?.find((c) => c.team?.id === BARCA_ID);
    const opponent = comp.competitors?.find((c) => c.team?.id !== BARCA_ID);
    if (!barca || !opponent) continue;

    const gf = Math.round(barca.score?.value ?? 0);
    const ga = Math.round(opponent.score?.value ?? 0);
    const result: Result = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    const venue: 'H' | 'A' = barca.homeAway === 'home' ? 'H' : 'A';

    // Convert UTC date to local match date (matches are played in CET/CEST)
    // ESPN gives ISO datetime; we extract the date in Europe/Madrid timezone
    const matchDate = toLocalDate(event.date);

    parsed.push({
      date: matchDate,
      season,
      sourceId: event.id,
      opponent: opponent.team?.displayName ?? opponent.team?.location ?? 'Unknown',
      venue,
      gf,
      ga,
      result,
    });
  }

  // Sort chronologically (ESPN returns most recent first)
  return parsed.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Converts an ISO datetime string to a YYYY-MM-DD date in Europe/Madrid timezone.
 * Falls back to UTC date extraction if Intl is unavailable.
 */
function toLocalDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    // Format in Spain's timezone to get the correct match day
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
    return parts; // en-CA gives YYYY-MM-DD format
  } catch {
    // Fallback: just take the first 10 chars (UTC date)
    return isoDate.slice(0, 10);
  }
}

/**
 * Fetches live match data from ESPN for the current LaLiga season.
 * Returns parsed Match[] or null on failure.
 */
async function fetchLiveMatches(): Promise<Match[] | null> {
  try {
    const year = currentSeasonYear();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(`${ESPN_BASE}?season=${year}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data = await res.json();
    const events: EspnEvent[] = data.events ?? [];
    if (!Array.isArray(events) || events.length === 0) return null;

    return parseEspnEvents(events, seasonLabel(year));
  } catch {
    // Network error, timeout, or sandbox restriction — expected in dev
    return null;
  }
}

/**
 * Core hybrid merge: takes the static archive and overlays live ESPN results
 * for the current season. Archive matches for past seasons are untouched.
 *
 * Deduplication uses the match date. Barcelona cannot play two LaLiga matches
 * on the same date, and provider naming differences make opponent text unsafe
 * as a deduplication key.
 */
export function mergeArchiveWithLive(archive: Match[], live: Match[], liveSeason: string): Match[] {
  // Some providers can return the same fixture more than once (for example,
  // once as a completed event and once as an updated event). Keep the latest
  // record for each match date before merging with the static archive.
  const liveByIdentity = new Map<string, Match>();
  for (const match of live) liveByIdentity.set(match.sourceId ?? match.date, match);
  const uniqueLive = [...liveByIdentity.values()];

  // The live feed is authoritative for the current season. Do not retain
  // snapshot rows from that season, including future fixtures or rows whose
  // provider date differs by a day.
  const archiveExtras = archive.filter((m) => m.season !== liveSeason);
  const mergedByDate = new Map<string, Match>();
  for (const match of archiveExtras) mergedByDate.set(match.date, match);
  for (const match of uniqueLive) mergedByDate.set(match.date, match);

  return [...mergedByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns the full match list: static archive with live overlay for the current season.
 * Caches results for 5 minutes to avoid excessive API calls.
 *
 * This is the main export — use it instead of importing matches.json directly
 * when you want up-to-date data.
 */
export async function getHybridMatches(archive: Match[]): Promise<Match[]> {
  const now = Date.now();

  // Return cached result if still fresh
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.matches;
  }

  const year = currentSeasonYear();
  const season = seasonLabel(year);
  const live = await fetchLiveMatches();

  if (!live) {
    // Offline / sandbox / API failure — use archive as-is
    return archive;
  }

  const merged = mergeArchiveWithLive(archive, live, season);
  cache = { matches: merged, fetchedAt: now };
  return merged;
}

/** Clears the live data cache (useful for testing or forcing a refresh). */
export function clearLiveCache() {
  cache = null;
}

/** Returns the current live season label, e.g. "2026/27". */
export function getLiveSeason(): string {
  return seasonLabel(currentSeasonYear());
}

// ─── ESPN API type shapes (minimal, only what we parse) ─────────────────────

type EspnEvent = {
  id?: string;
  date: string;
  name?: string;
  competitions?: EspnCompetition[];
};

type EspnCompetition = {
  competitors?: EspnCompetitor[];
  status?: {
    type?: {
      completed?: boolean;
    };
  };
};

type EspnCompetitor = {
  team?: {
    id?: string;
    location?: string;
    displayName?: string;
  };
  homeAway?: string;
  score?: {
    value?: number;
  };
};
