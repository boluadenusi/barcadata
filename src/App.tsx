import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Header, Hero, Brand } from './components/Hero';
import { Overview } from './components/Overview';
import { MatchArchive } from './components/MatchArchive';
import { Methodology } from './components/Modal';
import { PersonalChapters } from './components/PersonalChapters';
import { TrophyCabinet } from './components/TrophyCabinet';
import { Memories } from './components/Memories';
import { DateArchive } from './components/DateArchive';
import { LifetimeInsights } from './components/LifetimeInsights';
import { ShareCard } from './components/ShareCard';
import staticMatches from './data/matches.json';
import { trophies } from './data/history';
import type { Match } from './data/types';
import { EXAMPLE_BIRTHDAY, getLifetimeStats, trophiesSince } from './lib/stats';
import { getHybridMatches } from './lib/liveSync';
import { Analytics } from '@vercel/analytics/react';

const staticArchive = staticMatches as Match[];

export default function App() {
  const [archive, setArchive] = useState<Match[]>(staticArchive);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [about, setAbout] = useState(false);
  const activeBirthday = birthday ?? EXAMPLE_BIRTHDAY;
  const stats = useMemo(() => getLifetimeStats(archive, activeBirthday), [archive, activeBirthday]);
  const personalTrophies = useMemo(() => trophiesSince(activeBirthday, trophies), [activeBirthday]);

  // Silently fetch live data on mount and merge with static archive
  const syncLive = useCallback(async () => {
    const merged = await getHybridMatches(staticArchive);
    // Only update if we actually got new data (avoids unnecessary re-renders)
    if (merged.length > staticArchive.length || merged !== staticArchive) {
      setArchive(merged);
    }
  }, []);

  useEffect(() => { syncLive(); }, [syncLive]);

  useEffect(() => {
    if (!birthday) return;

    const updateTallSections = () => {
      const viewportHeight = window.innerHeight;
      document.querySelectorAll<HTMLElement>('.page-stack > *').forEach((section) => {
        section.classList.toggle('is-tall', section.scrollHeight > viewportHeight);
      });
    };

    updateTallSections();
    window.addEventListener('resize', updateTallSections);
    const stack = document.querySelector<HTMLElement>('.page-stack');
    const observer = stack ? new ResizeObserver(updateTallSections) : null;
    if (stack && observer) observer.observe(stack);
    return () => {
      window.removeEventListener('resize', updateTallSections);
      observer?.disconnect();
    };
  }, [birthday]);

  function changeBirthday(date: string, example = false) {
    setBirthday(date); setIsExample(example);
    requestAnimationFrame(() => {
      document.getElementById('numbers-title')?.focus({ preventScroll: true });
      document.getElementById('numbers')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div id="top" className="top-stripe" />
    {birthday && <Header onAbout={() => setAbout(true)} />}
    <main id="main" className={!birthday ? 'pre-entry' : undefined}>
      <Hero onBirthday={changeBirthday} />
      {birthday && <div className="page-stack">
        <Overview stats={stats} birthday={birthday} isExample={isExample} trophyCount={personalTrophies.length} />
        
        <MatchArchive key={birthday} matches={stats.matches} birthday={birthday} />
        <PersonalChapters birthday={birthday} firstMatch={stats.firstMatch} />
        <TrophyCabinet trophies={personalTrophies} />
        <Memories key={`memories-${birthday}`} birthday={birthday} />
        <LifetimeInsights key={`opponents-${birthday}`} archive={archive} birthday={birthday} />
        <DateArchive key={`date-${birthday}`} archive={archive} birthday={birthday} />
        <ShareCard key={`share-${birthday}`} birthday={birthday} stats={stats} trophyCount={personalTrophies.length} isExample={isExample} />
      </div>}
    </main>
    {birthday && <footer className="site-footer container">
      <div><Brand /><p>Made of numbers.<br />Built on a feeling.</p></div>
      <div className="footer-info"><p>An independent project for every generation of culers.</p><button className="text-button" onClick={() => setAbout(true)}>Sources, scope & a little context <ArrowUpRight size={15} /></button><p className="footer-small">Not affiliated with FC Barcelona. Always on their side.</p></div>
    </footer>}
    {about && <Methodology onClose={() => setAbout(false)} />}
       <Analytics />
  </>;
}
