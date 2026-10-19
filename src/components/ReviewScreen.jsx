import { useState } from 'react';
import { getDuplicateAdNames } from '../utils/validation';
import { getSubmissionSummary } from '../utils/zipGenerator';
import { getExpandedCreatives, getExpandedPosts, getLocalDateString } from '../utils/driveUtils';
import { isSubmitEnabled } from '../utils/submitService';
import { Icon, Fig } from './ui';
import SendProgress from './SendProgress';

const MODE_LABEL = { drive: 'File dari Google Drive', existing_post: 'Postingan yang sudah ada', mixed: 'Drive dan postingan' };

export default function ReviewScreen({ ngoName, adRows, onBack, onExport, onSubmit, onContinueWithoutSend }) {
  const duplicateNames = getDuplicateAdNames(adRows);
  const summary = getSubmissionSummary(adRows);
  const canSubmit = isSubmitEnabled();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [downloaded, setDownloaded] = useState(false); // ZIP already saved; a retry only re-sends
  const [stage, setStage] = useState(null);
  const [bytes, setBytes] = useState(0);

  async function handleSend() {
    setSending(true);
    setSendError('');
    try {
      await onSubmit({ retry: downloaded, onStage: (st, size) => { setStage(st); if (size) setBytes(size); } });
    } catch (err) {
      setDownloaded(true);
      setSendError(err.message || 'Gagal mengirim.');
      setSending(false);
      setStage(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.75rem] leading-tight font-bold text-ink tracking-[-0.02em]">Review Sebelum Kirim</h1>
        <p className="text-[15px] text-ink-soft mt-2">Cek sekali lagi. Setelah dikirim, tim KawanBantu langsung menyiapkan iklanmu.</p>
      </div>

      <section className="leaf p-5 mb-4">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          {[
            ['NGO', ngoName],
            ['Iklan di Meta', String(summary.adCount)],
            ['Sumber', MODE_LABEL[summary.mode]],
            ['Tanggal', getLocalDateString()],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-ink-soft">{k}</dt>
              <dd className={`text-[15px] font-semibold text-ink mt-0.5 break-words ${k === 'Iklan di Meta' || k === 'Tanggal' ? 'font-mono font-medium tabular-nums' : ''}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {duplicateNames.size > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl bg-warn-tint px-4 py-3 text-sm text-ink mb-4" role="status">
          <Icon name="alert" className="w-4 h-4 mt-0.5 text-warn shrink-0" />
          Ada nama iklan yang sama di lebih dari satu iklan. Sebaiknya kembali dan bedakan namanya.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {adRows.map((row, i) => {
          const isPost = row.source === 'post';
          const ads = isPost ? getExpandedPosts(row) : getExpandedCreatives(row);
          // Same running numbers as the ledger beside the form.
          const offset = adRows.slice(0, i).reduce((n, r) => n + (r.source === 'post' ? getExpandedPosts(r) : getExpandedCreatives(r)).length, 0);
          return (
            <section key={row.id} className="leaf p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink break-words">{row.adName.trim()}</h2>
                  <a href={row.campaignLink.trim()} target="_blank" rel="noreferrer"
                    className="text-xs font-medium text-brand-deep hover:underline break-all">
                    {row.campaignLink.trim()}
                  </a>
                </div>
                <span className="text-xs font-semibold text-ink-soft bg-paper rounded-full px-2.5 py-1 shrink-0 tabular-nums">
                  Iklan <Fig>{String(i + 1).padStart(2, '0')}</Fig> · <Fig>{ads.length}</Fig> iklan di Meta
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
                <p className="text-xs font-semibold text-ink-soft mb-1">Iklan di Meta yang akan dibuat</p>
                <ol className="flex flex-col">
                  {ads.map((ad, ai) => (
                    <li key={ai} className="grid grid-cols-[2.5rem_minmax(0,1fr)_4.5rem] gap-x-2 items-baseline py-1.5 border-b border-line last:border-b-0 text-sm">
                      <Fig className="text-xs text-plum-deep">{String(offset + ai + 1).padStart(3, '0')}</Fig>
                      <span className="min-w-0">
                        <span className="font-semibold text-ink">{ad.adName}</span>
                        <span className="text-xs text-ink-faint ml-2 break-all">{isPost ? ad.postLink : ad.filename}</span>
                      </span>
                      <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-soft text-right">{isPost ? 'POST' : ad.type === 'Video' ? 'VIDEO' : 'GAMBAR'}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6">
        {sending && stage ? (
          <SendProgress stage={stage} bytes={bytes} />
        ) : (
          <section className="leaf p-5 sm:p-6">
            {sendError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-danger-tint px-4 py-3 mb-4" role="alert">
                <Icon name="alert" className="w-4 h-4 mt-0.5 text-danger shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-ink">{sendError}</p>
                  <p className="text-ink-soft mt-0.5">
                    File ZIP sudah tersimpan di folder Downloads. Coba kirim lagi, atau kirim file itu ke tim KawanBantu via WhatsApp.
                  </p>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={onBack} className="btn-secondary">
                <Icon name="arrowLeft" /> Kembali Edit
              </button>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {sendError && (
                  <button type="button" onClick={onContinueWithoutSend} className="btn-ghost">
                    Saya kirim via WhatsApp saja
                  </button>
                )}
                {canSubmit ? (
                  <button type="button" onClick={handleSend} className="btn-primary">
                    <Icon name="send" /> {sendError ? 'Coba Kirim Lagi' : 'Kirim ke KawanBantu'}
                  </button>
                ) : (
                  <button type="button" onClick={onExport} className="btn-primary">
                    <Icon name="download" /> Download ZIP
                  </button>
                )}
              </div>
            </div>
            {canSubmit && !sendError && (
              <p className="text-[13px] text-ink-soft mt-3 sm:text-right">Salinan file ZIP otomatis tersimpan di folder Downloads.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
