import { useEffect, useId, useState } from 'react';
import { isFolderLink, itemKind, isInstagramLink } from '../utils/driveUtils';
import { Icon, Fig } from './ui';
import { useFolderFiles } from '../utils/folderService';

// Real platform marks, so each line says at a glance where it comes from.
function PlatformMark({ link }) {
  const gid = useId();
  const kind = itemKind(link);
  if (kind === 'drive') {
    return (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" aria-hidden="true">
        <path fill="#0F9D58" d="M8 3h8l7 12h-8z" /><path fill="#FFC107" d="M8 3 1 15l4 6 7-12z" /><path fill="#4285F4" d="M5 21h14l4-6H9z" />
      </svg>
    );
  }
  if (kind === 'post' && isInstagramLink(link)) {
    return (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" aria-hidden="true">
        <defs><linearGradient id={gid} x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#F9A23B" /><stop offset=".5" stopColor="#E1306C" /><stop offset="1" stopColor="#833AB4" /></linearGradient></defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill={`url(#${gid})`} />
        <circle cx="12" cy="12" r="4.3" fill="none" stroke="#fff" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.3" fill="#fff" />
      </svg>
    );
  }
  if (kind === 'post') {
    return (
      <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path fill="#fff" d="M13.4 22v-7.3h2.4l.4-2.9h-2.8V10c0-.8.3-1.4 1.4-1.4h1.5V6.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.1H8v2.9h2.5V22z" />
      </svg>
    );
  }
  return <Icon name="link" className="w-[18px] h-[18px] text-ink-faint" />;
}

// Folder links: KawanBantu's server lists the folder, so the file count fills itself in (still
// editable). If the folder can't be read, the NGO counts the files by hand as before.
function FolderCount({ creative, index, onUpdate }) {
  const folder = useFolderFiles(creative.link);
  const detected = folder.status === 'ok' ? folder.files.length : null;

  useEffect(() => {
    if (detected && !creative.countManual && creative.count !== detected) {
      onUpdate(index, { count: detected });
    }
  }, [detected, creative.countManual, creative.count, index, onUpdate]);

  return (
    <div className="col-span-full mt-1 border-t border-line pt-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${detected ? 'text-brand-deep' : 'text-warn'}`}>
          <Icon name={detected ? 'check' : 'folder'} className="w-3.5 h-3.5" strokeWidth={detected ? 2.5 : 2} />
          {folder.status === 'loading' && 'Mengecek isi folder…'}
          {detected != null && detected > 0 && <><Fig>{detected}</Fig> file ditemukan</>}
          {detected === 0 && 'Folder ini tidak berisi video atau gambar'}
          {(folder.status === 'error' || folder.status === 'idle') && 'Berapa file di dalam folder ini?'}
        </span>
        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
          <input
            type="number"
            min={1}
            value={creative.count || 1}
            onChange={e => onUpdate(index, { count: Math.max(1, parseInt(e.target.value) || 1), countManual: true })}
            className="field !w-20 !py-1 text-center font-mono tabular-nums"
            aria-label="Jumlah file dalam folder"
          />
          file
        </label>
      </div>
      <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">
        {folder.status === 'error' && folder.error ? `${folder.error} ` : ''}
        Hanya file yang langsung ada di folder ini, tanpa sub-folder. Setiap file jadi 1 iklan, sesuai urutan nama di Drive.
      </p>
    </div>
  );
}

function describe(link) {
  const kind = itemKind(link);
  if (kind === 'drive') return isFolderLink(link) ? 'Folder Google Drive' : 'File Google Drive';
  if (kind === 'post') return `Postingan ${isInstagramLink(link) ? 'Instagram' : 'Facebook'}, caption aslinya dipakai`;
  if (kind === 'unknown') return 'Bukan link Drive, Instagram atau Facebook';
  return 'Link belum diisi';
}

// Every link pasted at once (one per line, or separated by spaces), with or without https://.
function linksIn(text) {
  return (text || '').split(/\s+/).map(t => t.trim())
    .filter(t => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/|$)/i.test(t));
}

