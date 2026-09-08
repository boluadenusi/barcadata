import { ArrowDown, ArrowUpRight, Asterisk } from 'lucide-react';
import { BirthdayForm } from './BirthdayForm';

export function Brand({ light = false }: { light?: boolean }) {
  return <a href="#top" className={`brand${light ? ' brand-light' : ''}`} aria-label="Culé — back to top">culé<span className="brand-period">.</span><span className="brand-stripes" aria-hidden="true" /></a>;
}

export function Header({ onAbout }: { onAbout: () => void }) {
  return <header className="site-header container">
    <div className="brand-group"><Brand /><span className="brand-description">THE BARCELONA<br />NUMBERS PROJECT</span></div>
    <nav aria-label="Main navigation">
      <a className="nav-link" href="#numbers">The numbers</a>
      <a className="nav-link" href="#moments">The memories</a>
      <button className="nav-about" onClick={onAbout}>Behind the data <ArrowUpRight size={15} /></button>
    </nav>
  </header>;
}

export function Hero({ onBirthday }: { onBirthday: (date: string, example?: boolean) => void }) {
  return <section className="hero container" aria-labelledby="hero-title">
    <div className="hero-copy">
      <div className="eyebrow hero-eyebrow"><span className="little-stripes" aria-hidden="true" /> A club. A lifetime. A million stories.</div>
      <h1 id="hero-title">Your life. <em>In blaugrana.</em></h1>
      <p className="hero-description">You remember how it felt.<br />Now discover what it all adds up to.</p>
      <p className="hero-support">Every win, every goal, every unforgettable night.<br className="desktop-break" /> The story of FC Barcelona, through your lifetime.</p>
      <BirthdayForm onBirthday={onBirthday} />
    </div>
    <div className="hero-visual">
      <div className="hero-art" role="img" aria-label="Camp Nou in blaugrana, with the club's founding year 1899">
        <div className="art-topline"><span>BARCELONA, CATALUNYA</span><Asterisk size={22} /></div>
        <div className="art-stripes" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <span className="art-year" aria-hidden="true">1899</span>
        <img className="hero-stadium" src="/camp-nou.jpg" alt="" width="1920" height="1444" fetchPriority="high" />
        <div className="art-bottom"><span>MÉS QUE UN CLUB.<br />A PART OF YOU.</span><span className="art-edition">EST.<br />29.11.1899</span></div>
        <div className="art-grain" aria-hidden="true" />
      </div>
      
      <div className="art-caption"><span>41°22′51″N 2°07′23″E</span><span>HOME. ALWAYS.</span></div>
    </div>
    <div className="hero-bottom">
      <span className="edition-note"><span className="status-dot" /> INDEPENDENT BY DESIGN. CULER BY HEART.</span>
    </div>
  </section>;
}
