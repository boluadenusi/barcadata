import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { if (!dialog.current?.open) dialog.current?.showModal(); }, []);

  return <dialog ref={dialog} className={`modal ${className}`} aria-labelledby={titleId} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <div className="modal-inner">
      <div className="modal-top"><p className="eyebrow">CULÉ / A LITTLE CLOSER</p><button className="icon-button" onClick={() => dialog.current?.close()} aria-label="Close dialog" autoFocus><X size={21} /></button></div>
      <h2 id={titleId}>{title}</h2>
      {children}
    </div>
  </dialog>;
}

export function Methodology({ onClose }: { onClose: () => void }) {
  return <Modal title="A feeling. Backed by facts." onClose={onClose} className="methodology-modal">
    <p className="modal-intro">Football is personal. The numbers should be honest.</p>
    <div className="method-grid">
      <div><span className="eyebrow">THE MATCHES</span><h3>2,956 little stories.</h3><p>Every FC Barcelona men’s first-team LaLiga match in our archive, from December 1939 through the current campaign. That’s 88 seasons, sourced from <a href="https://www.football-data.co.uk/spainm.php" target="_blank" rel="noreferrer">Football-Data.co.uk</a> and historical league records.</p></div>
      <div><span className="eyebrow">THE SILVERWARE</span><h3>Three competitions.</h3><p>LaLiga, Champions League, and Copa del Rey titles secured since 1993. We use the day a title was won. Super cups are excluded. <a href="https://www.fcbarcelona.com/en/football/first-team/honours" target="_blank" rel="noreferrer">Club honours</a></p></div>
    </div>
    <h3>Your birthday sets the starting line.</h3><p>Matches and honours on your birthday count. If you were born before the archive begins, your league record starts with the oldest available season. If you were born after our last recorded match, we show an empty record. This is a historical snapshot, not a live feed.</p>
    <h3>A few more things worth knowing.</h3><p>The player closest to your age is chosen from our historical player selection and the current first-team roster. Manager history starts in July 1917. “Nights we carry” is a curated selection of 20 moments from 1989 onward, across competitions, so those cup matches are separate from your LaLiga totals.</p>
    <p>Your birthday stays in this page’s memory. It isn’t uploaded, tracked, or saved.</p>
    <div className="credits-block"><p><strong>Made with a culer’s heart.</strong> Independent and unaffiliated with FC Barcelona. Concept inspired by <a href="https://passmode.shop/numbers/" target="_blank" rel="noreferrer">@bootifulgame’s Arsenal Life in Numbers</a>.</p><p>Camp Nou photograph by <a href="https://commons.wikimedia.org/wiki/File:Camp_Nou_aerial.jpg" target="_blank" rel="noreferrer">Oh-Barcelona.com</a>, <a href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noreferrer">CC BY 2.0</a>. Cropped and colour-treated.</p><p>Team crests sourced from <a href="https://www.footylogos.com/" target="_blank" rel="noreferrer">Footylogos.com</a>.</p></div>
  </Modal>;
}
