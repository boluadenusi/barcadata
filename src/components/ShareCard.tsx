import { useState } from 'react';
import { Asterisk, Check, Download } from 'lucide-react';
import { formatDate, number, type LifetimeStats } from '../lib/stats';
import './share.css';

type Props = { birthday: string; stats: LifetimeStats; trophyCount: number; isExample: boolean };

export function ShareCard(props: Props) {
  const [status, setStatus] = useState<'idle' | 'working' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function download() {
    setStatus('working'); setMessage('Making something worth keeping…');
    try {
      const { createPersonalCard } = await import('../lib/exportCard');
      const blob = await createPersonalCard(props);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `cule-${props.birthday}.png`;
      document.body.append(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('saved'); setMessage('Your card is ready. A little Barça to keep.');
    } catch {
      setStatus('error'); setMessage('We couldn’t make the image. Please try again.');
    }
  }

  return <section className="share-section" aria-labelledby="share-title"><div className="container share-layout">
    <div className="share-copy"><p className="eyebrow section-index">A LITTLE SOMETHING TO KEEP</p><h2 id="share-title">Same colours. <em>Your own story.</em></h2><p>All those ninety minutes. All those feelings.<br />Take your Barça life with you.</p><button className="button share-button" onClick={download} disabled={status === 'working'}>{status === 'saved' ? <Check size={17} /> : <Download size={17} />}{status === 'working' ? 'Creating your card…' : props.isExample ? 'Download example card' : 'Download my Barça card'}</button><div className="share-status" role={status === 'error' ? 'alert' : 'status'}>{message || 'A personal PNG. No sign-up. Just your story.'}</div></div>
    <div className="share-ticket" aria-hidden="true"><div className="ticket-top"><span className="ticket-logo">culé.</span><span>THE LIFETIME<br />COLLECTION</span></div><div className="ticket-title">Your life. <em>Our colours.</em></div><span className="ticket-match-count">{number(props.stats.matches.length)}</span><span className="ticket-match-label">NINETY-MINUTE STORIES</span><div className="ticket-small-stats"><span><strong>{number(props.stats.wins)}</strong> wins</span><span><strong>{props.trophyCount}</strong> major trophies</span><Asterisk size={24} /></div><div className="ticket-bottom"><span>{props.isExample ? 'EXAMPLE RECORD' : 'YOUR STORY BEGINS'}</span><span>{formatDate(props.birthday, { month: 'short' }).toUpperCase()}</span></div><div className="ticket-stripe" /></div>
  </div></section>;
}
