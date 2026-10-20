import { useState } from 'react';
import CreativeInput from './CreativeInput';
import DriveGuideModal from './DriveGuideModal';
import { HEADLINE_VISIBLE } from './AdPreview';
import { Icon, Label, FieldError, Hint, Budget, Fig } from './ui';
import { fieldId } from '../utils/validation';
import { getExpandedCreatives } from '../utils/driveUtils';

export const PRIMARY_MAX = 1000;

// "Iklan 2, creative 1: Link belum diisi." -> "Link belum diisi." (the field already says where it is)
const short = msg => msg?.replace(/^Iklan \d+(, [a-z]+ \d+)?: /, '');

function summaryLabel(row) {
  if (row.source === 'post') {
    const n = (row.postLinks || []).filter(l => l.trim()).length;
    return n ? `${n} postingan` : 'Belum ada postingan';
  }
  const items = getExpandedCreatives(row);
  if (items.length === 0) return 'Belum ada creative';
  const videos = items.filter(c => c.type === 'Video').length;
  const images = items.length - videos;
  return [videos && `${videos} video`, images && `${images} gambar`].filter(Boolean).join(' + ');
}

// One numbered step of the card. The purple rail on the left ties the three steps together and
// gives each group of fields its own clear space.
function Step({ icon, title, note, aside, last, children }) {
  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)] sm:grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4">
      <div className="flex flex-col items-center" aria-hidden="true">
        <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-plum-tint text-plum-deep flex items-center justify-center shrink-0"><Icon name={icon} className="w-4 h-4" /></span>
        {!last && <span className="flex-1 w-px bg-plum/25 my-2" />}
      </div>
      <div className={`min-w-0 ${last ? '' : 'pb-8'}`}>
        <div className="mb-4 pt-1 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div>
            <h3 className="text-[15px] font-semibold text-ink leading-tight">{title}</h3>
            {note && <p className="text-[13px] text-ink-soft mt-0.5">{note}</p>}
          </div>
          {aside}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdRow({ row, index, totalRows, isDuplicate, issues, showIssues, collapsed, active, onActivate, onToggleCollapse, onUpdate, onDelete }) {
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const isPost = row.source === 'post';
  const postLinks = row.postLinks?.length ? row.postLinks : [''];
  const errorFor = id => (showIssues ? short(issues.find(i => i.id === id)?.message) : null);
  const complete = issues.length === 0 && !isDuplicate;
  const problems = issues.length + (isDuplicate ? 1 : 0);
  const number = String(index + 1).padStart(2, '0');

  function updateField(field, value) {
    onUpdate(index, { ...row, [field]: value });
  }

  // Accepts (ci, 'field', value) or (ci, { field: value, ... }) so related fields change together.
  function updateCreative(ci, key, value) {
    const patch = typeof key === 'object' ? key : { [key]: value };
    updateField('creatives', row.creatives.map((c, i) => i === ci ? { ...c, ...patch } : c));
  }

  function updatePostLink(pi, value) {
    updateField('postLinks', postLinks.map((l, i) => i === pi ? value : l));
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
      {/* Card head: number, name, what it holds, status, actions */}
      <div className={`flex items-center gap-4 px-5 sm:px-6 py-4 ${collapsed ? '' : 'border-b border-line'}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 min-w-0 flex items-center gap-4 text-left"
          aria-expanded={!collapsed}
          aria-controls={`ad-${row.id}-body`}
        >
          <span className={`font-mono text-sm font-medium rounded-lg px-2 py-1 shrink-0 ${active ? 'bg-plum text-white' : 'bg-plum-tint text-plum-deep'}`}>{number}</span>
          <span className="min-w-0">
            <span id={`ad-${row.id}-title`} className="block text-base font-semibold text-ink truncate">
              {row.adName.trim() || `Iklan ${number}`}
            </span>
            <span className="block text-[13px] text-ink-soft truncate">
              {summaryLabel(row)}
              {row.campaignLink.trim() && <> · {row.campaignLink.trim().replace(/^https?:\/\//, '')}</>}
            </span>
          </span>
        </button>
        {complete ? (
          <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-brand-deep bg-brand-tint rounded-full px-2.5 py-1 shrink-0">
            <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} /> Lengkap
          </span>
        ) : (showIssues || collapsed) && (
          <span className="text-xs font-semibold text-danger bg-danger-tint rounded-full px-2.5 py-1 shrink-0">
            <Fig>{problems}</Fig> belum lengkap
          </span>
        )}
        <button type="button" onClick={onToggleCollapse} className="btn-ghost !p-1.5 shrink-0"
          aria-label={collapsed ? 'Buka iklan' : 'Ringkas iklan'} title={collapsed ? 'Buka' : 'Ringkas'}>
          <Icon name={collapsed ? 'chevronDown' : 'chevronUp'} />
        </button>
        <button type="button" onClick={() => onDelete(index)} disabled={totalRows === 1}
          className="btn-ghost !p-1.5 shrink-0 hover:!text-danger" aria-label={`Hapus iklan ${index + 1}`} title="Hapus iklan">
          <Icon name="trash" />
        </button>
      </div>

      {!collapsed && (
        <div id={`ad-${row.id}-body`} className="px-5 sm:px-6 pt-6 pb-7">
          {/* 1. Info iklan */}
          <Step icon="link" title="Info iklan" note="Dari mana materinya, namanya, dan ke mana donatur diarahkan.">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:inline-grid sm:grid-cols-2 rounded-xl border border-line bg-paper p-1 w-full sm:w-auto sm:self-start" role="group" aria-label="Sumber iklan">
                {[
                  { value: 'drive', label: 'Video/Gambar dari Google Drive' },
                  { value: 'post', label: 'Postingan IG/FB yang sudah ada' },
                ].map(opt => {
                  const on = (row.source || 'drive') === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => updateField('source', opt.value)} aria-pressed={on}
                      className={`rounded-lg px-4 py-2 text-[13px] font-medium leading-snug text-left sm:text-center transition-colors duration-150 ${
                        on ? 'bg-white text-ink shadow-[0_1px_3px_rgb(43_32_51/0.12)]' : 'text-ink-soft hover:text-ink'
                      }`}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
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
            </div>
          </Step>

          {/* 2. Creatives, or existing post links */}
          {isPost ? (
            <Step icon="image" title="Postingan" note="Video dan caption diambil dari postingan, jadi teks iklan tidak perlu diisi." last>
              <Label htmlFor={fieldId.post(row, 0)} required>Link Postingan Instagram/Facebook</Label>
              <div className="flex flex-col gap-2">
                {postLinks.map((link, pi) => {
                  const err = errorFor(fieldId.post(row, pi));
                  return (
                    <div key={pi}>
                      <div className="flex items-center gap-2">
                        <Fig className="text-xs text-plum-deep w-5 shrink-0">{pi + 1}</Fig>
                        <input id={fieldId.post(row, pi)} type="url" value={link} onChange={e => updatePostLink(pi, e.target.value)}
                          placeholder="https://www.instagram.com/reel/..." aria-label={`Link postingan ${pi + 1}`}
                          aria-invalid={Boolean(err) || undefined} className="field min-w-0 flex-1" />
                        {postLinks.length > 1 && (
                          <button type="button" onClick={() => updateField('postLinks', postLinks.filter((_, i) => i !== pi))}
                            aria-label={`Hapus postingan ${pi + 1}`} className="btn-ghost !p-1.5 shrink-0 hover:!text-danger">
                            <Icon name="trash" />
                          </button>
                        )}
                      </div>
                      {err && <div className="ml-7"><FieldError>{err}</FieldError></div>}
                    </div>
                  );
                })}
              </div>
              {postLinks.length < 5 && (
                <button type="button" onClick={() => updateField('postLinks', [...postLinks, ''])} className="btn-ghost mt-2 !text-brand-deep">
                  <Icon name="plus" /> Tambah Postingan
                </button>
              )}
              <div className="mt-4 rounded-xl bg-plum-tint px-4 py-3.5">
                <p className="text-[13px] font-semibold text-ink">Supaya iklan bisa jalan:</p>
                <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
                  @kawanbantu sudah jadi kolaborator di setiap postingan, dan permintaan Partnership Ads dari @kawanbantu sudah kamu terima di Instagram.
                </p>
              </div>
            </Step>
          ) : (
            <Step icon="video" title="Creatives" note="Setiap file jadi 1 iklan di Meta."
              aside={
                <button type="button" onClick={() => setShowDriveGuide(true)} className="flex items-center gap-1 text-[13px] font-medium text-brand-deep hover:underline pt-0.5">
                  <Icon name="info" className="w-3.5 h-3.5" /> Panduan Upload Link Drive
                </button>
              }>
              {showDriveGuide && <DriveGuideModal onClose={() => setShowDriveGuide(false)} />}
              <span className="sr-only"><Label htmlFor={fieldId.creative(row, 0)} required>Creatives</Label></span>
              <div className="flex flex-col gap-2.5">
                {row.creatives.map((creative, ci) => {
                  const err = errorFor(fieldId.creative(row, ci));
                  return (
                    <div key={ci}>
                      <CreativeInput creative={creative} index={ci} total={row.creatives.length} inputId={fieldId.creative(row, ci)}
                        invalid={Boolean(err)} onUpdate={updateCreative}
                        onRemove={ci2 => updateField('creatives', row.creatives.filter((_, i) => i !== ci2))} />
                      {err && <div className="ml-7"><FieldError>{err}</FieldError></div>}
                    </div>
                  );
                })}
              </div>
              {row.creatives.length < 5 && (
                <button type="button" onClick={() => updateField('creatives', [...row.creatives, { link: '', type: 'Video', count: 1 }])}
                  className="btn-ghost mt-2 !text-brand-deep">
                  <Icon name="plus" /> Tambah Creative
                </button>
              )}
              <Hint>Pastikan link Google Drive diset ke "Anyone with the link can view". Video .mp4, gambar .jpg atau .png.</Hint>
            </Step>
          )}

          {/* 3. Teks iklan */}
          {!isPost && (
            <Step icon="text" title="Teks iklan" note="Yang dibaca orang di atas dan di bawah videonya." last>
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
            </Step>
          )}
        </div>
      )}
    </section>
  );
}
