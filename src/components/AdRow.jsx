import { useState } from 'react';
import CreativeInput, { PasteSlot } from './CreativeInput';
import DriveGuideModal from './DriveGuideModal';
import { HEADLINE_VISIBLE } from './AdPreview';
import { Icon, Label, FieldError, Hint, Budget, Fig } from './ui';
import { fieldId } from '../utils/validation';
import { getExpandedAds, newItem, needsAdText } from '../utils/driveUtils';

export const PRIMARY_MAX = 1000;

// "Iklan 2, creative 1: Link belum diisi." -> "Link belum diisi." (the field already says where it is)
const short = msg => msg?.replace(/^Iklan \d+(, [a-z]+ \d+)?: /, '');

function summaryLabel(row) {
  const ads = getExpandedAds(row);
  if (ads.length === 0) return 'Belum ada konten';
  const videos = ads.filter(a => a.kind === 'drive' && a.type === 'Video').length;
  const images = ads.filter(a => a.kind === 'drive' && a.type !== 'Video').length;
  const posts = ads.filter(a => a.kind === 'post').length;
  return [videos && `${videos} video`, images && `${images} gambar`, posts && `${posts} postingan`].filter(Boolean).join(' + ');
}

// One part of the card: a plain title and note, then its fields. Parts are set apart by space,
// not by boxes, rails or icons.
function Part({ title, note, aside, children }) {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="text-[17px] font-bold text-ink tracking-[-0.01em] leading-tight">{title}</h3>
          {note && <p className="text-[13px] text-ink-soft mt-0.5">{note}</p>}
        </div>
        {aside}
      </div>
      {children}
    </div>
  );
}

