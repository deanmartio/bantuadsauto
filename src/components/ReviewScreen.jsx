import { validate, getDuplicateAdNames } from '../utils/validation';

export default function ReviewScreen({ ngoName, adRows, onBack, onExport }) {
  const { errors, hasDuplicates } = validate(ngoName, adRows);
  const hasErrors = errors.length > 0;
  const duplicateNames = getDuplicateAdNames(adRows);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2B2033] mb-1">Review Sebelum Export</h1>
        <p className="text-sm text-gray-500">Pastikan semua data sudah benar sebelum mengirim ke tim KawanBantu.</p>
      </div>

      {/* NGO info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-bold text-[#2B2033] uppercase tracking-wide mb-2 opacity-60">Informasi NGO</h2>
        <p className="text-xs text-gray-400 mb-0.5">Nama NGO</p>
        <p className="text-sm font-semibold text-[#2B2033]">{ngoName || <span className="text-red-400">—belum diisi—</span>}</p>
      </div>

      {/* Error banners */}
      {hasDuplicates && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold mb-3">
          Ada nama iklan yang duplikat. Kembali dan perbaiki sebelum export.
        </div>
      )}
      {errors.some(e => e.includes('wajib diisi') || e.includes('kosong') || e.includes('Minimal')) && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold mb-3">
          Ada field yang masih kosong.
        </div>
      )}

      {/* Ad cards */}
      <div className="space-y-4 mb-6">
        {adRows.map((row, i) => {
          const isDuplicate = duplicateNames.has(row.adName.trim().toLowerCase());
          const filledCreatives = row.creatives.filter(c => c.link.trim());
          const filledPT = row.primaryTexts.filter(t => t.trim());
          const filledHL = row.headlines.filter(h => h.trim());

          return (
            <div
              key={row.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${isDuplicate ? 'border-red-300' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Iklan #{i + 1}</p>
                  <p className={`font-bold text-[#2B2033] ${!row.adName.trim() ? 'text-red-400' : ''}`}>
                    {row.adName.trim() || '—belum diisi—'}
                  </p>
                  {isDuplicate && <p className="text-xs text-red-500 font-semibold mt-0.5">Nama duplikat</p>}
                </div>
                <span className="text-xs bg-[#F7F2EA] px-2 py-1 rounded-full text-[#2B2033] font-semibold shrink-0">
                  {filledCreatives.length} creative
                </span>
              </div>

              {/* Campaign link per ad */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-0.5">Link Halaman Campaign</p>
                {row.campaignLink.trim()
                  ? <p className="text-xs font-semibold text-[#2A9E99] break-all">{row.campaignLink}</p>
                  : <p className="text-xs text-red-400 font-semibold">—belum diisi—</p>
                }
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-gray-100 pt-3">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Creatives ({filledCreatives.length})</p>
                  {filledCreatives.length === 0
                    ? <p className="text-red-400">Belum ada link</p>
                    : filledCreatives.map((c, ci) => (
                        <p key={ci} className="text-gray-600 truncate">
                          [{c.type}] {c.link.slice(0, 40)}…
                        </p>
                      ))
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Primary Text ({filledPT.length})</p>
                  {filledPT.length === 0
                    ? <p className="text-red-400">Belum diisi</p>
                    : filledPT.map((t, ti) => (
                        <p key={ti} className="text-gray-600 line-clamp-1">
                          {ti + 1}. {t.slice(0, 60)}{t.length > 60 ? '…' : ''}
                        </p>
                      ))
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Headline ({filledHL.length})</p>
                  {filledHL.length === 0
                    ? <p className="text-red-400">Belum diisi</p>
                    : filledHL.map((h, hi) => (
                        <p key={hi} className="text-gray-600 line-clamp-1">
                          {hi + 1}. {h.slice(0, 60)}{h.length > 60 ? '…' : ''}
                        </p>
                      ))
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 justify-end max-w-full z-40">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-[#2A9E99] text-[#2A9E99] font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-teal-50 transition-colors"
        >
          ← Kembali Edit
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={hasErrors}
          className="text-white font-bold rounded-xl px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          style={{ background: hasErrors ? '#9ca3af' : 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
        >
          Export Sekarang
        </button>
      </div>
    </div>
  );
}
