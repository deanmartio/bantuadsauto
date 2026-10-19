import { Icon } from './ui';

const STEPS = [
  { key: 'form', label: 'Isi data' },
  { key: 'review', label: 'Review' },
  { key: 'success', label: 'Terkirim' },
];

// Not sticky: it scrolls away with the page so the form gets the whole screen.
export default function Header({ screen = 'form' }) {
  const current = STEPS.findIndex(s => s.key === screen);
  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between gap-4">
      <img src="/logo.png" alt="BantuAds" className="h-9 w-auto" width="144" height="36" />
      <ol className="flex items-center gap-1 sm:gap-2 rounded-full bg-white border border-line px-2 py-1.5" aria-label="Langkah submission">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.key} className="flex items-center gap-1 sm:gap-2" aria-current={active ? 'step' : undefined}>
              {i > 0 && <span className={`w-3 sm:w-6 h-px ${done || active ? 'bg-plum' : 'bg-line-strong'}`} aria-hidden="true" />}
              <span className={`flex items-center gap-1.5 text-[13px] font-medium ${active ? 'text-ink' : done ? 'text-plum-deep' : 'text-ink-faint'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono tabular-nums ${
                  active ? 'bg-plum text-white' : done ? 'bg-plum-tint text-plum-deep' : 'bg-paper text-ink-faint'
                }`}>
                  {done ? <Icon name="check" className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={active ? 'pr-1' : 'hidden sm:inline pr-1'}>{s.label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
