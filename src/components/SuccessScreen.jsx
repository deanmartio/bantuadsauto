export default function SuccessScreen({ ngoName, exportedFiles, onStartOver, onEdit, onReDownload }) {

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
        File submission (ZIP) sudah tersimpan di folder <span className="font-semibold text-[#2B2033]">Downloads</span> kamu.
      </p>

      {/* File downloaded */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">File yang diunduh</p>
        <div className="flex items-start gap-3 mb-3">
          <span className="mt-0.5 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-[#2B2033] break-all">{exportedFiles?.zipFilename}</p>
            <p className="text-xs text-gray-400">Berisi template Meta Ads (.xlsx) + script download creative (.py)</p>
          </div>
        </div>
        <div className="pl-11 space-y-1">
          <p className="text-xs text-gray-400 break-all">↳ {exportedFiles?.xlsxFilename}</p>
          <p className="text-xs text-gray-400 break-all">↳ {exportedFiles?.pyFilename}</p>
        </div>
      </div>

      {/* Primary CTA — send the file */}
      <div className="w-full bg-[#2A9E99] rounded-2xl p-5 mb-4 text-left">
        <p className="text-xs font-bold text-white/70 uppercase tracking-wide mb-1">Langkah Pertama</p>
        <p className="text-white font-bold text-base mb-1">Kirim file ZIP ini ke tim KawanBantu</p>
        <p className="text-white/80 text-xs">via WhatsApp atau grup chat. Cukup kirim 1 file ZIP saja.</p>
      </div>

      {/* Next step card */}
      <div className="w-full bg-[#FFFBF2] border border-yellow-200 rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide mb-3">Selanjutnya (dikerjakan tim KawanBantu)</p>
        <ol className="space-y-3">
          {[
            'Extract file ZIP → didapat file .xlsx dan .py.',
            'Jalankan script Python → download semua creative dari Google Drive otomatis.',
            'Upload creative ke Meta Media Library → script ambil Video ID otomatis → XLSX terupdate.',
            'Import XLSX ke Ads Manager: ☰ → Import & Export → Import Ads.',
            'Kalau NGO ini pakai Partnership Ads: publish dulu tanpa Partnership Ads, baru setelah ads live, edit satu-satu untuk aktifkan Partnership Ads (NGO = identitas pertama, KawanBantu = kedua). Jangan set Partnership Ads saat masih proses import — akan gagal.',
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
          onClick={onReDownload}
          className="w-full flex items-center justify-center gap-2 text-white font-bold rounded-xl px-6 py-3 text-sm transition-opacity"
          style={{ background: 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Ulang File ZIP
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 border-2 border-[#2A9E99] text-[#2A9E99] font-semibold rounded-xl px-6 py-3 text-sm hover:bg-teal-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Edit Submission
        </button>
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
