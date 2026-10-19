import { isFolderLink } from '../utils/driveUtils';
import { Icon } from './ui';

export default function CreativeInput({ creative, index, total, inputId, invalid, onUpdate, onRemove }) {
  const isFolder = isFolderLink(creative.link);

  return (
    <div className="rounded-xl border border-line bg-paper/70 p-2.5">
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

      {isFolder && (
        <div className="mt-2.5 ml-7 rounded-lg bg-warn-tint px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-warn">
              <Icon name="folder" className="w-3.5 h-3.5" />
              Link folder: berapa file di dalamnya?
            </span>
            <label className="flex items-center gap-2 text-xs text-ink-soft">
              <input
                type="number"
                min={1}
                max={20}
                value={creative.count || 1}
                onChange={e => onUpdate(index, 'count', Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                className="field !w-16 !py-1 text-center font-semibold tabular-nums"
                aria-label="Jumlah file dalam folder"
              />
              file
            </label>
          </div>
          <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">
            Hitung file yang ada langsung di folder ini, tanpa sub-folder. Setiap file jadi 1 iklan, sesuai urutan di Drive.
          </p>
        </div>
      )}
    </div>
  );
}
