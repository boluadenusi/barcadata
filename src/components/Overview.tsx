import { ArrowUpRight, CalendarDays, CircleDot, Flag, Goal, Trophy } from 'lucide-react';
import { ARCHIVE_START, formatDate, number, type LifetimeStats } from '../lib/stats';

type Props = { stats: LifetimeStats; birthday: string; isExample: boolean; trophyCount: number };

export function Overview({ stats, birthday, isExample, trophyCount }: Props) {
  const metrics = [
    { label: 'MATCHES LIVED', value: stats.matches.length, detail: 'Ninety minutes. Every emotion.'},
    { label: 'TIMES WE WON', value: stats.wins, detail: 'A few more reasons to smile.'},
    { label: 'GOALS CELEBRATED', value: stats.goalsFor, detail: 'You can still hear some of them.'},
    { label: 'MAJOR TROPHIES', value: trophyCount, detail: 'Silverware. Golden memories.'},
  ];

  return <section className="overview container section-space" id="numbers" aria-labelledby="numbers-title">
    <div className="section-heading">
      <div><h2 id="numbers-title" tabIndex={-1}>YOUR PERSONAL SCOREBOARD</h2></div>
      <a href="#your-story" className="birthday-pill"><CalendarDays size={16} /><span>{formatDate(birthday, { month: 'short' })}{isExample && <small>EXAMPLE</small>}</span><ArrowUpRight size={15} /></a>
    </div>
    <div className="data-context" role="status">
      {isExample ? 'A little preview for someone born on 29 November 1999. Enter your birthday to make it yours.' : `Your story begins on ${formatDate(birthday)}. Here’s the Barça you’ve lived through.`}
      {birthday < ARCHIVE_START && <strong> Your match totals start with our archive in September 1993.</strong>}
      {stats.matches.length === 0 && <strong> Your birthday is after our last archived match. The next chapter is yours to write.</strong>}
    </div>
    <div className="metrics-row" key={birthday}>
      {metrics.map(({ label, value, detail}, index) => <div className={`metric metric-${index}`} key={label}>
        <div className="metric-label"><span>{label}</span></div>
        <div className="metric-value">{number(value)}<span className="metric-punctuation">{index === 3 ? '✦' : ''}</span></div>
        <p>{detail}</p>
      </div>)}
    </div>
    <div className="record-row">
      <div className="win-rate"><strong>{stats.winRate.toFixed(1)}<span>%</span></strong><span>of your league matches<br />ended with a Barça win.</span></div>
      <div className="record-chart">
        <div className="record-bar" role="img" aria-label={`${stats.wins} wins, ${stats.draws} draws, ${stats.losses} losses`}>
          <span className="record-wins" style={{ flexGrow: stats.wins }} /><span className="record-draws" style={{ flexGrow: stats.draws }} /><span className="record-losses" style={{ flexGrow: stats.losses }} />
        </div>
        <div className="record-legend"><span><i className="swatch win" /> {number(stats.wins)} wins</span><span><i className="swatch draw" /> {number(stats.draws)} draws</span><span><i className="swatch loss" /> {number(stats.losses)} losses</span></div>
      </div>
    </div>
    <p className="coverage-note">Men’s first team · LaLiga, Sep 1993–Present· Major honours counted separately across three competitions.</p>
  </section>;
}
