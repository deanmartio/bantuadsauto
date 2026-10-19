import { useState } from 'react';
import AdPreview from './AdPreview';
import { Icon, Fig } from './ui';
import { getExpandedCreatives, getExpandedPosts } from '../utils/driveUtils';

// One passbook line per ad that will be created, in card order. A card with nothing to print yet
// keeps a blank dashed line, so the NGO sees the gap instead of a shorter list.
function getLedger(adRows) {
  const lines = [];
  adRows.forEach((row, i) => {
    const named = row.adName.trim();
    const ads = row.source === 'post'
      ? getExpandedPosts(row).map(p => ({ name: p.adName, kind: 'POST', detail: p.postLink.replace(/^https?:\/\/(www\.)?/, '') }))
      : getExpandedCreatives(row).map(c => ({ name: c.adName, kind: c.type === 'Video' ? 'VIDEO' : 'GAMBAR', detail: c.isFolder ? `folder, file ke-${c.folderFileIndex + 1}` : c.filename }));
    if (ads.length === 0) {
      lines.push({ key: `${row.id}-blank`, rowId: row.id, blank: true, name: named || `Iklan ${i + 1}` });
      return;
    }
    ads.forEach((ad, ai) => lines.push({
      key: `${row.id}-${ai}-${ad.kind}`,
      rowId: row.id,
      name: named ? ad.name : `Iklan ${i + 1}${ads.length > 1 ? ` (${ai + 1})` : ''}`,
      kind: ad.kind,
      detail: ad.detail,
    }));
  });
  let no = 0;
  return lines.map(l => (l.blank ? l : { ...l, no: ++no }));
}

function Ledger({ lines, activeRowId, onJump }) {
  const total = lines.filter(l => !l.blank).length;
  return (
    <div>
      <p className="px-4 pt-3 pb-2 text-[13px] text-ink-soft">Iklan yang akan dibuat tim KawanBantu, dicetak per baris.</p>
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_4.25rem] gap-x-2 px-4 py-2 text-[11px] font-semibold text-ink-soft border-y border-line bg-paper/60">
        <span>No</span><span>Iklan</span><span className="text-right">Sumber</span>
      </div>
      <ol>
        {lines.map(line => {
          const active = line.rowId === activeRowId;
          return (
            <li key={line.key} className="print-in border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => onJump(line.rowId)}
                className={`w-full grid grid-cols-[2.75rem_minmax(0,1fr)_4.25rem] gap-x-2 items-baseline px-4 py-2 text-left transition-colors duration-150 ${
                  active ? 'bg-brand-tint/70' : 'hover:bg-paper'
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
                    <Fig className="text-xs text-brand-deep">{String(line.no).padStart(3, '0')}</Fig>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold text-ink truncate">{line.name}</span>
                      <span className="block text-[11px] text-ink-faint truncate">{line.detail}</span>
                    </span>
                    <Fig className="text-[11px] text-ink-soft text-right">{line.kind}</Fig>
                  </>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex items-baseline justify-between px-4 py-3 border-t-2 border-double border-line-strong">
        <span className="text-sm font-bold text-ink">Total iklan</span>
        <Fig className="text-base font-medium text-ink">{total}</Fig>
      </div>
    </div>
  );
}

function Preview({ ngoName, row }) {
  if (!row) return null;
  if (row.source === 'post') {
    return (
      <div className="m-4 rounded-xl bg-paper px-4 py-6 text-center">
        <Icon name="link" className="w-6 h-6 mx-auto text-brand-deep mb-2" />
        <p className="text-sm font-semibold text-ink">Memakai postingan yang sudah ada</p>
        <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
          Video dan caption diambil dari postingannya, jadi tampilannya sama seperti di Instagram/Facebook.
        </p>
      </div>
    );
  }
  return <div className="p-4"><AdPreview ngoName={ngoName} row={row} /></div>;
}

// One panel, two tabs: the preview of the card being edited, and the passbook ledger of every ad.
export default function SidePanel({ ngoName, adRows, activeRowId, onJump }) {
  const [tab, setTab] = useState('preview');
  const index = Math.max(0, adRows.findIndex(r => r.id === activeRowId));
  const row = adRows[index];
  const lines = getLedger(adRows);
  const total = lines.filter(l => !l.blank).length;
  const tabs = [
    { id: 'preview', label: 'Pratinjau' },
    { id: 'ledger', label: 'Rincian iklan', count: total },
  ];

  return (
    <section className="leaf overflow-hidden">
      <div className="flex items-center gap-1 p-1.5 border-b border-line bg-paper/60" role="tablist" aria-label="Panel samping">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors duration-150 ${
              tab === t.id ? 'bg-white text-ink shadow-[0_1px_3px_rgb(43_32_51/0.12)]' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
            {t.count != null && (
              <Fig key={t.count} className={`print-in text-[11px] rounded-full px-1.5 py-0.5 ${tab === t.id ? 'bg-brand-tint text-brand-deep' : 'bg-paper-deep text-ink-soft'}`}>
                {t.count}
              </Fig>
            )}
          </button>
        ))}
      </div>
      {tab === 'preview' ? (
        <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview">
          <div className="flex items-baseline justify-between px-4 pt-3 text-[13px] text-ink-soft">
            <span className="truncate">Iklan <Fig>{String(index + 1).padStart(2, '0')}</Fig>{row?.adName.trim() && ` · ${row.adName.trim()}`}</span>
            <span className="hidden sm:inline shrink-0 ml-3">mengikuti kartu yang sedang diisi</span>
          </div>
          <Preview ngoName={ngoName} row={row} />
        </div>
      ) : (
        <div id="panel-ledger" role="tabpanel" aria-labelledby="tab-ledger">
          <Ledger lines={lines} activeRowId={activeRowId} onJump={onJump} />
        </div>
      )}
    </section>
  );
}
