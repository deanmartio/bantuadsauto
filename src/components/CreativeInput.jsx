import { isFolderLink } from '../utils/driveUtils';

export default function CreativeInput({ creative, index, total, onUpdate, onRemove }) {
  const isFolder = isFolderLink(creative.link);
  const hasLink = creative.link.trim().length > 0;

  return (
    <div className="border border-gray-200 rounded-lg p-2.5 mb-2 bg-gray-50">
      {/* URL row */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs font-semibold text-gray-400 w-5 shrink-0 text-center">#{index + 1}</span>
        <input
          type="url"
          value={creative.link}
          onChange={e => onUpdate(index, 'link', e.target.value)}
          placeholder="Tempel link Google Drive di sini"
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent"
        />
      </div>

      {/* Always-visible content rule hint */}
      <p className="pl-6 text-[10.5px] text-gray-400 mb-2 leading-snug">
        Link harus mengarah langsung ke <span className="font-semibold text-gray-500">file video/gambar</span> atau{' '}
        <span className="font-semibold text-gray-500">folder yang isinya HANYA file siap pakai</span> — bukan folder
        yang berisi folder lain.
      </p>

      {/* Folder file-count notice */}
      {isFolder && (
        <div className="pl-6 mb-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-xs font-bold text-amber-700 mb-1.5">
              📁 Link Folder Terdeteksi — Wajib Diisi
            </p>
            <p className="text-[10.5px] text-amber-600 mb-2 leading-snug">
              Hitung jumlah file (video/gambar) yang ada <span className="font-semibold">langsung di dalam folder ini</span>.
              Jangan hitung sub-folder. Script akan mendownload file ke-1, ke-2, … sesuai urutan di Drive.
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-amber-700">Jumlah file dalam folder:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={creative.count || 1}
                onChange={e => onUpdate(index, 'count', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 border border-amber-300 rounded-md px-2 py-1 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
              <span className="text-xs text-amber-600">file</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle + remove row */}
      <div className="flex items-center justify-between pl-6">
        <div className="flex rounded-md overflow-hidden border border-[#2A9E99]">
          <button
            type="button"
            onClick={() => onUpdate(index, 'type', 'Video')}
            className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
              creative.type === 'Video'
                ? 'bg-[#2A9E99] text-white'
                : 'bg-white text-[#2A9E99] hover:bg-teal-50'
            }`}
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => onUpdate(index, 'type', 'Gambar')}
            className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
              creative.type === 'Gambar'
                ? 'bg-[#2A9E99] text-white'
                : 'bg-white text-[#2A9E99] hover:bg-teal-50'
            }`}
          >
            Gambar
          </button>
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-gray-400 hover:text-red-500 transition-colors text-sm font-semibold leading-none"
            aria-label="Hapus creative"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
