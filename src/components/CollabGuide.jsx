import { useState, forwardRef } from 'react';
import { Icon, Fig } from './ui';
import { KAWANBANTU_IG } from '../utils/driveUtils';

// One tap copies the username, so the NGO can paste it into Instagram's collaborator search.
export function CopyHandle({ className = '' }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(KAWANBANTU_IG);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked: the name is short enough to type */ }
  }
  return (
    <button type="button" onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-plum/30 bg-white px-2.5 py-1 font-mono text-xs font-medium text-plum-deep hover:bg-plum-tint transition-colors duration-150 ${className}`}
      aria-label={copied ? 'Username tersalin' : `Salin username ${KAWANBANTU_IG}`}>
      @{KAWANBANTU_IG}
      <span className="flex items-center gap-1 font-sans text-[11px] font-semibold text-ink-soft">
        <Icon name={copied ? 'check' : 'copy'} className="w-3.5 h-3.5" strokeWidth={copied ? 2.5 : 2} />
        {copied ? 'Tersalin' : 'Salin'}
      </span>
    </button>
  );
}

/* ---------- Visual guide: five small phone screens, the thing to tap ringed in purple ---------- */

function Phone({ children }) {
  return (
    <div className="relative aspect-[9/15] rounded-[18px] border-[3px] border-ink/80 bg-white overflow-hidden shadow-[0_8px_18px_-12px_rgb(43_32_51/0.5)]" aria-hidden="true">
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-ink/80 z-10" />
      <div className="absolute inset-0 pt-3.5 flex flex-col text-[9px] leading-tight text-ink">{children}</div>
    </div>
  );
}

// The element to tap: purple ring plus a pulsing "finger" dot.
function Tap({ children, className = '' }) {
  return (
    <span className={`relative rounded-md ring-2 ring-plum bg-plum-tint text-plum-deep font-semibold ${className}`}>
      {children}
      <span className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5">
        <span className="absolute inset-0 rounded-full bg-plum/60 motion-safe:animate-ping" />
        <span className="absolute inset-[3px] rounded-full bg-plum border border-white" />
      </span>
    </span>
  );
}

const Line = ({ w }) => <div className="h-1 rounded-full bg-line" style={{ width: w }} />;
const Photo = ({ className = '' }) => (
  <div className={`bg-gradient-to-br from-brand-tint via-paper-deep to-plum-tint flex items-center justify-center ${className}`}>
    <Icon name="play" className="w-4 h-4 text-ink/30" />
  </div>
);
const TopBar = ({ left, title, right }) => (
  <div className="flex items-center justify-between px-2 py-1.5 border-b border-line">
    <span className="text-ink-soft">{left}</span><span className="font-semibold">{title}</span><span className="text-brand-deep font-semibold">{right}</span>
  </div>
);

const SCREENS = [
  {
    caption: <>Buka postingan, ketuk <b>⋯</b></>,
    screen: (
      <>
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          <span className="w-4 h-4 rounded-full bg-brand/50" />
          <span className="font-semibold flex-1">akun_ngo</span>
          <Tap className="px-1.5 text-[11px] leading-none py-0.5">⋯</Tap>
        </div>
        <Photo className="flex-1" />
        <div className="px-2 py-2 space-y-1"><Line w="80%" /><Line w="55%" /></div>
      </>
    ),
  },
  {
    caption: <>Pilih <b>Edit</b></>,
    screen: (
      <>
        <Photo className="flex-1 opacity-40" />
        <div className="absolute inset-0 bg-ink/25" />
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-xl px-2 pt-1.5 pb-3 flex flex-col gap-0.5">
          <div className="mx-auto w-6 h-1 rounded-full bg-line-strong mb-1" />
          <span className="px-1 py-1 text-ink-soft">Arsipkan</span>
          <Tap className="px-1 py-1">Edit</Tap>
          <span className="px-1 py-1 text-ink-soft">Sematkan</span>
          <span className="px-1 py-1 text-danger">Hapus</span>
        </div>
      </>
    ),
  },
  {
    caption: <>Ketuk <b>Tandai orang</b></>,
    screen: (
      <>
        <TopBar left="Batal" title="Edit info" right="Selesai" />
        <Photo className="h-[42%]" />
        <div className="px-2 py-1.5 space-y-1 border-b border-line"><Line w="85%" /><Line w="60%" /></div>
        <div className="px-2 pt-1.5 flex flex-col gap-1">
          <Tap className="px-1 py-1">Tandai orang</Tap>
          <span className="px-1 py-1 text-ink-soft">Tambah lokasi</span>
        </div>
      </>
    ),
  },
  {
    caption: <>Ketuk <b>Undang kolaborator</b></>,
    screen: (
      <>
        <TopBar left="‹" title="Tandai orang" right="Selesai" />
        <Photo className="flex-1" />
        <p className="text-center text-ink-faint py-1.5">Ketuk foto untuk menandai</p>
        <div className="px-2 pb-3"><Tap className="block text-center py-1.5">Undang kolaborator</Tap></div>
      </>
    ),
  },
  {
    caption: <>Cari <b>kawanbantu</b>, pilih, lalu <b>Selesai</b></>,
    screen: (
      <>
        <TopBar left="‹" title="Kolaborator" right="Selesai" />
        <div className="px-2 py-2">
          <div className="flex items-center gap-1 rounded-md bg-paper px-1.5 py-1">
            <span className="text-ink-faint">⌕</span><span className="font-medium">kawanbantu</span><span className="w-px h-2.5 bg-ink motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="px-2">
          <Tap className="flex items-center gap-1.5 px-1.5 py-1.5">
            <span className="w-4 h-4 rounded-full bg-brand shrink-0" />
            <span className="flex-1 min-w-0"><span className="block">kawanbantu</span><span className="block font-normal text-ink-faint">KawanBantu</span></span>
          </Tap>
        </div>
        <div className="px-2 pt-2 space-y-2 opacity-50">
          {[0, 1].map(i => <div key={i} className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-paper-deep" /><Line w="50%" /></div>)}
        </div>
      </>
    ),
  },
];

function VisualGuide() {
  return (
    <div>
      <ol className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
        {SCREENS.map((s, i) => (
          <li key={i} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <Phone>{s.screen}</Phone>
            <p className="flex gap-1.5 mt-2.5 text-[12px] leading-snug text-ink [&_b]:font-semibold">
              <Fig className="w-5 h-5 rounded-full bg-plum text-white text-[10px] font-medium flex items-center justify-center shrink-0">{i + 1}</Fig>
              <span className="pt-0.5">{s.caption}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className="sm:hidden text-xs text-ink-faint mt-1 flex items-center gap-1">Geser untuk langkah berikutnya <Icon name="arrowRight" className="w-3 h-3" /></p>
    </div>
  );
}

/* ---------- Review screen section: guide + one tick per Instagram post ---------- */

function PostCheck({ post, nudge, onSet }) {
  const id = `collab-${post.rowId}-${post.pi}`;
  const tone = post.confirmed ? 'border-brand/40 bg-brand-tint' : nudge ? 'border-danger/50 bg-danger-tint' : 'border-line-strong bg-white';
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border px-3.5 py-3 transition-colors duration-150 ${tone}`}>
      <label htmlFor={id} className="flex flex-1 min-w-[12rem] items-center gap-3 cursor-pointer">
        <input id={id} type="checkbox" checked={post.confirmed} onChange={e => onSet(post.rowId, post.pi, e.target.checked)}
          className="w-5 h-5 shrink-0 rounded accent-brand-deep cursor-pointer" />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink truncate">{post.adName}</span>
          <span className={`block text-xs ${post.confirmed ? 'text-brand-deep font-medium' : 'text-ink-soft'}`}>
            {post.confirmed ? '@kawanbantu sudah diundang' : 'Centang setelah @kawanbantu diundang'}
          </span>
        </span>
      </label>
      <a href={post.postLink} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-brand-deep hover:bg-brand-tint shrink-0">
        Buka postingan <Icon name="external" className="w-3.5 h-3.5" />
      </a>
    </li>
  );
}

