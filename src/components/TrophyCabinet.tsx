import { ChevronDown } from 'lucide-react';
import type { Trophy, TrophyType } from '../data/types';
import { formatDate } from '../lib/stats';

const competitions: { name: TrophyType; nickname: string; tone: string }[] = [
  { name: 'LaLiga', nickname: 'Kings of the long game.', tone: 'league' },
  { name: 'Champions League', nickname: 'The nights Europe was ours.', tone: 'europe' },
  { name: 'Copa del Rey', nickname: 'A cup. A thousand stories.', tone: 'cup' },
];

function TrophyDrawing({ variant }: { variant: TrophyType }) {
  const trophySources: Record<TrophyType, string> = {
    LaLiga: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Trofeo_de_La_Liga_9900.jpg',
    'Champions League': '/assets/trophies/champions-league-trophy.png',
    'Copa del Rey': '/assets/trophies/copa-del-rey-trophy.png',
  };
  return <img className="trophy-drawing" src={trophySources[variant]} alt={`${variant} trophy`} />;
  /*
  return <svg className="trophy-drawing" viewBox="0 0 160 165" fill="none" aria-hidden="true">
    <ellipse cx="80" cy="147" rx="49" ry="7" fill="currentColor" opacity=".07" />
    {variant === 'Champions League' ? <>
      <path d="M47 26C43 2 13 9 22 39c4 15 20 24 33 29M113 26c4-24 34-17 25 13-4 15-20 24-33 29" stroke="currentColor" strokeWidth="3" />
      <path d="M45 15h70l-8 57c-2 18-14 24-21 27v27h18l7 13H49l7-13h18V99c-7-3-19-9-21-27Z" fill="#e7e2d1" stroke="currentColor" strokeWidth="2" />
      <path d="M51 23h58M58 35l5 35c2 11 8 16 11 17M63 134h34" stroke="currentColor" strokeWidth="1.3" /><path d="m37 14-9 55m95-55 9 55" stroke="#a62d4d" strokeWidth="6" /><circle cx="80" cy="49" r="9" stroke="currentColor" strokeWidth="1.3" />
    </> : variant === 'LaLiga' ? <>
      <path d="M44 40H24v22c0 18 18 25 34 26m58-48h20v22c0 18-18 25-34 26" stroke="currentColor" strokeWidth="3" />
      <path d="M42 23h76l-8 46c-3 17-15 26-23 30v23h18v15H55v-15h18V99c-8-4-20-13-23-30Z" fill="#e5e5d8" stroke="currentColor" strokeWidth="2" /><path d="M38 22h84v10H38zM49 138h62v7H49z" fill="#eee8d6" stroke="currentColor" strokeWidth="2" /><path d="m38 31-12 68m96-68 12 68" stroke="#a62d4d" strokeWidth="6" /><circle cx="80" cy="56" r="12" stroke="currentColor" strokeWidth="1.5" /><path d="m80 48 8 8-8 8-8-8z" stroke="currentColor" strokeWidth="1.2" />
    </> : <>
      <path d="M48 40C25 25 15 43 25 62c6 11 22 18 33 20m54-42c23-15 33 3 23 22-6 11-22 18-33 20" stroke="currentColor" strokeWidth="3" />
      <path d="M48 24h64l-6 46c-2 19-17 28-21 31v19h14v9H61v-9h14v-19c-4-3-19-12-21-31Z" fill="#e9e1d1" stroke="currentColor" strokeWidth="2" /><path d="M51 130h58l8 15H43Z" fill="#273d36" stroke="currentColor" strokeWidth="2" /><path d="M42 23h76v9H42z" fill="#f5edda" stroke="currentColor" strokeWidth="2" /><path d="m42 33-9 58m85-58 9 58" stroke="#244fcb" strokeWidth="6" /><path d="M67 47h26v24L80 82 67 71Z" stroke="currentColor" strokeWidth="1.5" /><path d="M76 137h8" stroke="#e9bb57" strokeWidth="3" />
    </>}
  </svg>;
  */
}

export function TrophyCabinet({ trophies }: { trophies: Trophy[] }) {
  return <section className="cabinet-section" id="trophies" aria-labelledby="cabinet-title"><div className="container section-space">
    <div className="section-heading"><div><h2 id="cabinet-title">YOUR TROPHY CABINET</h2></div></div>
    <div className="trophy-grid">{competitions.map(({ name, nickname, tone }) => {
      const won = trophies.filter((trophy) => trophy.competition === name);
      return <article className={`trophy-card trophy-${tone}`} key={name}>
        <div className="trophy-card-top"><span className="trophy-count">{won.length.toString().padStart(2, '0')}</span><TrophyDrawing variant={name} /></div>
        <h3>{name}</h3><p>{nickname}</p>
        {won.length ? <details className="trophy-seasons"><summary>See the winning seasons <ChevronDown size={16} /></summary><ul>{won.map((trophy) => <li key={trophy.date}><strong>{trophy.season}</strong><time dateTime={trophy.date}>{formatDate(trophy.date, { month: 'short' })}</time></li>)}</ul></details> : <p className="trophy-empty">The next one is out there.</p>}
      </article>;
    })}</div>
    <p className="coverage-note">Titles secured in your lifetime, within our 1993–May 2025 honours archive. Three major competitions. A lifetime of pride.</p>
  </div></section>;
}
