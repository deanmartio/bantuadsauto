import { useEffect } from 'react';
import { Icon } from './ui';

function Rule({ ok, children }) {
  return (
    <li className="flex items-start gap-2 text-[13px] text-ink leading-relaxed">
      <Icon name={ok ? 'check' : 'x'} className={`w-4 h-4 mt-0.5 shrink-0 ${ok ? 'text-brand-deep' : 'text-ink-faint'}`} strokeWidth={2.5} />
      <span>{children}</span>
    </li>
  );
}

function Tree({ ok, lines, note }) {
  return (
    <div className={`rounded-xl border p-3 ${ok ? 'border-brand/40 bg-brand-tint/50' : 'border-line-strong bg-paper'}`}>
      <p className={`flex items-center gap-1.5 text-xs font-bold mb-2 ${ok ? 'text-brand-deep' : 'text-ink-soft'}`}>
        <Icon name={ok ? 'check' : 'x'} className="w-3.5 h-3.5" strokeWidth={2.5} /> {ok ? 'Benar' : 'Salah'}
      </p>
      <div className="space-y-1">
        {lines.map(([depth, kind, name]) => (
          <p key={name + depth} className="flex items-center gap-1.5 font-mono text-xs text-ink" style={{ paddingLeft: `${depth}rem` }}>
            <Icon name={kind} className="w-3.5 h-3.5 text-ink-soft shrink-0" /> {name}
          </p>
        ))}
      </div>
      <p className="text-xs text-ink-soft mt-2 leading-snug">{note}</p>
    </div>
  );
}

export default function DriveGuideModal({ onClose }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="drive-guide-title"
        className="leaf w-full max-w-lg max-h-[90vh] overflow-y-auto !shadow-[0_24px_48px_-20px_rgb(43_32_51/0.45)]">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line">
          <div>
            <h2 id="drive-guide-title" className="text-lg font-bold text-ink leading-tight">Panduan Upload Link Google Drive</h2>
            <p className="text-[13px] text-ink-soft mt-1">Atur file atau folder dengan benar sebelum mengisi form.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !p-1.5 shrink-0" aria-label="Tutup">
            <Icon name="x" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section className="rounded-xl bg-brand-tint px-4 py-3.5">
            <h3 className="text-sm font-bold text-ink">Wajib: share ke "Anyone with the link"</h3>
            <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
              Klik kanan file atau folder di Google Drive, pilih <span className="font-semibold text-ink">Share</span>, lalu{' '}
              <span className="font-semibold text-ink">Change to Anyone with the link</span>, lalu copy link. Tanpa ini, file tidak bisa diambil.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="font-mono text-xs w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">1</span>
              Link ke satu file langsung
              <span className="text-xs font-semibold text-brand-deep bg-brand-tint rounded-full px-2 py-0.5">Paling simpel</span>
            </h3>
            <p className="text-[13px] text-ink-soft mt-2 ml-8 leading-relaxed">
              Untuk satu video atau satu gambar. Share file-nya dan copy linknya, bentuknya{' '}
              <span className="font-mono text-xs text-ink">drive.google.com/file/d/…</span>. Pilih Video atau Gambar sesuai isinya.
            </p>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="font-mono text-xs w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center">2</span>
              Link ke folder berisi beberapa file
            </h3>
            <div className="ml-8 mt-2 space-y-4">
              <p className="text-[13px] text-ink-soft leading-relaxed">Untuk beberapa video atau gambar sekaligus, misalnya 3 versi video.</p>
              <ul className="space-y-1.5">
                <Rule ok>Satu folder khusus untuk iklan ini, isinya hanya file yang siap tayang.</Rule>
                <Rule ok>Tidak ada sub-folder di dalamnya.</Rule>
                <Rule ok>Isi "berapa file di dalamnya" sesuai jumlah file di folder.</Rule>
                <Rule>Shortcut ke file (bukan file aslinya). Cek: kalau klik kanan ada "Show original location", itu shortcut.</Rule>
                <Rule>Folder berisi folder lain, atau folder campuran banyak iklan.</Rule>
                <Rule>File yang masih draft, atau folder kosong.</Rule>
              </ul>
              <p className="text-[13px] text-ink-soft leading-relaxed">File diambil sesuai urutan nama di Google Drive, jadi pastikan urutannya sudah benar.</p>
              <div className="grid grid-cols-2 gap-3">
                <Tree ok note='Isinya langsung file, isi "3 file".'
                  lines={[[0, 'folder', 'Adek_Rara/'], [1, 'video', 'video_1.mp4'], [1, 'video', 'video_2.mp4'], [1, 'video', 'video_3.mp4']]} />
                <Tree note="Folder berisi folder lain tidak bisa diproses."
                  lines={[[0, 'folder', 'Semua_Iklan/'], [1, 'folder', 'Adek_Rara/'], [2, 'video', 'video_1.mp4'], [1, 'folder', 'Pak_Sani/'], [2, 'video', 'video_1.mp4']]} />
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 pb-6">
          <button type="button" onClick={onClose} className="btn-secondary w-full">Mengerti, Tutup Panduan</button>
        </div>
      </div>
    </div>
  );
}
