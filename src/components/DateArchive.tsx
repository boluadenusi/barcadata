import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import type { Match } from '../data/types';
import { formatDate, getLifetimeStats } from '../lib/stats';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function DateArchive({ archive, birthday }: { archive: Match[]; birthday: string }) {
  const [month, setMonth] = useState(Number(birthday.slice(5, 7)));
  const [day, setDay] = useState(Number(birthday.slice(8)));
  const [showAll, setShowAll] = useState(false);
  const monthDay = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = `2000-${monthDay}`;
  const stats = useMemo(() => getLifetimeStats(archive.filter((match) => match.date.slice(5) === monthDay), '1900-01-01'), [archive, monthDay]);
  const daysInMonth = new Date(Date.UTC(2000, month, 0)).getUTCDate();
  const shown = [...stats.matches].reverse().slice(0, showAll ? undefined : 3);
  const isBirthday = birthday.slice(5) === monthDay;

  function chooseMonth(value: number) { setMonth(value); setDay((current) => Math.min(current, new Date(Date.UTC(2000, value, 0)).getUTCDate())); setShowAll(false); }
  function today() { const current = new Date(); setMonth(current.getMonth() + 1); setDay(current.getDate()); setShowAll(false); }

  return <section className="date-section container section-space" aria-labelledby="date-title">
    <div className="date-intro"><div className="date-heading-row"><h2 id="date-title">A SCORELINE FOR THIS DATE</h2>
      </div>
    </div>
    <div className="calendar-record"><div className="calendar-record-heading"><span className="eyebrow">{isBirthday ? 'YOUR BIRTHDAY, THROUGH THE YEARS' : 'THIS DATE, THROUGH THE YEARS'}</span><h3>{formatDate(date, { year: undefined })}</h3></div>
      {stats.matches.length ? <>
        <div className="calendar-aggregate"><div><span className="calendar-team">BARÇA</span><strong>{stats.goalsFor}<i>:</i>{stats.goalsAgainst}</strong><span className="calendar-team">OPPONENTS</span></div><p>Every match on this date, rolled into one scoreline.</p></div>
        <div className="calendar-record-stats"><span><strong>{stats.matches.length}</strong> matches</span><span><strong>{stats.wins}</strong> wins</span><span><strong>{stats.winRate.toFixed(0)}%</strong> win rate</span></div>
        <ul className="date-match-list">{shown.map((match) => <li key={match.date}><time dateTime={match.date}>{match.date.slice(0, 4)}</time><span>Barça <strong>{match.gf}–{match.ga}</strong> {match.opponent}</span><span className={`date-result date-result-${match.result}`}>{match.result === 'W' ? 'WIN' : match.result === 'D' ? 'DRAW' : 'LOSS'}</span></li>)}</ul>
        {stats.matches.length > 3 && <button className="text-button date-expand" onClick={() => setShowAll(!showAll)} aria-expanded={showAll}>{showAll ? 'Show fewer matches' : `See all ${stats.matches.length} matches`} <ArrowUpRight size={14} /></button>}
      </> : <div className="calendar-empty"><span>A quiet day<br /><em>in the archive.</em></span><p>No league matches on this date in our records. Even football needs a breather.</p><button className="text-button" onClick={() => { setMonth(11); setDay(29); setShowAll(false); }}>Try Barça’s birthday, 29 November <ArrowUpRight size={15} /></button></div>}
      <p className="calendar-scope">LaLiga · 1939–present · All years, including those before your birth.</p>
    </div>
  </section>;
}
