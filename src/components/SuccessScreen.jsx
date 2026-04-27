export default function SuccessScreen({ ngoName, exportedFiles, onStartOver }) {

  return (
    <div className="max-w-xl mx-auto pt-10 pb-24 flex flex-col items-center text-center">
      {/* Check circle */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
      >
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-[#2B2033] mb-2">File Berhasil Diunduh!</h1>
      <p className="text-sm text-gray-500 mb-8">
        Dua file submission sudah tersimpan di folder <span className="font-semibold text-[#2B2033]">Downloads</span> kamu.
      </p>

      {/* Files downloaded */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">File yang diunduh</p>
        <div className="flex items-start gap-3 mb-3">
          <span className="mt-0.5 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#2B2033] break-all">{exportedFiles?.xlsxFilename}</p>
            <p className="text-xs text-gray-400">Template Meta Ads — upload ke Ads Manager</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#2B2033] break-all">{exportedFiles?.pyFilename}</p>
            <p className="text-xs text-gray-400">Script download creative dari Google Drive</p>
          </div>
        </div>
      </div>

      {/* Next step card */}
      <div className="w-full bg-[#FFFBF2] border border-yellow-200 rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-3">Langkah Selanjutnya</p>
        <ol className="space-y-3">
          {[
            'Pastikan kedua file sudah ada di folder Downloads kamu.',
            'Kirim kedua file tersebut ke tim KawanBantu — bisa lewat WhatsApp langsung atau grup chat yang sudah ada.',
            'Tim KawanBantu akan segera memproses iklanmu!',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-yellow-400 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-[#2B2033]">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          type="button"
          onClick={onStartOver}
          className="w-full border-2 border-gray-200 text-gray-500 font-semibold rounded-xl px-6 py-3 text-sm hover:bg-gray-50 transition-colors"
        >
          Buat Submission Baru
        </button>
      </div>
    </div>
  );
}
