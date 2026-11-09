import { useState } from 'react';
import { Icon } from './ui';
import { getExpandedCreatives } from '../utils/driveUtils';
import { useFolderFiles } from '../utils/folderService';

// How much Meta shows before "...lihat selengkapnya" in feed, and before it cuts a headline.
export const PRIMARY_VISIBLE = 125;
export const HEADLINE_VISIBLE = 40;

function driveFileId(link) {
  const m = link.match(/\/file\/d\/([A-Za-z0-9_-]{10,})/) || link.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  return m ? m[1] : null;
}

function domainOf(url) {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// The frame takes the file's real proportions from the thumbnail once it loads, within what Meta's
// feed shows: anything taller than 4:5 (a 9:16 video) is masked to 4:5, wider than 1.91:1 is cropped.
function Media({ creative, onRatio }) {
  const [failed, setFailed] = useState(false);
  const [ratio, setRatio] = useState(1);
  // A folder link has no file id of its own; look the folder up and take the Nth file.
  const folder = useFolderFiles(creative?.isFolder ? creative.link : '');
  const id = !creative ? null
    : creative.isFolder ? folder.files[creative.folderFileIndex]?.id || null
    : driveFileId(creative.link);
  const isVideo = !creative || creative.type === 'Video';
  const showing = id && !failed;
  return (
    <div className="relative bg-ink overflow-hidden" style={{ aspectRatio: showing ? ratio : 16 / 9 }}>
      {showing ? (
        <img
          key={id}
          src={`https://drive.google.com/thumbnail?id=${id}&sz=w640`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={e => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            if (w && h) {
              const r = Math.min(1.91, Math.max(4 / 5, w / h));
              setRatio(r);
              onRatio?.(w / h);
            }
          }}
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 bg-paper-deep flex flex-col items-center justify-center gap-2 text-ink-faint px-6 text-center">
          <Icon name={creative?.isFolder ? 'folder' : isVideo ? 'video' : 'image'} className="w-8 h-8" strokeWidth={1.5} />
          <span className="text-xs">
            {!creative ? 'Video atau gambar dari Google Drive'
              : creative.isFolder && folder.status === 'loading' ? 'Membuka folder Drive…'
              : creative.isFolder ? `File ke-${creative.folderFileIndex + 1} dari folder Drive`
              : 'Pratinjau belum tersedia. Cek link dan akses "Anyone with the link".'}
          </span>
        </div>
      )}
      {isVideo && showing && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <span className="w-12 h-12 rounded-full bg-ink/55 text-white flex items-center justify-center">
            <Icon name="play" className="w-5 h-5 ml-0.5" />
          </span>
        </span>
      )}
    </div>
  );
}

// One small tile per file in the picker. Separate, numbered tiles (not carousel dots or arrows)
// so it reads as N separate ads, which is what Meta gets.
function Tile({ creative, n, active, onPick }) {
  const [failed, setFailed] = useState(false);
  const folder = useFolderFiles(creative.isFolder ? creative.link : '');
  const id = creative.isFolder ? folder.files[creative.folderFileIndex]?.id || null : driveFileId(creative.link);
  return (
    <li>
      <button type="button" onClick={onPick} aria-pressed={active} aria-label={`Lihat pratinjau iklan ${n}`}
        className={`block w-11 rounded-lg p-0.5 transition-colors duration-150 ${active ? 'bg-plum' : 'hover:bg-line'}`}>
        <span className="relative block aspect-[4/5] rounded-md overflow-hidden bg-paper-deep">
          {id && !failed ? (
            <img src={`https://drive.google.com/thumbnail?id=${id}&sz=w160`} alt="" referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover" onError={() => setFailed(true)} />
          ) : (
            <Icon name={creative.type === 'Video' ? 'video' : 'image'} className="absolute inset-0 m-auto w-4 h-4 text-ink-faint" />
          )}
        </span>
        <span className={`block text-center font-mono text-[11px] leading-5 tabular-nums ${active ? 'text-white' : 'text-ink-soft'}`}>{n}</span>
      </button>
    </li>
  );
}

export default function AdPreview({ ngoName, row }) {
  const creatives = getExpandedCreatives(row);
  const [pick, setPick] = useState(0);
  const [ratio, setRatio] = useState(1);
  const idx = Math.min(pick, Math.max(0, creatives.length - 1));
  const text = row.primaryText.trim();
  const shown = [...text].length > PRIMARY_VISIBLE ? [...text].slice(0, PRIMARY_VISIBLE).join('').trimEnd() : text;
  const truncated = shown !== text;
  const name = ngoName.trim() || 'Nama NGO';
  const domain = domainOf(row.campaignLink);

  return (
    <figure className="m-0">
      {creatives.length > 1 && (
        <div className="mb-3">
          <p className="text-[13px] text-ink">
            Jadi <span className="font-semibold">{creatives.length} iklan terpisah</span> di Meta
          </p>
          <p className="text-xs text-ink-soft mb-2">Teksnya sama, {creatives[0].type === 'Video' ? 'videonya' : 'gambarnya'} berbeda. Pilih untuk melihat:</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Pilih iklan untuk pratinjau">
            {creatives.map((c, i) => (
              <Tile key={`${i}-${c.link}`} creative={c} n={i + 1} active={i === idx} onPick={() => setPick(i)} />
            ))}
          </ul>
          <p className="mt-3 text-[13px] text-ink-soft truncate" aria-live="polite">
            Pratinjau: <span className="font-semibold text-ink">{creatives[idx]?.adName.trim().replace(/^\d+$/, '') || `Iklan ${idx + 1}`}</span>
          </p>
        </div>
      )}
      <div className={`mx-auto w-full max-w-[272px] rounded-2xl border border-line bg-white overflow-hidden shadow-[0_6px_20px_-12px_rgb(43_32_51/0.35)]`}>
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="w-8 h-8 rounded-full bg-brand-tint text-brand-deep flex items-center justify-center text-sm font-bold shrink-0">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-semibold text-ink truncate">
              {name} <span className="font-normal text-ink-soft">dengan</span> kawanbantu
            </p>
            <p className="text-[11px] text-ink-faint">Bersponsor</p>
          </div>
        </div>
        <p className="px-3 pb-2.5 text-[13px] leading-snug text-ink whitespace-pre-line break-words">
          {text ? shown : <span className="text-ink-faint">Primary text akan muncul di sini.</span>}
          {truncated && <span className="text-ink-faint">… lihat selengkapnya</span>}
        </p>
        <Media key={`${idx}-${creatives[idx]?.link || ''}`} creative={creatives[idx]} onRatio={setRatio} />
        <div className="flex items-center gap-3 px-3 py-2.5 bg-paper">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase text-ink-faint truncate">{domain || 'link campaign'}</p>
            <p className="text-[13px] font-semibold text-ink leading-tight line-clamp-2 break-words">
              {row.headline.trim() || <span className="text-ink-faint font-normal">Headline</span>}
            </p>
          </div>
          <span className="shrink-0 text-xs font-semibold bg-paper-deep text-ink rounded-md px-2.5 py-1.5">
            Pelajari Selengkapnya
          </span>
        </div>
      </div>
      {ratio < 0.79 && (
        <p className="mx-auto max-w-[272px] mt-2.5 text-xs text-ink-soft text-center leading-relaxed">
          Video vertikal tampil 4:5 di feed. Di Reels dan Stories tampil penuh 9:16.
        </p>
      )}
      <figcaption className="sr-only">Perkiraan tampilan di feed. Aslinya bisa sedikit berbeda.</figcaption>
    </figure>
  );
}
