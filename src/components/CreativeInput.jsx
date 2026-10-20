import { isFolderLink } from '../utils/driveUtils';
import { useEffect } from 'react';
import { Icon, Fig } from './ui';
import { useFolderFiles } from '../utils/folderService';

// Folder links: KawanBantu's server lists the folder, so the file count fills itself in (still
// editable). If the folder can't be read, the NGO counts the files by hand as before.
function FolderCount({ creative, index, onUpdate }) {
  const folder = useFolderFiles(creative.link);
  const detected = folder.status === 'ok' ? folder.files.length : null;

  useEffect(() => {
    if (detected && !creative.countManual && creative.count !== Math.min(20, detected)) {
      onUpdate(index, { count: Math.min(20, detected) });
    }
  }, [detected, creative.countManual, creative.count, index, onUpdate]);

  const tone = detected ? 'bg-brand-tint' : 'bg-warn-tint';
  return (
    <div className={`mt-2.5 ml-7 rounded-lg px-3 py-2.5 ${tone}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className={`flex items-center gap-1.5 text-[13px] font-medium ${detected ? 'text-brand-deep' : 'text-warn'}`}>
          <Icon name={detected ? 'check' : 'folder'} className="w-3.5 h-3.5" strokeWidth={detected ? 2.5 : 2} />
          {folder.status === 'loading' && 'Mengecek isi folder…'}
          {detected != null && detected > 0 && <>Terdeteksi <Fig>{detected}</Fig> file di folder ini</>}
          {detected === 0 && 'Folder ini tidak berisi video atau gambar'}
          {(folder.status === 'error' || folder.status === 'idle') && 'Link folder: berapa file di dalamnya?'}
        </span>
        <label className="flex items-center gap-2 text-[13px] text-ink-soft">
          <input
            type="number"
            min={1}
            max={20}
            value={creative.count || 1}
            onChange={e => onUpdate(index, { count: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)), countManual: true })}
            className="field !w-16 !py-1 text-center font-mono tabular-nums"
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

export default function CreativeInput({ creative, index, total, inputId, invalid, onUpdate, onRemove }) {
  const isFolder = isFolderLink(creative.link);

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-ink-faint w-5 shrink-0 tabular-nums">{index + 1}</span>
        <input
          id={inputId}
          type="url"
          value={creative.link}
          onChange={e => onUpdate(index, 'link', e.target.value)}
          placeholder="Tempel link Google Drive (file atau folder)"
          aria-label={`Link Google Drive creative ${index + 1}`}
          aria-invalid={invalid || undefined}
          className="field min-w-0 flex-1"
        />
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="btn-ghost !p-1.5 shrink-0 hover:!text-danger"
            aria-label={`Hapus creative ${index + 1}`}
          >
            <Icon name="trash" />
          </button>
        )}
      </div>

      <div className="mt-2 ml-7 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="inline-flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="Jenis file">
          {[
            { value: 'Video', icon: 'video' },
            { value: 'Gambar', icon: 'image' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onUpdate(index, 'type', opt.value)}
              aria-pressed={creative.type === opt.value}
              title={opt.value}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors duration-150 ${
                creative.type === opt.value ? 'bg-brand text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon name={opt.icon} className="w-3.5 h-3.5" />
              <span>{opt.value}</span>
            </button>
          ))}
        </div>
      </div>

      {isFolder && <FolderCount creative={creative} index={index} onUpdate={onUpdate} />}
    </div>
  );
}
