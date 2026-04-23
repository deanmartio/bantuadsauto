import CreativeInput from './CreativeInput';
import TextVariantInput from './TextVariantInput';

export default function AdRow({ row, index, totalRows, isDuplicate, onUpdate, onDelete }) {
  function updateField(field, value) {
    onUpdate(index, { ...row, [field]: value });
  }

  function updateCreative(ci, key, value) {
    const updated = row.creatives.map((c, i) => i === ci ? { ...c, [key]: value } : c);
    updateField('creatives', updated);
  }

  function addCreative() {
    if (row.creatives.length >= 5) return;
    updateField('creatives', [...row.creatives, { link: '', type: 'Video' }]);
  }

  function removeCreative(ci) {
    updateField('creatives', row.creatives.filter((_, i) => i !== ci));
  }

  function updateVariant(field, vi, value) {
    const updated = row[field].map((v, i) => i === vi ? value : v);
    updateField(field, updated);
  }

  function addVariant(field) {
    if (row[field].length >= 5) return;
    updateField(field, [...row[field], '']);
  }

  function removeVariant(field, vi) {
    updateField(field, row[field].filter((_, i) => i !== vi));
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border mb-4 overflow-hidden ${isDuplicate ? 'border-red-400' : 'border-gray-100'}`}>
      {/* Row header */}
      <div className={`flex items-center justify-between px-4 py-3 ${isDuplicate ? 'bg-red-50' : 'bg-[#F7F2EA]'}`}>
        <span className="text-sm font-bold text-[#2B2033]">Iklan #{index + 1}</span>
        <button
          type="button"
          onClick={() => onDelete(index)}
          disabled={totalRows === 1}
          className="text-xs font-semibold text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Hapus Iklan
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Ad Name + Campaign Link */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div>
            <label className="block text-sm font-semibold text-[#2B2033] mb-1">
              Nama Iklan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={row.adName}
              onChange={e => updateField('adName', e.target.value)}
              placeholder="Contoh: Adek Rara"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent ${
                isDuplicate ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {isDuplicate && (
              <p className="text-xs text-red-500 mt-1 font-semibold">Nama iklan duplikat</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2B2033] mb-1">
              Link Halaman Campaign <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={row.campaignLink}
              onChange={e => updateField('campaignLink', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent"
            />
          </div>
        </div>

        {/* Creatives */}
        <div className="lg:col-span-4">
          <label className="block text-sm font-semibold text-[#2B2033] mb-1">
            Creatives <span className="text-red-500">*</span>
          </label>
          {row.creatives.map((creative, ci) => (
            <CreativeInput
              key={ci}
              creative={creative}
              index={ci}
              total={row.creatives.length}
              onUpdate={updateCreative}
              onRemove={removeCreative}
            />
          ))}
          {row.creatives.length < 5 && (
            <button
              type="button"
              onClick={addCreative}
              className="text-xs font-semibold text-[#2A9E99] border border-[#2A9E99] rounded-full px-3 py-1 hover:bg-teal-50 transition-colors mt-1"
            >
              + Tambah Creative
            </button>
          )}
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Pastikan link Google Drive diset ke "Anyone with the link can view". Format yang diterima Meta: .jpg atau .png untuk gambar; .mp4 untuk video.
          </p>
        </div>

        {/* Primary Text */}
        <div className="lg:col-span-3">
          <TextVariantInput
            label="Primary Text"
            note="Tambah hingga 5 varian. Meta akan mengujinya secara otomatis."
            values={row.primaryTexts}
            onUpdate={(vi, val) => updateVariant('primaryTexts', vi, val)}
            onAdd={() => addVariant('primaryTexts')}
            onRemove={vi => removeVariant('primaryTexts', vi)}
          />
        </div>

        {/* Headline */}
        <div className="lg:col-span-3">
          <TextVariantInput
            label="Headline"
            note="Tambah hingga 5 varian."
            values={row.headlines}
            onUpdate={(vi, val) => updateVariant('headlines', vi, val)}
            onAdd={() => addVariant('headlines')}
            onRemove={vi => removeVariant('headlines', vi)}
          />
        </div>
      </div>
    </div>
  );
}
