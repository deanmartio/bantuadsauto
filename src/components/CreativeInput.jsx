import { isFolderLink } from '../utils/driveUtils';

export default function CreativeInput({ creative, index, total, onUpdate, onRemove }) {
  const isFolder = isFolderLink(creative.link);

  return (
    <div className="border border-gray-200 rounded-lg p-2.5 mb-2 bg-gray-50">
      {/* URL row */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-semibold text-gray-400 w-5 shrink-0 text-center">#{index + 1}</span>
        <input
          type="url"
          value={creative.link}
          onChange={e => onUpdate(index, 'link', e.target.value)}
          placeholder="Tempel link Google Drive di sini"
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent"
        />
      </div>

      {/* Folder file-count notice */}
      {isFolder && (
        <div className="flex items-center gap-2 pl-6 mb-2">
          <span className="text-xs text-amber-600 font-semibold">📁 Link folder —</span>
          <label className="text-xs text-amber-600">berapa file di dalamnya?</label>
          <input
            type="number"
            min={1}
            max={20}
            value={creative.count || 1}
            onChange={e => onUpdate(index, 'count', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 border border-amber-300 rounded-md px-2 py-0.5 text-xs text-center font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50"
          />
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
