const STEPS = [
  { key: 'form', label: 'Isi data' },
  { key: 'review', label: 'Review' },
  { key: 'success', label: 'Terkirim' },
];

// Not sticky: it scrolls away with the page so the form gets the whole screen. The three steps
// read as a progress bar: done and current segments are deep teal.
export default function Header({ screen = 'form' }) {
  const current = STEPS.findIndex(s => s.key === screen);
  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-4 sm:pb-6 flex items-center justify-between gap-6">
      <img src="/logo.png" alt="BantuAds" className="h-7 sm:h-8 w-auto" width="144" height="36" />
      <ol className="grid grid-cols-3 gap-1.5 w-full max-w-[18.5rem]" aria-label="Langkah submission">
        {STEPS.map((s, i) => {
          const reached = i <= current;
          const active = i === current;
          return (
            <li key={s.key} aria-current={active ? 'step' : undefined}
              className={`border-t-[3px] pt-1.5 text-xs whitespace-nowrap ${reached ? 'border-brand-deep' : 'border-line-strong'} ${active ? 'text-ink font-semibold' : 'text-ink-faint'}`}>
              <span className="font-mono tabular-nums">{i + 1}</span> <span className={active ? '' : 'hidden sm:inline'}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </header>
  );
}
