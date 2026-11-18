import { useEffect, useRef, useState } from 'react';
import AdPreview from './AdPreview';
import { Icon, Fig } from './ui';
import { getExpandedAds } from '../utils/driveUtils';

// One passbook line per ad that will be created, in card order. A card with nothing to print yet
// keeps a blank dashed line, so the NGO sees the gap instead of a shorter list.
function getLedger(adRows) {
  const lines = [];
  adRows.forEach((row, i) => {
    const named = row.adName.trim();
    const ads = getExpandedAds(row).map(a => a.kind === 'post'
      ? { name: a.adName, kind: 'POST', detail: a.postLink.replace(/^https?:\/\/(www\.)?/, '') }
      : { name: a.adName, kind: a.type === 'Video' ? 'VIDEO' : 'GAMBAR', detail: a.isFolder ? `folder, file ke-${a.folderFileIndex + 1}` : a.filename });
    if (ads.length === 0) {
      lines.push({ key: `${row.id}-blank`, rowId: row.id, blank: true, name: named || `Iklan ${String(i + 1).padStart(2, '0')}` });
      return;
    }
    ads.forEach((ad, ai) => lines.push({
      key: `${row.id}-${ai}-${ad.kind}`,
      rowId: row.id,
      name: named ? ad.name : `Iklan ${String(i + 1).padStart(2, '0')}${ads.length > 1 ? ` (${ai + 1})` : ''}`,
      kind: ad.kind,
      detail: ad.detail,
    }));
  });
  let no = 0;
  return lines.map(l => (l.blank ? l : { ...l, no: ++no }));
}

