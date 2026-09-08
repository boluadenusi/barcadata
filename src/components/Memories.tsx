import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { moments } from '../data/history';
import { ageOn, formatDate } from '../lib/stats';
import { Modal } from './Modal';
import { TeamLogo } from './TeamLogo';
import './memories.css';

type Moment = typeof moments[number];

export function Memories({ birthday }: { birthday: string }) {
  const [lifetimeOnly, setLifetimeOnly] = useState(true);
  const [detail, setDetail] = useState<Moment | null>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const track = useRef<HTMLDivElement>(null);
  const items = useMemo(() => moments
    .filter((moment) => moment.date >= '1989-01-01' && (!lifetimeOnly || moment.date >= birthday))
    .sort((a, b) => b.date.localeCompare(a.date)), [birthday, lifetimeOnly]);

  function updateScroll() {
    const element = track.current;
    if (element) setCanScroll({ left: element.scrollLeft > 4, right: element.scrollLeft + element.clientWidth < element.scrollWidth - 4 });
  }
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    element.scrollLeft = 0;
    const observer = new ResizeObserver(updateScroll);
    observer.observe(element);
    updateScroll();
    return () => observer.disconnect();
  }, [items]);

  function scroll(direction: number) {
    const element = track.current;
    if (element) element.scrollBy({ left: direction * (element.clientWidth + 20), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return <section className="memories-section container section-space" id="moments" aria-labelledby="memories-title">
    <div className="section-heading"><div><h2 id="memories-title">NIGHTS WE CARRY WITH US</h2></div></div>
    <div className="memory-toolbar"><div className="memory-filters" role="group" aria-label="Filter iconic nights"><button aria-pressed={lifetimeOnly} onClick={() => setLifetimeOnly(true)}>In my lifetime</button><button aria-pressed={!lifetimeOnly} onClick={() => setLifetimeOnly(false)}>All iconic nights</button></div><div className="memory-arrows"><button className="icon-button" onClick={() => scroll(-1)} aria-label="Previous memories" disabled={!canScroll.left}><ArrowLeft size={17} /></button><button className="icon-button" onClick={() => scroll(1)} aria-label="More memories" disabled={!canScroll.right}><ArrowRight size={17} /></button></div></div>
    <div className="memory-track" ref={track} onScroll={updateScroll} aria-label="Unforgettable Barcelona matches" role="region" tabIndex={items.length ? 0 : undefined}>
      {items.map((moment) => {
        const age = ageOn(birthday, moment.date);
        return <article className={`memory-card memory-${moment.color}`} key={moment.date}>
          <div className="memory-card-label"><span>{moment.tag}</span><span>↗</span></div>
          <div className="memory-score">{moment.score}</div>
          <p className="memory-opponent"><TeamLogo name="FC Barcelona" size={24} /> FC BARCELONA <span>vs</span> <TeamLogo name={moment.opponent} size={24} /> {moment.opponent.toUpperCase()}</p>
          <h3>{moment.title}</h3>
          <p className="memory-competition">{moment.competition}</p>
          <div className="memory-card-bottom"><div><time dateTime={moment.date}>{formatDate(moment.date, { month: 'short', year: 'numeric' })}</time><span>{age === null ? 'Before your time. Still your story.' : age === 0 ? 'Your first year in the world.' : `You were ${age} years old.`}</span></div><button aria-label={`Relive ${moment.title}`} onClick={() => setDetail(moment)}><ArrowUpRight size={22} /></button></div>
        </article>;
      })}
    </div>
    {!items.length && <div className="memories-empty"><h3>The best nights are still ahead.</h3><p>Our selected moments predate your birthday. The history is yours to explore.</p><button className="text-button" onClick={() => setLifetimeOnly(false)}>Discover all iconic nights <ArrowUpRight size={16} /></button></div>}
    <p className="coverage-note">A few of the moments that made us. A curated selection across competitions.</p>
    {detail && <Modal title={detail.title} onClose={() => setDetail(null)} className="moment-modal"><p className="modal-intro">{detail.tag} · {formatDate(detail.date)}</p><div className={`moment-detail-score detail-${detail.color}`}>{detail.score}</div><p className="moment-detail-teams">FC Barcelona <span>vs</span> {detail.opponent}</p><p className="moment-detail-competition">{detail.competition}</p><blockquote>{detail.description}</blockquote><p className="moment-detail-age">{ageOn(birthday, detail.date) === null ? 'Before your time. But part of every culer’s story.' : `You were ${ageOn(birthday, detail.date)} years old. Football was busy making a memory.`}</p></Modal>}
  </section>;
}
