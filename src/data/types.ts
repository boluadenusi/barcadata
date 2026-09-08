export type Result = 'W' | 'D' | 'L';
export type Match = {
  date: string;
  season: string;
  sourceId?: string;
  opponent: string;
  venue: 'H' | 'A';
  gf: number;
  ga: number;
  result: Result;
};

export type TrophyType = 'LaLiga' | 'Champions League' | 'Copa del Rey';
export type Trophy = { date: string; competition: TrophyType; season: string };
export type Manager = { name: string; from: string; to: string; note: string };
