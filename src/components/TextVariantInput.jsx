export default function TextVariantInput({ label, note, values, onUpdate, onAdd, onRemove, maxCount = 5 }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-[#2B2033]">{label}</label>
        {values.length < maxCount && (
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-semibold text-[#2A9E99] border border-[#2A9E99] rounded-full px-2 py-0.5 hover:bg-teal-50 transition-colors"
          >
            + Tambah
          </button>
        )}
      </div>
      {note && <p className="text-xs text-gray-500 mb-2">{note}</p>}
      <div className="space-y-2">
        {values.map((val, i) => (
          <div key={i} className="flex gap-2 items-start">
            <textarea
              value={val}
              onChange={e => onUpdate(i, e.target.value)}
              rows={label === 'Headline' ? 1 : 3}
              placeholder={`Varian ${i + 1}`}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="mt-1 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none shrink-0"
                aria-label="Hapus varian"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
