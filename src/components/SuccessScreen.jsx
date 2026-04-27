const WA_NUMBER = '6281234567890'; // replace with real KawanBantu WhatsApp number

export default function SuccessScreen({ ngoName, exportedFiles, onStartOver }) {
  const waMessage = encodeURIComponent(
    `Halo KawanBantu! Saya dari ${ngoName} ingin mengirimkan file submission iklan kami.\n\nFile yang dilampirkan:\n1. ${exportedFiles?.xlsxFilename}\n2. ${exportedFiles?.pyFilename}\n\nMohon bantuannya. Terima kasih!`
  );
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;

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
            'Klik tombol "Kirim via WhatsApp" di bawah.',
            'Lampirkan kedua file tersebut di chat WhatsApp yang terbuka.',
            'Kirim pesan — tim KawanBantu akan segera memproses iklanmu!',
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
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 text-white font-bold rounded-xl px-6 py-3.5 text-sm transition-opacity hover:opacity-90"
          style={{ background: '#25D366' }}
        >
          {/* WhatsApp icon */}
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Kirim via WhatsApp ke KawanBantu
        </a>

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
