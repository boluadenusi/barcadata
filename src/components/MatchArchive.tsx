import { useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import type { Match, Result } from '../data/types';
import { ageOn, filterMatches, formatDate, matchLabel, number } from '../lib/stats';
import { Modal } from './Modal';
import { TeamLogo } from './TeamLogo';
import './archive.css';

const resultNames = { W: 'Win', D: 'Draw', L: 'Loss' };
const filters: { value: Result | 'all'; label: string }[] = [{ value: 'all', label: 'All matches' }, { value: 'W', label: 'Wins' }, { value: 'D', label: 'Draws' }, { value: 'L', label: 'Losses' }];

export function MatchArchive({ matches, birthday }: { matches: Match[]; birthday: string }) {
  const [result, setResult] = useState<Result | 'all'>('all');
  const [season, setSeason] = useState('all');
  const [active, setActive] = useState(0);
  const [detail, setDetail] = useState<Match | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => filterMatches(matches, result, season), [matches, result, season]);
  const seasons = [...new Set(matches.map((match) => match.season))].reverse();
  const selected = filtered[active] ?? filtered[0];

  function move(delta: number) { setActive((index) => Math.max(0, Math.min(filtered.length - 1, index + delta))); }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    const columns = grid.current ? getComputedStyle(grid.current).gridTemplateColumns.split(' ').length : 1;
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    if (event.key in offsets) { event.preventDefault(); move(offsets[event.key]); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(Math.max(0, filtered.length - 1)); }
    else if (event.key === 'Enter' && selected) setDetail(selected);
  }
  function selectSquare(event: MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-match-index]');
    if (target) setActive(Number(target.dataset.matchIndex));
  }

  return <section className="archive-section" id="archive" aria-labelledby="archive-title">
    <div className="container section-space">
      <div className="section-heading archive-heading">
        <div><h2 id="archive-title">THE MATCH MOSAIC.</h2></div>
       
      </div>
      <div className="archive-toolbar">
        <div className="result-filters" role="group" aria-label="Filter match results">{filters.map((filter) => <button aria-pressed={filter.value === result} onClick={() => { setResult(filter.value); setActive(0); }} key={filter.value}>{filter.value !== 'all' && <i className={`match-swatch result-${filter.value}`} />}{filter.label}</button>)}</div>
        <label className="season-filter"><span className="sr-only">Filter by season</span><select aria-label="Filter by season" value={season} onChange={(event) => { setSeason(event.target.value); setActive(0); }}><option value="all">All seasons</option>{seasons.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      </div>
      <div className="mosaic-meta"><span>{number(filtered.length)} MATCHES · ONE SHARED HISTORY</span><span>CLICK A SQUARE. RELIVE A MOMENT.</span></div>
      {filtered.length > 0 ? <>
        <div className="match-mosaic" ref={grid} tabIndex={0} role="group" aria-label="Interactive match mosaic. Use the arrow keys to explore matches and Enter for details." aria-describedby="selected-match-summary" onKeyDown={keyboard} onClick={selectSquare}>
          {filtered.map((match, index) => <span key={match.date} className={`match-square result-${match.result}${index === active ? ' is-selected' : ''}`} data-match-index={index} title={`${formatDate(match.date)} · ${matchLabel(match)} · ${resultNames[match.result]}`} aria-hidden="true" />)}
        </div>
        <div className="mosaic-axis"><span>{formatDate(filtered[0].date, { month: 'short' })}</span><span>ONE SQUARE = ONE MATCH</span><span>{formatDate(filtered[filtered.length - 1].date, { month: 'short' })}</span></div>
        {selected && <div className="selected-match">
          <div className="match-stepper"><button className="icon-button" onClick={() => move(-1)} disabled={active === 0} aria-label="Previous match"><ArrowLeft size={17} /></button><button className="icon-button" onClick={() => move(1)} disabled={active >= filtered.length - 1} aria-label="Next match"><ArrowRight size={17} /></button></div>
          <div className="selected-summary" id="selected-match-summary" aria-live="polite"><span className="selected-date">{formatDate(selected.date)} <i>·</i> {selected.venue === 'H' ? 'Home' : 'Away'}</span><span className="selected-score">Barça <strong>{selected.gf} — {selected.ga}</strong> {selected.opponent}</span></div>
          <button className="match-detail-button" aria-label="Inside the match" onClick={() => setDetail(selected)}><span>Inside the match</span><MoveUpRight size={19} /></button>
        </div>}
      </> : <div className="mosaic-empty"><span>Even the archive takes a breath.</span><p>{matches.length ? 'There are no matches for this combination. Try another result or season.' : 'Your birthday falls after our May 2025 snapshot. New memories are still being made.'}</p>{matches.length > 0 && <button className="text-button" onClick={() => { setResult('all'); setSeason('all'); setActive(0); }}>Show all my matches <ArrowUpRight size={15} /></button>}</div>}
      <p className="archive-footnote">The good days and the difficult ones. LaLiga only, till date.</p>
    </div>
    {detail && <MatchDetail match={detail} birthday={birthday} onClose={() => setDetail(null)} />}
  </section>;
}

function MatchDetail({ match, birthday, onClose }: { match: Match; birthday: string; onClose: () => void }) {
  const age = ageOn(birthday, match.date);
  const seasonCode = match.season.slice(2, 4) + match.season.slice(-2);
  return <Modal title="Ninety minutes, remembered." onClose={onClose} className="match-modal">
    <p className="modal-intro">{formatDate(match.date)} · LaLiga {match.season}</p>
    <div className="match-scoreboard"><div><TeamLogo name="FC Barcelona" /><span>FC Barcelona</span></div><strong>{match.gf}<span>:</span>{match.ga}</strong><div><TeamLogo name={match.opponent} /><span>{match.opponent}</span></div></div>
    <div className="match-detail-facts"><div><span>THE RESULT</span><strong>{resultNames[match.result]}</strong></div><div><span>THE VENUE</span><strong>{match.venue === 'H' ? 'Home' : 'Away'}</strong></div><div><span>YOUR AGE</span><strong>{age === 0 ? 'Under one' : `${age} years`}</strong></div></div>
    <p className="match-memory-line">{match.result === 'W' ? 'Another ninety minutes that felt like being on top of the world.' : match.result === 'D' ? 'A point earned, a point shared. Still our colours.' : 'We loved them before the whistle. We loved them after it, too.'}</p>
    <a className="text-button source-link" href={`https://football-data.co.uk/mmz4281/${seasonCode}/SP1.csv`} target="_blank" rel="noreferrer">View season source (CSV) <ArrowUpRight size={14} /></a>
  </Modal>;
}
