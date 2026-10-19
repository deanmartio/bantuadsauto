import { useState } from 'react';
import { getDuplicateAdNames } from '../utils/validation';
import { getSubmissionSummary } from '../utils/zipGenerator';
import { getExpandedCreatives, getExpandedPosts, getLocalDateString } from '../utils/driveUtils';
import { isSubmitEnabled } from '../utils/submitService';
import { Icon } from './ui';

const MODE_LABEL = { drive: 'File dari Google Drive', existing_post: 'Postingan yang sudah ada', mixed: 'Drive dan postingan' };

export default function ReviewScreen({ ngoName, adRows, onBack, onExport, onSubmit, onContinueWithoutSend }) {
  const duplicateNames = getDuplicateAdNames(adRows);
  const summary = getSubmissionSummary(adRows);
  const canSubmit = isSubmitEnabled();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [downloaded, setDownloaded] = useState(false); // ZIP already saved; a retry only re-sends

  async function handleSend() {
    setSending(true);
    setSendError('');
    try {
      await onSubmit({ retry: downloaded });
    } catch (err) {
      setDownloaded(true);
      setSendError(err.message || 'Gagal mengirim.');
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-36">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Review sebelum dikirim</h1>
        <p className="text-sm text-ink-soft mt-1.5">Cek sekali lagi. Setelah dikirim, tim KawanBantu langsung menyiapkan iklanmu.</p>
      </div>

      <section className="card p-5 mb-4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          {[
            ['NGO', ngoName],
            ['Jumlah iklan', String(summary.adCount)],
            ['Sumber', MODE_LABEL[summary.mode]],
            ['Tanggal', getLocalDateString()],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-ink-soft">{k}</dt>
              <dd className="text-sm font-semibold text-ink mt-0.5 break-words tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {duplicateNames.size > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-warn-tint px-4 py-3 text-sm text-ink mb-4" role="status">
          <Icon name="alert" className="w-4 h-4 mt-0.5 text-warn shrink-0" />
          Ada nama iklan yang sama di lebih dari satu kartu. Sebaiknya kembali dan bedakan namanya.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {adRows.map((row, i) => {
          const isPost = row.source === 'post';
          const ads = isPost ? getExpandedPosts(row) : getExpandedCreatives(row);
          return (
            <section key={row.id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink break-words">{row.adName.trim()}</h2>
                  <a href={row.campaignLink.trim()} target="_blank" rel="noreferrer"
                    className="text-xs font-medium text-brand-deep hover:underline break-all">
                    {row.campaignLink.trim()}
                  </a>
                </div>
                <span className="text-xs font-semibold text-ink-soft bg-cream rounded-full px-2.5 py-1 shrink-0 tabular-nums">
                  Kartu {i + 1} · {ads.length} iklan
                </span>
              </div>

              {!isPost && (
                <div className="grid sm:grid-cols-2 gap-4 text-sm border-t border-line pt-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft mb-1">Headline</p>
                    <p className="text-ink font-semibold break-words">{row.headline.trim()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-ink-soft mb-1">Primary text</p>
                    <p className="text-ink line-clamp-3 whitespace-pre-line break-words">{row.primaryText.trim()}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-line pt-3">
                <p className="text-xs text-ink-soft mb-1.5">Iklan yang akan dibuat</p>
                <ul className="flex flex-col gap-1">
                  {ads.map((ad, ai) => (
                    <li key={ai} className="flex items-center gap-2 text-sm text-ink min-w-0">
                      <Icon name={isPost ? 'link' : ad.type === 'Video' ? 'video' : 'image'} className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                      <span className="font-medium shrink-0">{ad.adName}</span>
                      <span className="text-xs text-ink-faint truncate">{isPost ? ad.postLink : ad.filename}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line z-40">
        {sendError && (
          <div className="border-b border-line bg-danger-tint" role="alert">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-start gap-2.5">
              <Icon name="alert" className="w-4 h-4 mt-0.5 text-danger shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-ink">{sendError}</p>
                <p className="text-ink-soft mt-0.5">
                  File ZIP sudah tersimpan di folder Downloads. Coba kirim lagi, atau kirim file itu ke tim KawanBantu via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={onBack} disabled={sending} className="btn-secondary">
            <Icon name="arrowLeft" /> Kembali edit
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {sendError && (
              <button type="button" onClick={onContinueWithoutSend} disabled={sending} className="btn-ghost">
                Saya kirim via WhatsApp saja
              </button>
            )}
            {canSubmit ? (
              <button type="button" onClick={handleSend} disabled={sending} className="btn-primary">
                <Icon name="send" />
                {sending ? 'Mengirim… jangan tutup halaman' : sendError ? 'Coba kirim lagi' : 'Kirim ke KawanBantu'}
              </button>
            ) : (
              <button type="button" onClick={onExport} className="btn-primary">
                <Icon name="download" /> Download ZIP
              </button>
            )}
          </div>
        </div>
        {canSubmit && !sendError && (
          <p className="max-w-3xl mx-auto px-4 pb-3 -mt-1 text-xs text-ink-faint sm:text-right">
            Salinan file ZIP otomatis tersimpan di folder Downloads.
          </p>
        )}
      </div>
    </div>
  );
}