const CollabStep = forwardRef(function CollabStep({ posts, nudge, onSet }, ref) {
  const done = posts.filter(p => p.confirmed).length;
  const allDone = done === posts.length;
  const [showGuide, setShowGuide] = useState(null); // null = follow allDone
  const guideOpen = showGuide ?? !allDone;

  return (
    <section ref={ref} className={`leaf p-5 sm:p-6 mb-4 scroll-mt-6 ${allDone ? '' : 'ring-2 ring-plum/30'}`} aria-labelledby="collab-title">
      <div className="flex items-start gap-3.5 mb-5">
        <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white ${allDone ? 'bg-brand' : 'bg-plum'}`}>
          <Icon name={allDone ? 'check' : 'users'} className="w-5 h-5" strokeWidth={allDone ? 2.5 : 2} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="collab-title" className="text-base font-semibold text-ink leading-snug">
            {allDone ? '@kawanbantu sudah diundang di semua postingan' : 'Langkah terakhir: undang @kawanbantu sebagai kolaborator'}
          </h2>
          <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
            {allDone
              ? 'Terima kasih! Kamu bisa kirim sekarang.'
              : 'Iklan dari postingan Instagram hanya bisa dibuat kalau @kawanbantu jadi kolaborator. Sekitar 1 menit per postingan.'}
          </p>
        </div>
        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${allDone ? 'bg-brand-tint text-brand-deep' : 'bg-plum-tint text-plum-deep'}`}>
          <Fig>{done}/{posts.length}</Fig>
        </span>
      </div>

      {guideOpen ? (
        <div className="rounded-xl bg-paper p-4 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <p className="text-sm font-semibold text-ink">Caranya, dari aplikasi Instagram:</p>
            <CopyHandle />
          </div>
          <VisualGuide />
          {allDone && (
            <button type="button" onClick={() => setShowGuide(false)} className="btn-ghost mt-3 !text-[13px]">
              <Icon name="chevronUp" /> Tutup panduan
            </button>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => setShowGuide(true)} className="btn-ghost -mt-2 mb-3 !text-[13px] !text-brand-deep">
          <Icon name="chevronDown" /> Lihat panduan lagi
        </button>
      )}

      <p className="text-sm font-semibold text-ink mb-2">Centang tiap postingan setelah @kawanbantu diundang:</p>
      <ul className="flex flex-col gap-2">
        {posts.map(p => <PostCheck key={`${p.rowId}-${p.pi}`} post={p} nudge={nudge} onSet={onSet} />)}
      </ul>
      <p className="text-xs text-ink-soft mt-3 leading-relaxed">
        Tim KawanBantu yang menerima undangannya. Jangan lupa juga terima permintaan Partnership Ads dari @kawanbantu di Instagram.
      </p>
    </section>
  );
});

export default CollabStep;
