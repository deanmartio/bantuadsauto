import { useEffect, useRef } from 'react';
import { Icon } from './ui';

// "N hal belum lengkap" list: each item jumps to and focuses the field it is about.
export default function IssueGuide({ issues, open, onClose, onJump }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === 'Escape' && onClose();
    const onClick = e => ref.current && !ref.current.contains(e.target) && !e.target.closest('[data-issue-toggle]') && onClose();
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, onClose]);

  if (!open || issues.length === 0) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Yang belum lengkap"
      className="fixed bottom-[72px] right-4 left-4 sm:left-auto sm:w-[380px] z-50 card !shadow-[0_12px_32px_-12px_rgb(43_32_51/0.35)] max-h-[60vh] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <p className="text-sm font-bold text-ink">{issues.length} hal belum lengkap</p>
        <button type="button" onClick={onClose} className="btn-ghost !p-1" aria-label="Tutup">
          <Icon name="x" />
        </button>
      </div>
      <ul className="overflow-y-auto py-1.5">
        {issues.map((issue, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onJump(issue)}
              disabled={!issue.id}
              className="w-full flex items-start gap-2.5 px-4 py-2 text-left text-sm text-ink hover:bg-cream transition-colors duration-150 disabled:cursor-default"
            >
              <Icon name="alert" className="w-4 h-4 mt-0.5 text-danger shrink-0" />
              <span className="flex-1">{issue.message}</span>
              {issue.id && <Icon name="arrowRight" className="w-4 h-4 mt-0.5 text-ink-faint shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