export default function AdRow({ row, index, totalRows, isDuplicate, issues, showIssues, collapsed, active, onActivate, onToggleCollapse, onUpdate, onDelete }) {
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const items = row.items || [];
  const ads = getExpandedAds(row);
  const hasPosts = ads.some(a => a.kind === 'post');
  const hasDrive = ads.some(a => a.kind === 'drive');
  const askText = needsAdText(row);
  const errorFor = id => (showIssues ? short(issues.find(i => i.id === id)?.message) : null);
  const complete = issues.length === 0 && !isDuplicate;
  const problems = issues.length + (isDuplicate ? 1 : 0);
  const number = String(index + 1).padStart(2, '0');

  function updateField(field, value) {
    onUpdate(index, { ...row, [field]: value });
  }

  // A changed link is a different file or post, so its collaborator tick (review screen) resets.
  function updateItem(li, patch) {
    updateField('items', items.map((item, i) => {
      if (i !== li) return item;
      const next = { ...item, ...patch };
      if ('link' in patch && patch.link.trim() !== (item.link || '').trim()) next.collab = false;
      return next;
    }));
  }

  // Links from the paste slot: one or many, each becomes its own line.
  function addLinks(links) {
    updateField('items', [...items, ...links.map(link => ({ ...newItem(), link }))]);
  }

  const nameError = errorFor(fieldId.adName(row)) || (isDuplicate ? 'Nama iklan ini sudah dipakai iklan lain.' : null);
  const linkError = errorFor(fieldId.campaignLink(row));
  const primaryError = errorFor(fieldId.primaryText(row));
  const headlineError = errorFor(fieldId.headline(row));
  const primaryLength = [...(row.primaryText || '')].length;

  return (
    <section
      id={`ad-${row.id}`}
      onFocusCapture={onActivate}
      onPointerDown={onActivate}
      className={`leaf scroll-mt-6 ${active ? 'leaf-active' : ''}`}
      aria-labelledby={`ad-${row.id}-title`}
    >
      {/* Card head: big number, name, what it holds, status, actions */}
      <div className={`flex items-center gap-3 sm:gap-4 px-5 sm:px-7 ${collapsed ? 'py-4' : 'pt-6 pb-2'}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4 text-left"
          aria-expanded={!collapsed}
          aria-controls={`ad-${row.id}-body`}
        >
          <span className={`font-extrabold tracking-[-0.04em] leading-none shrink-0 tabular-nums transition-colors duration-200 ${
            collapsed ? 'text-[1.75rem]' : 'text-[2.375rem]'} ${active ? 'text-brand-deep' : 'text-ink-faint'}`}>{number}</span>
          <span className="min-w-0">
            <span id={`ad-${row.id}-title`} className="block text-[19px] font-bold text-ink tracking-[-0.01em] truncate">
              {row.adName.trim() || `Iklan ${number}`}
            </span>
            <span className="block text-[13px] text-ink-soft truncate">
              {summaryLabel(row)}
              {row.campaignLink.trim() && <> · {row.campaignLink.trim().replace(/^https?:\/\//, '')}</>}
            </span>
          </span>
        </button>
        {complete ? (
          <span className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-ink shrink-0">
            <span className="w-[18px] h-[18px] rounded-full bg-brand-deep text-white flex items-center justify-center">
              <Icon name="check" className="w-3 h-3" strokeWidth={3} />
            </span>
            Lengkap
          </span>
        ) : (showIssues || collapsed) && (
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-danger shrink-0">
            <span className="w-[18px] h-[18px] rounded-full bg-danger text-white flex items-center justify-center text-[11px] font-bold" aria-hidden="true">!</span>
            <span><Fig>{problems}</Fig> belum lengkap</span>
          </span>
        )}
        <button type="button" onClick={onToggleCollapse} className="btn-ghost shrink-0 !px-2.5"
          aria-label={collapsed ? 'Buka iklan' : 'Ringkas iklan'}>
          <span className="hidden sm:inline">{collapsed ? 'Buka' : 'Ringkas'}</span>
          <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} className="w-4 h-4 sm:hidden" />
        </button>
        <button type="button" onClick={() => onDelete(index)} disabled={totalRows === 1}
          className="btn-ghost !p-1.5 shrink-0 hover:!text-danger" aria-label={`Hapus iklan ${index + 1}`} title="Hapus iklan">
          <Icon name="trash" />
        </button>
      </div>

      {!collapsed && (
        <div id={`ad-${row.id}-body`} className="px-5 sm:px-7 pt-4 pb-7 flex flex-col gap-8">
          {/* 1. Info iklan */}
          <Part title="Info iklan" note="Nama iklan dan ke mana donatur diarahkan.">
            <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div>
                <Label htmlFor={fieldId.adName(row)} required>Nama Iklan</Label>
                <input id={fieldId.adName(row)} type="text" value={row.adName} onChange={e => updateField('adName', e.target.value)}
                  placeholder="Contoh: Abah Kani" aria-invalid={Boolean(nameError) || undefined} className="field" />
                <FieldError>{nameError}</FieldError>
              </div>
              <div>
                <Label htmlFor={fieldId.campaignLink(row)} required>Link Halaman Campaign</Label>
                <input id={fieldId.campaignLink(row)} type="url" value={row.campaignLink} onChange={e => updateField('campaignLink', e.target.value)}
                  placeholder="https://namango.kawanbantu.com/..." aria-invalid={Boolean(linkError) || undefined} className="field" />
                <FieldError>{linkError}</FieldError>
              </div>
            </div>
          </Part>

          {/* 2. Creatives: Drive files/folders and existing IG/FB posts, in one list */}
          <Part title="Creatives"
            note="Link Google Drive dan/atau postingan IG/FB. Setiap file atau postingan jadi 1 iklan di Meta."
            aside={
              <button type="button" onClick={() => setShowDriveGuide(true)} className="flex items-center gap-1 text-[13px] font-semibold text-brand-deep hover:underline">
                Panduan link Drive
              </button>
            }>
            {showDriveGuide && <DriveGuideModal onClose={() => setShowDriveGuide(false)} />}
            {items.length > 0 && (
              <div className="flex flex-col gap-2">
                {items.map((item, li) => {
                  const err = errorFor(fieldId.item(row, li));
                  return (
                    <div key={li}>
                      <CreativeInput creative={item} index={li} inputId={fieldId.item(row, li)}
                        invalid={Boolean(err)} onUpdate={updateItem}
                        onRemove={li2 => updateField('items', items.filter((_, i) => i !== li2))} />
                      {err && <div className="ml-12"><FieldError>{err}</FieldError></div>}
                    </div>
                  );
                })}
              </div>
            )}
            <PasteSlot inputId={fieldId.newLink(row)} invalid={Boolean(errorFor(fieldId.newLink(row)))} onAdd={addLinks} />
            <FieldError>{errorFor(fieldId.newLink(row))}</FieldError>
            <Hint>
              Bisa tempel banyak link sekaligus. Link Drive harus "Anyone with the link can view"; video .mp4, gambar .jpg atau .png.
              {hasPosts && ' Postingan Instagram perlu @kawanbantu sebagai kolaborator (dicek di langkah Review).'}
            </Hint>
          </Part>

          {/* 3. Teks iklan */}
          {askText && (
            <Part title="Teks iklan"
              note={hasPosts && hasDrive
                ? 'Untuk iklan dari Google Drive. Postingan memakai caption aslinya.'
                : 'Yang dibaca orang di atas dan di bawah videonya.'}>
              <div className="flex flex-col gap-5">
                <div>
                  <Label htmlFor={fieldId.primaryText(row)} required
                    aside={<Fig className={`text-xs ${primaryLength >= PRIMARY_MAX ? 'text-warn' : 'text-ink-faint'}`}>{primaryLength}/{PRIMARY_MAX}</Fig>}>
                    Primary Text
                  </Label>
                  <textarea id={fieldId.primaryText(row)} value={row.primaryText} onChange={e => updateField('primaryText', e.target.value)}
                    rows={6} maxLength={PRIMARY_MAX} placeholder="Teks utama iklan. Kalimat pembuka paling penting."
                    aria-invalid={Boolean(primaryError) || undefined} className="field resize-y" />
                  <FieldError>{primaryError}</FieldError>
                  <Hint>Kalimat pertama paling banyak dibaca; sisanya muncul setelah orang klik "lihat selengkapnya".</Hint>
                </div>
                <div>
                  <Label htmlFor={fieldId.headline(row)} required>Headline</Label>
                  <input id={fieldId.headline(row)} type="text" value={row.headline} onChange={e => updateField('headline', e.target.value)}
                    placeholder="Judul iklan" aria-invalid={Boolean(headlineError) || undefined} className="field" />
                  <FieldError>{headlineError}</FieldError>
                  <Budget value={row.headline} limit={HEADLINE_VISIBLE} note="Lebih dari ini biasanya terpotong." />
                </div>
              </div>
            </Part>
          )}
        </div>
      )}
    </section>
  );
}