function Ledger({ lines, activeRowId, onJump }) {
  const total = lines.filter(l => !l.blank).length;
  const listRef = useRef(null);
  const signature = lines.map(l => l.key).join('|');

  // When a line prints (or the NGO switches cards), keep that card's last line in sight inside the list.
  useEffect(() => {
    const list = listRef.current;
    const rowLines = list?.querySelectorAll(`[data-row="${activeRowId}"]`);
    const el = rowLines?.[rowLines.length - 1];
    if (!el) return;
    const top = el.offsetTop; // the list is position:relative, so this is relative to it
    if (top < list.scrollTop) list.scrollTop = top;
    else if (top + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + el.offsetHeight - list.clientHeight;
  }, [signature, activeRowId]);

  return (
    <div className="flex flex-col lg:min-h-0 rounded-[18px] bg-white text-ink overflow-hidden">
      <p className="shrink-0 px-4 pt-3.5 pb-2.5 text-[13px] text-ink-soft">Setiap file atau postingan jadi 1 iklan di Meta.</p>
      <div className="shrink-0 grid grid-cols-[2.75rem_minmax(0,1fr)_4.25rem] gap-x-2 px-4 py-2 text-[11px] font-semibold text-ink-soft border-y border-line bg-paper/60">
        <span>No</span><span>Iklan di Meta</span><span className="text-right">Sumber</span>
      </div>
      <ol ref={listRef} className="relative max-h-[18rem] lg:max-h-none lg:min-h-0 overflow-y-auto">
        {lines.map(line => {
          const active = line.rowId === activeRowId;
          return (
            <li key={line.key} data-row={line.rowId} className="print-in border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onJump(line.rowId)}
                className={`w-full grid grid-cols-[2.75rem_minmax(0,1fr)_4.25rem] gap-x-2 items-baseline px-4 py-2 text-left transition-colors duration-150 ${
                  active ? 'bg-brand-tint' : 'hover:bg-paper'
                }`}
              >
                {line.blank ? (
                  <>
                    <Fig className="text-xs text-ink-faint">---</Fig>
                    <span className="min-w-0 text-[13px] text-ink-faint border-b border-dashed border-line-strong pb-0.5 truncate">
                      {line.name}: belum ada file atau postingan
                    </span>
                    <span />
                  </>
                ) : (
                  <>
                    <Fig className="text-xs text-brand-deep font-medium">{String(line.no).padStart(3, '0')}</Fig>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-ink truncate">{line.name}</span>
                      <span className="block text-[11px] text-ink-faint truncate">{line.detail}</span>
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-soft text-right">{line.kind}</span>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="shrink-0 flex items-baseline justify-between px-4 py-3 border-t-2 border-double border-line-strong">
        <span className="text-sm font-bold text-ink">Total iklan di Meta</span>
        <Fig className="text-base font-medium text-ink">{total}</Fig>
      </div>
    </div>
  );
}

function Preview({ ngoName, row }) {
  if (!row) return null;
  const ads = getExpandedAds(row);
  const posts = ads.filter(a => a.kind === 'post').length;
  const postNote = 'Video dan caption diambil dari postingannya, jadi tampilannya sama seperti di Instagram/Facebook.';
  if (posts > 0 && posts === ads.length) {
    return (
      <div className="rounded-[18px] bg-white/10 px-5 py-8 text-center">
        <p className="text-[15px] font-semibold text-white"><Fig>{posts}</Fig> postingan yang sudah ada</p>
        <p className="text-[13px] text-white/85 mt-1.5 leading-relaxed">{postNote}</p>
      </div>
    );
  }
  return (
    <div>
      <AdPreview ngoName={ngoName} row={row} />
      {posts > 0 && (
        <p className="mt-4 rounded-[14px] bg-white/10 px-3.5 py-2.5 text-xs text-white/85 leading-relaxed">
          <span className="font-semibold text-white">+ <Fig>{posts}</Fig> postingan IG/FB.</span> {postNote}
        </p>
      )}
    </div>
  );
}

// The send-off: counts, what is still missing (each item jumps to its field), and the one button.
function ActionCard({ cards, ads, issues, showIssues, onContinue, onJumpIssue }) {
  const shown = issues.slice(0, 5);
  return (
    <section className="rounded-[18px] bg-white text-ink p-4 shrink-0" aria-label="Lanjut ke review">
      <div className="flex items-baseline justify-between text-[13px] text-ink-soft mb-3">
        <span><Fig className="text-ink font-medium text-[15px]">{cards}</Fig> iklan diisi</span>
        <span><Fig className="text-ink font-medium text-[15px]">{ads}</Fig> iklan di Meta</span>
      </div>
      {showIssues && issues.length > 0 && (
        <div className="rounded-xl bg-danger-tint px-3 py-2.5 mb-3" role="status">
          <p className="text-[13px] font-semibold text-danger mb-1"><Fig>{issues.length}</Fig> hal belum lengkap</p>
          <ul>
            {shown.map((issue, i) => (
              <li key={i}>
                <button type="button" onClick={() => onJumpIssue(issue)} disabled={!issue.id}
                  className="w-full flex items-start gap-1.5 py-1 text-left text-[13px] text-ink hover:underline disabled:no-underline disabled:cursor-default">
                  <Icon name="arrowRight" className="w-3.5 h-3.5 mt-0.5 text-danger shrink-0" />
                  <span>{issue.message}</span>
                </button>
              </li>
            ))}
          </ul>
          {issues.length > shown.length && (
            <p className="text-xs text-ink-soft mt-1">dan <Fig>{issues.length - shown.length}</Fig> lainnya</p>
          )}
        </div>
      )}
      <button type="button" onClick={onContinue} className="btn-primary w-full">
        Review Sebelum Kirim <Icon name="arrowRight" />
      </button>
    </section>
  );
}

// One card with two tabs, the preview of the card being edited and the passbook ledger of every
// ad, so each gets the full height of a laptop screen. The send-off sits below. On wide screens
// the whole column follows the NGO down the page.
const TABS = [
  { key: 'preview', label: 'Pratinjau' },
  { key: 'ledger', label: 'Rincian iklan' },
];

export default function SidePanel({ ngoName, adRows, activeRowId, onJump, ads, issues, showIssues, onContinue, onJumpIssue }) {
  const [tab, setTab] = useState('preview');
  const index = Math.max(0, adRows.findIndex(r => r.id === activeRowId));
  const row = adRows[index];
  const lines = getLedger(adRows);
  const rowAds = row ? getExpandedAds(row).length : 0;

  return (
    <div className="flex flex-col gap-3 lg:min-h-0 rounded-[28px] bg-desk text-white p-4 sm:p-5">
      <div className="shrink-0 flex items-baseline justify-between gap-3 px-1">
        <p className="text-[15px] font-bold truncate">
          Iklan <Fig>{String(index + 1).padStart(2, '0')}</Fig>{row?.adName.trim() && ` · ${row.adName.trim()}`}
        </p>
        <p className="text-[13px] text-white/80 shrink-0"><Fig>{rowAds}</Fig> iklan di Meta</p>
      </div>
      <div className="shrink-0 self-start flex items-center gap-1 rounded-full bg-black/20 p-[3px]" role="tablist" aria-label="Pratinjau dan rincian iklan">
        {TABS.map(t => {
          const on = tab === t.key;
          return (
            <button key={t.key} type="button" role="tab" id={`tab-${t.key}`} aria-selected={on} aria-controls={`panel-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-150 ${
                on ? 'bg-white text-desk' : 'text-white hover:bg-white/10'
              }`}>
              {t.label}
              {t.key === 'ledger' && <Fig>{ads}</Fig>}
            </button>
          );
        })}
      </div>
      {tab === 'preview' ? (
        <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" className="lg:min-h-0 overflow-y-auto py-1">
          <Preview ngoName={ngoName} row={row} />
        </div>
      ) : (
        <div id="panel-ledger" role="tabpanel" aria-labelledby="tab-ledger" className="flex flex-col lg:min-h-0">
          <Ledger lines={lines} activeRowId={activeRowId} onJump={onJump} />
        </div>
      )}
      <ActionCard cards={adRows.length} ads={ads} issues={issues} showIssues={showIssues} onContinue={onContinue} onJumpIssue={onJumpIssue} />
    </div>
  );
}
