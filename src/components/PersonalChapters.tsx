import { ArrowDownRight, Asterisk } from 'lucide-react';
import { managers, players } from '../data/history';
import type { Match } from '../data/types';
import { ARCHIVE_START, closestPlayer, formatDate, number } from '../lib/stats';
import './stories.css';

export function PersonalChapters({ birthday, firstMatch }: { birthday: string; firstMatch: Match | null }) {
    const manager = managers.find((item) => birthday >= item.from && birthday <= item.to);
    const peer = closestPlayer(players, birthday);

    return <section className="personal-section container section-space" aria-labelledby="personal-title">
        <div className="section-heading"><div><h2 id="personal-title">YOUR FIRST CHAPTER</h2></div><Asterisk className="section-asterisk" size={36} strokeWidth={1.3} /></div>
        <div className="personal-grid">
            <article className="personal-note manager-note">
                <div className="note-label"><span>IN THE DUGOUT</span><span>01</span></div>
                <div className="manager-pitch" aria-hidden="true"><svg viewBox="0 0 250 130" fill="none"><rect x="10" y="10" width="230" height="110" rx="1" /><path d="M125 10v110M10 38h33v54H10m230-54h-33v54h33" /><circle cx="125" cy="65" r="27" /><path className="passing-line" d="m56 89 44-57 62 54 41-44" /><circle className="tactical-dot" cx="56" cy="89" r="6" /><circle className="tactical-dot" cx="100" cy="32" r="6" /><circle className="tactical-dot" cx="162" cy="86" r="6" /><circle className="tactical-dot last-dot" cx="203" cy="42" r="6" /></svg></div>
                <p className="note-kicker">The manager when you arrived</p><h3>{manager?.name ?? 'A different chapter'}</h3><p className="note-description">{manager?.note ?? 'Your birthday sits outside our manager records, which run from July 1917 to June 2028. The love for the club needs no starting date.'}</p>
            </article>
            <article className="personal-note peer-note">
                <div className="note-label"><span>YOUR GENERATION</span><span>02</span></div>
                <div className="shirt-art" aria-hidden="true">
                    <img src="/assets/trophies/fc-barcelona-2026-27-home.png" alt="" draggable="false" />
                    <div className="shirt-personalisation"><span>{peer?.name.split(' ').at(-1) ?? 'BARÇA'}</span><strong>{peer?.birthday.slice(2, 4) ?? '26'}</strong></div>
                </div>
                <p className="note-kicker">The Barça player closest to your age</p><h3>{peer?.name}</h3><p className="note-description">{peer?.gap === 0 ? 'The same birthday. Some things are just meant to be.' : <>Born {peer && formatDate(peer.birthday)}.<br />Just {number(peer?.gap ?? 0)} days between your stories.</>}</p><span className="curation-note">From our selection of 100 Barça players aged 25–40.</span>
            </article>
            <article className="personal-note first-match-note">
                <div className="note-label"><span>THE FIRST WHISTLE</span><span>03</span></div>
                <div className="first-whistle-art" aria-hidden="true"><span>{firstMatch ? firstMatch.date.slice(8) : '∞'}</span><span>{firstMatch ? formatDate(firstMatch.date, { day: undefined, month: 'short', year: 'numeric' }).toUpperCase() : 'THE STORY GOES ON'}</span></div>
                <p className="note-kicker">Your first archived league match</p><h3>{firstMatch ? <>Barça {firstMatch.gf}–{firstMatch.ga}<br />{firstMatch.opponent}</> : 'Still to be written.'}</h3><p className="note-description">{firstMatch ? (birthday < ARCHIVE_START ? 'The first fixture in our available archive. Your connection goes back even further.' : 'While your own story was just beginning, another ninety minutes became part of ours.') : 'Your birthday is beyond our last recorded match. There’s a whole lifetime of football ahead.'}</p><ArrowDownRight size={20} className="note-arrow" /></article>
        </div>
    </section>;
}
