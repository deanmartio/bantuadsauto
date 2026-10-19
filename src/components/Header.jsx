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
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <img src="/logo.png" alt="BantuAds" className="h-8 w-auto" width="128" height="32" />
        <ol className="flex items-center gap-1 sm:gap-2" aria-label="Langkah submission">
          {STEPS.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={s.key} className="flex items-center gap-1 sm:gap-2" aria-current={active ? 'step' : undefined}>
                {i > 0 && <span className={`w-4 sm:w-8 h-px ${done || active ? 'bg-brand' : 'bg-line'}`} aria-hidden="true" />}
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${active ? 'text-ink' : done ? 'text-brand-deep' : 'text-ink-faint'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] tabular-nums ${
                    active ? 'bg-brand text-white' : done ? 'bg-brand-tint text-brand-deep' : 'bg-cream text-ink-faint'
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
