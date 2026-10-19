import { useEffect, useRef, useState } from 'react';
import { Icon, Fig } from './ui';

const STEPS = [
  { key: 'prepare', label: 'Menyiapkan file ZIP dan menyimpan salinannya' },
  { key: 'upload', label: 'Mengunggah ke KawanBantu' },
  { key: 'done', label: 'Tercatat di tracker KawanBantu' },
];

function formatSize(bytes) {
  if (!bytes) return '';
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// The browser cannot report upload progress for this endpoint (a progress listener would force a
// CORS preflight the server can't answer), so the bar eases toward 90% over the expected time
// for this file size and completes the moment the server answers.
export default function SendProgress({ stage, bytes }) {
  const [pct, setPct] = useState(4);
  const ref = useRef(null);

  // Bring the progress into view the moment sending starts.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const expectedMs = 4000 + (bytes || 0) / 400; // ~400 KB/s plus server time

  useEffect(() => {
    if (stage !== 'upload') return;
    const start = performance.now();
    const t = setInterval(() => {
      const elapsed = performance.now() - start;
      setPct(Math.min(90, 8 + 82 * (1 - Math.exp(-elapsed / (expectedMs / 2)))));
    }, 120);
    return () => clearInterval(t);
  }, [stage, expectedMs]);

  const current = STEPS.findIndex(s => s.key === stage);
  const shown = stage === 'done' ? 100 : stage === 'prepare' ? 4 : pct;

  return (
    <section ref={ref} className="leaf p-5 sm:p-6 scroll-mt-6" role="status" aria-live="polite">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-ink">Mengirim submission</h2>
        <Fig className="text-sm text-plum-deep">{Math.round(shown)}%</Fig>
      </div>
      <div className="h-2.5 rounded-full bg-paper-deep overflow-hidden" aria-hidden="true">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-plum transition-[width] duration-300 ease-out relative overflow-hidden"
          style={{ width: `${shown}%` }}
        >
          {stage !== 'done' && <span className="absolute inset-0 progress-sheen" />}
        </div>
      </div>
      <ol className="mt-5 flex flex-col gap-2.5">
        {STEPS.map((s, i) => {
          const done = i < current || stage === 'done';
          const active = i === current && stage !== 'done';
          return (
            <li key={s.key} className="flex items-center gap-3 text-sm">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                done ? 'bg-brand text-white' : active ? 'border-2 border-plum' : 'border border-line-strong'
              }`}>
                {done ? <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />
                  : active ? <span className="w-2.5 h-2.5 rounded-full bg-plum animate-pulse" /> : null}
              </span>
              <span className={done ? 'text-ink' : active ? 'text-ink font-medium' : 'text-ink-faint'}>
                {s.label}
                {s.key === 'upload' && bytes ? <span className="text-ink-faint"> · <Fig>{formatSize(bytes)}</Fig></span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] text-ink-soft mt-4">Jangan tutup halaman ini sampai selesai.</p>
    </section>
  );
}
