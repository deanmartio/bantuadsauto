import { useState } from 'react';
import CreativeInput from './CreativeInput';
import DriveGuideModal from './DriveGuideModal';
import { PRIMARY_VISIBLE, HEADLINE_VISIBLE } from './AdPreview';
import { Icon, Label, FieldError, Hint, Budget, Fig } from './ui';
import { fieldId } from '../utils/validation';
import { getExpandedCreatives } from '../utils/driveUtils';

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

export default function AdRow({ row, index, totalRows, isDuplicate, issues, showIssues, collapsed, active, onActivate, onToggleCollapse, onUpdate, onDelete }) {
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const isPost = row.source === 'post';
  const postLinks = row.postLinks?.length ? row.postLinks : [''];
  const errorFor = id => (showIssues ? short(issues.find(i => i.id === id)?.message) : null);
  const complete = issues.length === 0 && !isDuplicate;
  const problems = issues.length + (isDuplicate ? 1 : 0);

  function updateField(field, value) {
    onUpdate(index, { ...row, [field]: value });
  }

  function updateCreative(ci, key, value) {
    updateField('creatives', row.creatives.map((c, i) => i === ci ? { ...c, [key]: value } : c));
  }

  function updatePostLink(pi, value) {
    updateField('postLinks', postLinks.map((l, i) => i === pi ? value : l));
  }

  const nameError = errorFor(fieldId.adName(row)) || (isDuplicate ? 'Nama iklan ini sudah dipakai iklan lain.' : null);
  const linkError = errorFor(fieldId.campaignLink(row));
  const primaryError = errorFor(fieldId.primaryText(row));
  const headlineError = errorFor(fieldId.headline(row));

  return (
    <section
      id={`ad-${row.id}`}
      onFocusCapture={onActivate}
      onPointerDown={onActivate}
      className={`leaf scroll-mt-24 ${active ? 'leaf-active' : ''}`}
      aria-labelledby={`ad-${row.id}-title`}
    >
      {/* Stub: printed number, name, what it holds, status, actions */}
      <div className={`flex items-center gap-4 px-5 py-3.5 ${collapsed ? '' : 'border-b border-line'}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 min-w-0 flex items-center gap-4 text-left"
          aria-expanded={!collapsed}
          aria-controls={`ad-${row.id}-body`}
        >
          <Fig className={`text-lg font-medium ${active ? 'text-brand-deep' : 'text-ink-faint'}`}>{String(index + 1).padStart(2, '0')}</Fig>
          <span className="min-w-0">
            <span id={`ad-${row.id}-title`} className="block text-base font-bold text-ink truncate">
              {row.adName.trim() || `Iklan ${String(index + 1).padStart(2, '0')}`}
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
        <div id={`ad-${row.id}-body`} className="px-5 pt-5 pb-6 flex flex-col gap-6">
          {/* 0. Sumber iklan */}
          <div>
            <span className="block text-sm font-semibold text-ink mb-1.5">Sumber iklan</span>
            <div className="inline-grid grid-cols-2 rounded-xl border border-line bg-paper p-1 w-full sm:w-auto" role="group" aria-label="Sumber iklan">
              {[
                { value: 'drive', label: 'Video/Gambar dari Google Drive' },
                { value: 'post', label: 'Postingan IG/FB yang sudah ada' },
              ].map(opt => {
                const on = (row.source || 'drive') === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => updateField('source', opt.value)} aria-pressed={on}
                    className={`rounded-lg px-4 py-2 text-[13px] font-semibold leading-snug transition-colors duration-150 ${
                      on ? 'bg-white text-ink shadow-[0_1px_3px_rgb(43_32_51/0.12)]' : 'text-ink-soft hover:text-ink'
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Nama iklan + Link halaman campaign */}
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

          {/* 2. Creatives, or existing post links */}
          {isPost ? (
            <div>
              <Label htmlFor={fieldId.post(row, 0)} required>Link Postingan Instagram/Facebook</Label>
              <div className="flex flex-col gap-2">
                {postLinks.map((link, pi) => {
                  const err = errorFor(fieldId.post(row, pi));
                  return (
                    <div key={pi}>
                      <div className="flex items-center gap-2">
                        <Fig className="text-xs text-ink-faint w-5 shrink-0">{pi + 1}</Fig>
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
              <div className="mt-4 rounded-xl bg-brand-tint px-4 py-3.5">
                <p className="text-sm font-semibold text-ink">Video dan caption diambil dari postingan, jadi Primary Text dan Headline tidak perlu diisi.</p>
                <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
                  Supaya iklan bisa jalan: @kawanbantu sudah jadi kolaborator di setiap postingan, dan permintaan Partnership Ads dari @kawanbantu sudah kamu terima di Instagram.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor={fieldId.creative(row, 0)} required
                aside={
                  <button type="button" onClick={() => setShowDriveGuide(true)} className="flex items-center gap-1 text-[13px] font-semibold text-brand-deep hover:underline">
                    <Icon name="info" className="w-3.5 h-3.5" /> Panduan Upload Link Drive
                  </button>
                }>
                Creatives
              </Label>
              {showDriveGuide && <DriveGuideModal onClose={() => setShowDriveGuide(false)} />}
              <div className="flex flex-col gap-2">
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
              <Hint>Pastikan link Google Drive diset ke "Anyone with the link can view". Video .mp4, gambar .jpg atau .png. Setiap file jadi 1 iklan.</Hint>
            </div>
          )}

          {/* 3. Primary text + headline */}
          {!isPost && (
            <div className="flex flex-col gap-5 pt-5 border-t border-line">
              <div>
                <Label htmlFor={fieldId.primaryText(row)} required>Primary Text</Label>
                <textarea id={fieldId.primaryText(row)} value={row.primaryText} onChange={e => updateField('primaryText', e.target.value)}
                  rows={5} placeholder="Teks utama iklan. Kalimat pembuka paling penting."
                  aria-invalid={Boolean(primaryError) || undefined} className="field resize-y" />
                <FieldError>{primaryError}</FieldError>
                <Budget value={row.primaryText} limit={PRIMARY_VISIBLE} note='Bagian yang terlihat sebelum "lihat selengkapnya".' />
              </div>
              <div>
                <Label htmlFor={fieldId.headline(row)} required>Headline</Label>
                <input id={fieldId.headline(row)} type="text" value={row.headline} onChange={e => updateField('headline', e.target.value)}
                  placeholder="Judul iklan" aria-invalid={Boolean(headlineError) || undefined} className="field" />
                <FieldError>{headlineError}</FieldError>
                <Budget value={row.headline} limit={HEADLINE_VISIBLE} note="Lebih dari ini biasanya terpotong." />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
