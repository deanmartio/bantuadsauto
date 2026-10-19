import { Icon, Fig } from './ui';

// The teller's validation stamp: violet double ring carrying the submission number and the
// receipt date, both from the server (WIB), so they always agree with each other.
function Stamp({ submission }) {
  const tail = submission.submissionId.split('-').slice(-1)[0];
  return (
    <div className="stamp-in w-36 h-36 rounded-full border-[3px] border-plum p-1 -rotate-6 shrink-0" aria-label={`Diterima, nomor ${submission.submissionId}`}>
      <div className="w-full h-full rounded-full border border-plum flex flex-col items-center justify-center text-center text-plum-deep">
        <span className="text-[11px] font-bold tracking-[0.12em]">KAWANBANTU</span>
        <span className="text-[15px] font-extrabold tracking-[0.14em] my-0.5">DITERIMA</span>
        <Fig className="text-xs font-medium">{tail}</Fig>
        <Fig className="text-[11px]">{submission.receivedAt.slice(0, 10)}</Fig>
      </div>
    </div>
  );
}

export default function SuccessScreen({ ngoName, exportedFiles, submission, onStartOver, onEdit, onReDownload }) {
  const submitted = Boolean(submission);

  return (
    <div className="max-w-xl mx-auto pt-4 sm:pt-8 pb-24">
      <section className="leaf p-6 sm:p-8 mb-4">
        {submitted ? (
          <>
            <div className="flex items-start justify-between gap-6 mb-5">
              <div>
                <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink tracking-[-0.02em]">Submission Terkirim</h1>
                <p className="text-[15px] text-ink-soft mt-2 leading-relaxed">
                  Tim KawanBantu sudah menerima submission <span className="font-semibold text-ink">{ngoName}</span>.
                  Tidak perlu kirim lewat WhatsApp lagi.
                </p>
              </div>
              <div className="hidden sm:block shrink-0 pt-1"><Stamp submission={submission} /></div>
            </div>
            <div className="sm:hidden mb-5"><Stamp submission={submission} /></div>
            <dl className="border-t border-line pt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
              <dt className="text-ink-soft">Nomor submission</dt>
              <dd className="font-mono font-medium text-ink break-all select-all">{submission.submissionId}</dd>
              <dt className="text-ink-soft">Salinan ZIP</dt>
              <dd className="text-ink break-all">Tersimpan di folder Downloads</dd>
            </dl>
            <p className="text-[13px] text-ink-faint mt-3">Sebutkan nomor ini kalau menanyakan status iklan ke tim KawanBantu.</p>
          </>
        ) : (
          <>
            <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink tracking-[-0.02em]">File ZIP Sudah Diunduh</h1>
            <p className="text-[15px] text-ink-soft mt-2 leading-relaxed">
              Satu langkah lagi: kirim file ini ke tim KawanBantu lewat WhatsApp atau grup chat.
            </p>
            <div className="flex items-start gap-3 border-t border-line pt-4 mt-5">
              <span className="w-9 h-9 rounded-lg bg-paper text-brand-deep flex items-center justify-center shrink-0">
                <Icon name="download" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink break-all">{exportedFiles?.zipFilename}</p>
                <p className="text-[13px] text-ink-soft mt-0.5">Ada di folder Downloads. Kirim 1 file ZIP ini saja, tidak perlu di-extract.</p>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="rounded-2xl bg-brand-tint px-6 py-5 mb-8">
        <h2 className="text-sm font-bold text-ink mb-1">{submitted ? 'Satu hal dari kamu' : 'Jangan lupa'}</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          Terima permintaan Partnership Ads dari @kawanbantu di Instagram, supaya iklan bisa jalan dengan identitas NGO-mu.
        </p>
      </section>

      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={onReDownload} className="btn-secondary w-full">
          <Icon name="download" /> {submitted ? 'Download Salinan ZIP' : 'Download Ulang File ZIP'}
        </button>
        {!submitted && (
          <button type="button" onClick={onEdit} className="btn-ghost justify-center w-full !py-2.5">
            <Icon name="arrowLeft" /> Edit Submission
          </button>
        )}
        <button type="button" onClick={onStartOver} className="btn-ghost justify-center w-full !py-2.5">
          <Icon name="plus" /> Buat Submission Baru
        </button>
      </div>
    </div>
  );
}
