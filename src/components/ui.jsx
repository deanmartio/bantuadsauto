// Small shared building blocks: one icon set (24px grid, 2px stroke) and form field chrome.

const PATHS = {
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 13l4 4L19 7',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M18 15l-6-6-6 6',
  arrowLeft: 'M15 19l-7-7 7-7',
  arrowRight: 'M9 5l7 7-7 7',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  info: 'M12 16v-4M12 8h.01M22 12a10 10 0 11-20 0 10 10 0 0120 0z',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  video: 'M15 10l5-3v10l-5-3M4 6h11v12H4z',
  image: 'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 12l4 4 4-4M12 4v12',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  play: 'M8 5v14l11-7z',
};

export function Icon({ name, className = 'w-4 h-4', strokeWidth = 2 }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Label({ htmlFor, children, required, aside }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {children}{required && <span className="text-danger" aria-hidden="true"> *</span>}
      </label>
      {aside}
    </div>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-danger mt-1.5 font-medium">{children}</p>;
}

export function Hint({ children }) {
  return <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">{children}</p>;
}

// Character guide: neutral under the limit Meta shows before cutting text, amber past it. Never blocks.
export function CharGuide({ value, limit, label }) {
  const n = [...(value || '')].length;
  const over = n > limit;
  return (
    <span className={`text-xs tabular-nums ${over ? 'text-warn font-semibold' : 'text-ink-faint'}`} title={label}>
      {n}/{limit}
    </span>
  );
}