// One line of a card's content list. The link decides what it is: a Google Drive file or folder
// (asks Video or Gambar) or an existing Instagram/Facebook post (uses the post's own video and caption).
export default function CreativeInput({ creative, index, inputId, invalid, onUpdate, onRemove }) {
  const kind = itemKind(creative.link);
  const isFolder = kind === 'drive' && isFolderLink(creative.link);

  return (
    <div className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] gap-x-3 gap-y-1.5 items-center rounded-2xl px-3 py-2.5 ${invalid ? 'bg-danger-tint ring-1 ring-danger/40' : 'bg-paper'}`}>
      <span className="w-9 h-9 rounded-[10px] bg-white shadow-[0_1px_2px_rgb(43_32_51/0.08)] flex items-center justify-center">
        <PlatformMark link={creative.link} />
      </span>
      <div className="min-w-0">
        <input
          id={inputId}
          type="url"
          value={creative.link}
          onChange={e => onUpdate(index, { link: e.target.value })}
          placeholder="Tempel link di sini"
          aria-label={`Link konten ${index + 1}`}
          aria-invalid={invalid || undefined}
          className="w-full bg-transparent rounded-md px-1 -mx-1 py-0.5 text-[13px] font-medium text-ink truncate focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <p className="text-xs text-ink-soft truncate">
          <Fig className="text-ink-faint mr-1.5">{index + 1}</Fig>{describe(creative.link)}
        </p>
      </div>
      {kind === 'drive' && (
        <div className="col-start-2 row-start-2 justify-self-start sm:col-start-3 sm:row-start-1 inline-flex rounded-full bg-white p-[3px] shadow-[0_1px_2px_rgb(43_32_51/0.08)]" role="group" aria-label="Jenis file">
          {['Video', 'Gambar'].map(value => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate(index, { type: value })}
              aria-pressed={creative.type === value}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-150 ${
                creative.type === value ? 'bg-brand-deep text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={() => onRemove(index)} className="col-start-3 row-start-1 sm:col-start-4 btn-ghost !p-1.5 hover:!text-danger hover:!bg-white"
        aria-label={`Hapus konten ${index + 1}`} title="Hapus">
        <Icon name="trash" />
      </button>
      {isFolder && <FolderCount creative={creative} index={index} onUpdate={onUpdate} />}
    </div>
  );
}

// The three kinds of link a card accepts, shown as their real logos under the Creatives note.
export function SourceLogos() {
  return (
    <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Link yang bisa ditambahkan">
      {[
        { link: 'drive.google.com/x', label: 'Google Drive' },
        { link: 'instagram.com/x', label: 'Instagram' },
        { link: 'facebook.com/x', label: 'Facebook' },
      ].map(s => (
        <li key={s.label} className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span className="w-8 h-8 rounded-[9px] bg-white shadow-[0_1px_3px_rgb(43_32_51/0.12)] flex items-center justify-center">
            <PlatformMark link={s.link} />
          </span>
          {s.label}
        </li>
      ))}
    </ul>
  );
}

// The dashed slot under the list: paste one link or many, or type one and press Enter.
export function PasteSlot({ inputId, invalid, onAdd }) {
  const [draft, setDraft] = useState('');

  function commit(text) {
    const links = linksIn(text);
    const list = links.length ? links : text.trim() ? [text.trim()] : [];
    if (list.length) onAdd(list);
    setDraft('');
  }

  return (
    <label htmlFor={inputId}
      className={`mt-2.5 flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed px-3.5 py-2.5 cursor-text transition-colors duration-150 focus-within:border-brand focus-within:bg-white ${
        invalid ? 'border-danger bg-danger-tint' : 'border-line-strong hover:border-brand/60'}`}>
      <Icon name="plus" className="w-4 h-4 text-brand-deep shrink-0" strokeWidth={2.5} />
      <input
        id={inputId}
        type="text"
        inputMode="url"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onPaste={e => { e.preventDefault(); commit(e.clipboardData?.getData('text') || ''); }}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit(draft); } }}
        onBlur={() => commit(draft)}
        placeholder="Tempel link Drive, IG atau FB"
        aria-invalid={invalid || undefined}
        className="w-full min-w-0 bg-transparent text-[13px] text-ink placeholder:text-ink-soft focus:outline-none"
      />
    </label>
  );
}
