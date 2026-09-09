import { Asterisk } from 'lucide-react';
import type { Match } from '../data/types';
import { formatDate, getOpponentRankings, number } from '../lib/stats';

export function LifetimeInsights({ archive, birthday }: { archive: Match[]; birthday: string }) {
  const rankings = getOpponentRankings(archive.filter((match) => match.date >= birthday));
  const opponents = rankings.slice(0, 5);
  const maxMeetings = opponents[0]?.matches ?? 1;

  return <section className="insights-section container section-space" aria-labelledby="opponents-title">
    <div className="section-heading"><div><h2 id="opponents-title">A LIFETIME IN OPPONENTS</h2></div></div>
    <p className="data-context">The clubs Barça met most often after {formatDate(birthday, { year: undefined })}. Bar length shows meetings; each bar splits the record into wins, draws, and losses.</p>
    {opponents.length ? <div className="opponent-chart" role="list">
      <div className="opponent-chart-head"><span>OPPONENT</span><span>MEETINGS</span><span>RESULT MIX</span></div>
      {opponents.map((item, index) => <article className="opponent-row" key={item.opponent} role="listitem">
        <div className="opponent-name"><span className="opponent-rank">{String(index + 1).padStart(2, '0')}</span><h3>{item.opponent}</h3></div>
        <div className="opponent-meetings"><div className="opponent-bar" style={{ width: `${item.matches / maxMeetings * 100}%` }}><span className="opponent-wins" style={{ flexGrow: item.wins }} /><span className="opponent-draws" style={{ flexGrow: item.draws }} /><span className="opponent-losses" style={{ flexGrow: item.matches - item.wins - item.draws }} /></div><span>{number(item.matches)}</span></div>
        <div className="opponent-result"><strong>{item.winRate.toFixed(0)}% wins</strong><span>{item.wins}W · {item.draws}D · {item.matches - item.wins - item.draws}L</span><small>{item.goalsFor}–{item.goalsAgainst} goals</small></div>
      </article>)}
    </div> : <p className="insight-empty">The archive has not reached your lifetime yet.</p>}
    <div className="opponent-legend"><span><i className="swatch win" /> WIN</span><span><i className="swatch draw" /> DRAW</span><span><i className="swatch loss" /> LOSS</span></div>
    <p className="coverage-note">Top five opponents by LaLiga meetings in the available archive. Scores are from Barcelona’s perspective.</p>
  </section>;
}
