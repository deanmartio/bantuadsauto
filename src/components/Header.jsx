import { Icon } from './ui';

const STEPS = [
  { key: 'form', label: 'Isi data' },
  { key: 'review', label: 'Review' },
  { key: 'success', label: 'Terkirim' },
];

export default function Header({ screen = 'form' }) {
  const current = STEPS.findIndex(s => s.key === screen);
  return (
    <header className="bg-white border-b border-line sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        <img src="/logo.png" alt="BantuAds" className="h-9 w-auto" width="144" height="36" />
        <ol className="flex items-center gap-1 sm:gap-2" aria-label="Langkah submission">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={s.key} className="flex items-center gap-1 sm:gap-2" aria-current={active ? 'step' : undefined}>
                {i > 0 && <span className={`w-4 sm:w-8 h-px ${done || active ? 'bg-brand' : 'bg-line'}`} aria-hidden="true" />}
                <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${active ? 'text-ink' : done ? 'text-brand-deep' : 'text-ink-faint'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono tabular-nums ${
                    active ? 'bg-brand text-white' : done ? 'bg-brand-tint text-brand-deep' : 'bg-paper text-ink-faint'
                  }`}>
                    {done ? <Icon name="check" className="w-3 h-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={active ? '' : 'hidden sm:inline'}>{s.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
