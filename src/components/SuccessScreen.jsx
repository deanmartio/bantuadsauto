import { Icon } from './ui';

export default function SuccessScreen({ ngoName, exportedFiles, submission, onStartOver, onEdit, onReDownload }) {
  const submitted = Boolean(submission);

  return (
    <div className="max-w-lg mx-auto pt-6 sm:pt-10 pb-24">
      <div className="w-14 h-14 rounded-full bg-brand text-white flex items-center justify-center mb-5 shadow-[0_6px_16px_-6px_rgb(42_158_153/0.6)]">
        <Icon name="check" className="w-7 h-7" strokeWidth={2.5} />
      </div>

      {submitted ? (
        <>
          <h1 className="text-2xl font-bold text-ink mb-2">Submission terkirim</h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-6">
            Tim KawanBantu sudah menerima submission <span className="font-semibold text-ink">{ngoName}</span>.
            Tidak perlu kirim lewat WhatsApp lagi. Salinan file ZIP juga tersimpan di folder Downloads.
          </p>

          <section className="card p-5 mb-4">
            <p className="text-sm text-ink-soft">Nomor submission</p>
            <p className="text-xl font-bold text-brand-deep break-all select-all tabular-nums mt-0.5">{submission.submissionId}</p>
            <p className="text-xs text-ink-faint mt-1.5">
              Diterima {submission.receivedAt} WIB. Sebutkan nomor ini kalau menanyakan status iklan ke tim KawanBantu.
            </p>
          </section>

          <section className="rounded-2xl bg-brand-tint p-5 mb-8">
            <h2 className="text-sm font-bold text-ink mb-1.5">Satu hal dari kamu</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Terima permintaan Partnership Ads dari @kawanbantu di Instagram, supaya iklan bisa jalan dengan identitas NGO-mu.
            </p>
          </section>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-ink mb-2">File ZIP sudah diunduh</h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-6">
            Satu langkah lagi: kirim file ini ke tim KawanBantu lewat WhatsApp atau grup chat.
          </p>

          <section className="card p-5 mb-4">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-cream text-ink-soft flex items-center justify-center shrink-0">
                <Icon name="download" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink break-all">{exportedFiles?.zipFilename}</p>
                <p className="text-xs text-ink-soft mt-0.5">Ada di folder Downloads. Kirim 1 file ZIP ini saja, tidak perlu di-extract.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-brand-tint p-5 mb-8">
            <h2 className="text-sm font-bold text-ink mb-1.5">Jangan lupa</h2>
            <p className="text-sm text-ink-soft leading-relaxed">
              Terima permintaan Partnership Ads dari @kawanbantu di Instagram, supaya iklan bisa jalan dengan identitas NGO-mu.
            </p>
          </section>
        </>
      )}

      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={onReDownload} className="btn-secondary w-full">
          <Icon name="download" /> {submitted ? 'Download salinan ZIP' : 'Download ulang ZIP'}
        </button>
        {!submitted && (
          <button type="button" onClick={onEdit} className="btn-ghost justify-center w-full !py-2.5">
            <Icon name="arrowLeft" /> Edit submission
          </button>
        )}
        <button type="button" onClick={onStartOver} className="btn-ghost justify-center w-full !py-2.5">
          <Icon name="plus" /> Buat submission baru
        </button>
      </div>
    </div>
  );
}
