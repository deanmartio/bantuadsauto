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

function Media({ creative, index, total }) {
  const [failed, setFailed] = useState(false);
  // A folder link has no file id of its own; look the folder up and take the Nth file.
  const folder = useFolderFiles(creative?.isFolder ? creative.link : '');
  const id = !creative ? null
    : creative.isFolder ? folder.files[creative.folderFileIndex]?.id || null
    : driveFileId(creative.link);
  const isVideo = !creative || creative.type === 'Video';
  return (
    <div className="relative aspect-video bg-paper-deep overflow-hidden">
      {id && !failed ? (
        <img
          key={id}
          src={`https://drive.google.com/thumbnail?id=${id}&sz=w640`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-faint px-6 text-center">
          <Icon name={creative?.isFolder ? 'folder' : isVideo ? 'video' : 'image'} className="w-8 h-8" strokeWidth={1.5} />
          <span className="text-xs">
            {!creative ? 'Video atau gambar dari Google Drive'
              : creative.isFolder && folder.status === 'loading' ? 'Membuka folder Drive…'
              : creative.isFolder ? `File ke-${creative.folderFileIndex + 1} dari folder Drive`
              : 'Pratinjau belum tersedia. Cek link dan akses "Anyone with the link".'}
          </span>
        </div>
      )}
      {isVideo && id && !failed && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <span className="w-12 h-12 rounded-full bg-ink/55 text-white flex items-center justify-center">
            <Icon name="play" className="w-5 h-5 ml-0.5" />
          </span>
        </span>
      )}
      {total > 1 && (
        <span className="absolute top-2 right-2 text-[11px] font-semibold bg-ink/70 text-white rounded-full px-2 py-0.5 tabular-nums">
          {index + 1}/{total}
        </span>
      )}
    </div>
  );
}

export default function AdPreview({ ngoName, row }) {
  const creatives = getExpandedCreatives(row);
  const [pick, setPick] = useState(0);
  const idx = Math.min(pick, Math.max(0, creatives.length - 1));
  const text = row.primaryText.trim();
  const shown = [...text].length > PRIMARY_VISIBLE ? [...text].slice(0, PRIMARY_VISIBLE).join('').trimEnd() : text;
  const truncated = shown !== text;
  const name = ngoName.trim() || 'Nama NGO';
  const domain = domainOf(row.campaignLink);

  return (
    <figure className="m-0">
      <div className="mx-auto w-full max-w-[288px] rounded-2xl border border-line bg-white overflow-hidden shadow-[0_6px_20px_-12px_rgb(43_32_51/0.35)]">
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
        <Media key={`${idx}-${creatives[idx]?.link || ''}`} creative={creatives[idx]} index={idx} total={creatives.length} />
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
      {creatives.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3" role="group" aria-label="Pilih creative untuk pratinjau">
          {creatives.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPick(i)}
              aria-label={`Pratinjau creative ${i + 1}`}
              aria-pressed={i === idx}
              className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? 'w-5 bg-brand' : 'w-1.5 bg-line hover:bg-ink-faint'}`}
            />
          ))}
        </div>
      )}
      <figcaption className="sr-only">Perkiraan tampilan di feed. Aslinya bisa sedikit berbeda.</figcaption>
    </figure>
  );
}
