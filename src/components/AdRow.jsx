import { useState } from 'react';
import CreativeInput from './CreativeInput';
import DriveGuideModal from './DriveGuideModal';
import AdPreview, { PRIMARY_VISIBLE, HEADLINE_VISIBLE } from './AdPreview';
import { Icon, Label, FieldError, Hint, CharGuide } from './ui';
import { fieldId } from '../utils/validation';
import { getExpandedCreatives } from '../utils/driveUtils';

// "Iklan 2, creative 1: Link belum diisi." -> "Link belum diisi." (the field already says where it is)
const short = msg => msg?.replace(/^Iklan \d+(, [a-z]+ \d+)?: /, '');

function summaryLabel(row) {
  if (row.source === 'post') {
    const n = (row.postLinks || []).filter(l => l.trim()).length;
    return `${n} postingan`;
  }
  const items = getExpandedCreatives(row);
  if (items.length === 0) return 'Belum ada creative';
  const videos = items.filter(c => c.type === 'Video').length;
  const images = items.length - videos;
  return [videos && `${videos} video`, images && `${images} gambar`].filter(Boolean).join(' + ');
}

export default function AdRow({ row, index, totalRows, ngoName, isDuplicate, issues, showIssues, collapsed, onToggleCollapse, onUpdate, onDelete }) {
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const isPost = row.source === 'post';
  const postLinks = row.postLinks?.length ? row.postLinks : [''];
  const errorFor = id => (showIssues ? short(issues.find(i => i.id === id)?.message) : null);
  const complete = issues.length === 0 && !isDuplicate;

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
    <section id={`ad-${row.id}`} className="card overflow-hidden scroll-mt-20" aria-labelledby={`ad-${row.id}-title`}>
      {/* Header: identity, status, actions */}
      <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${collapsed ? '' : 'border-b border-line'}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex-1 min-w-0 flex items-center gap-3 text-left"
          aria-expanded={!collapsed}
          aria-controls={`ad-${row.id}-body`}
        >
          <span className="w-7 h-7 rounded-full bg-cream text-ink-soft text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
            {index + 1}
          </span>
          <span className="min-w-0">
            <span id={`ad-${row.id}-title`} className="block text-sm font-bold text-ink truncate">
              {row.adName.trim() || `Iklan ${index + 1}`}
            </span>
            <span className="block text-xs text-ink-soft truncate">
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
          <span className="flex items-center gap-1 text-xs font-semibold text-danger bg-danger-tint rounded-full px-2.5 py-1 shrink-0">
            {issues.length + (isDuplicate ? 1 : 0)} belum lengkap
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
        <div id={`ad-${row.id}-body`} className="p-4 sm:p-5 grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_288px]">
          {/* Setup */}
          <div className="flex flex-col gap-5 min-w-0">
            <div>
              <span className="block text-sm font-semibold text-ink mb-1.5">Sumber iklan</span>
              <div className="grid grid-cols-2 rounded-xl border border-line bg-cream p-1" role="group" aria-label="Sumber iklan">
                {[
                  { value: 'drive', label: 'File dari Google Drive' },
                  { value: 'post', label: 'Postingan IG/FB yang sudah ada' },
                ].map(opt => {
                  const active = (row.source || 'drive') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('source', opt.value)}
                      aria-pressed={active}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold leading-snug transition-colors duration-150 ${
                        active ? 'bg-white text-ink shadow-[0_1px_3px_rgb(43_32_51/0.12)]' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor={fieldId.adName(row)} required>Nama iklan</Label>
              <input
                id={fieldId.adName(row)}
                type="text"
                value={row.adName}
                onChange={e => updateField('adName', e.target.value)}
                placeholder="Contoh: Abah Kani"
                aria-invalid={Boolean(nameError) || undefined}
                className="field"
              />
              <FieldError>{nameError}</FieldError>
            </div>

            <div>
              <Label htmlFor={fieldId.campaignLink(row)} required>Link halaman campaign</Label>
              <input
                id={fieldId.campaignLink(row)}
                type="url"
                value={row.campaignLink}
                onChange={e => updateField('campaignLink', e.target.value)}
                placeholder="https://namango.kawanbantu.com/..."
                aria-invalid={Boolean(linkError) || undefined}
                className="field"
              />
              <FieldError>{linkError}</FieldError>
            </div>

            {isPost ? (
              <div>
                <Label htmlFor={fieldId.post(row, 0)} required>Link postingan Instagram/Facebook</Label>
                <div className="flex flex-col gap-2">
                  {postLinks.map((link, pi) => {
                    const err = errorFor(fieldId.post(row, pi));
                    return (
                      <div key={pi}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-ink-faint w-4 text-center tabular-nums shrink-0">{pi + 1}</span>
                          <input
                            id={fieldId.post(row, pi)}
                            type="url"
                            value={link}
                            onChange={e => updatePostLink(pi, e.target.value)}
                            placeholder="https://www.instagram.com/reel/..."
                            aria-label={`Link postingan ${pi + 1}`}
                            aria-invalid={Boolean(err) || undefined}
                            className="field min-w-0 flex-1"
                          />
                          {postLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => updateField('postLinks', postLinks.filter((_, i) => i !== pi))}
                              aria-label={`Hapus postingan ${pi + 1}`}
                              className="btn-ghost !p-1.5 shrink-0 hover:!text-danger"
                            >
                              <Icon name="trash" />
                            </button>
                          )}
                        </div>
                        {err && <div className="ml-6"><FieldError>{err}</FieldError></div>}
                      </div>
                    );
                  })}
                </div>
                {postLinks.length < 5 && (
                  <button type="button" onClick={() => updateField('postLinks', [...postLinks, ''])} className="btn-ghost mt-2 !text-brand-deep">
                    <Icon name="plus" /> Tambah postingan
                  </button>
                )}
              </div>
            ) : (
              <div>
                <Label
                  htmlFor={fieldId.creative(row, 0)}
                  required
                  aside={
                    <button type="button" onClick={() => setShowDriveGuide(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-deep hover:underline">
                      <Icon name="info" className="w-3.5 h-3.5" /> Panduan link Drive
                    </button>
                  }
                >
                  Creatives
                </Label>
                {showDriveGuide && <DriveGuideModal onClose={() => setShowDriveGuide(false)} />}
                <div className="flex flex-col gap-2">
                  {row.creatives.map((creative, ci) => {
                    const err = errorFor(fieldId.creative(row, ci));
                    return (
                      <div key={ci}>
                        <CreativeInput
                          creative={creative}
                          index={ci}
                          total={row.creatives.length}
                          inputId={fieldId.creative(row, ci)}
                          invalid={Boolean(err)}
                          onUpdate={updateCreative}
                          onRemove={ci2 => updateField('creatives', row.creatives.filter((_, i) => i !== ci2))}
                        />
                        {err && <div className="ml-6"><FieldError>{err}</FieldError></div>}
                      </div>
                    );
                  })}
                </div>
                {row.creatives.length < 5 && (
                  <button
                    type="button"
                    onClick={() => updateField('creatives', [...row.creatives, { link: '', type: 'Video', count: 1 }])}
                    className="btn-ghost mt-2 !text-brand-deep"
                  >
                    <Icon name="plus" /> Tambah creative
                  </button>
                )}
                <Hint>Atur link Drive ke "Anyone with the link". Video .mp4, gambar .jpg atau .png. Setiap file jadi 1 iklan.</Hint>
              </div>
            )}
          </div>

          {/* Copy, or the existing-post requirements */}
          {isPost ? (
            <div className="lg:col-span-1 xl:col-span-2 min-w-0">
              <div className="rounded-xl bg-brand-tint px-4 py-4">
                <p className="text-sm font-semibold text-ink mb-2">Iklan ini memakai video dan caption dari postingan</p>
                <p className="text-sm text-ink-soft mb-3 leading-relaxed">Primary text dan headline tidak perlu diisi. Supaya iklan bisa jalan, pastikan:</p>
                <ol className="space-y-2 text-sm text-ink">
                  <li className="flex gap-2.5"><span className="font-bold text-brand-deep tabular-nums">1.</span> @kawanbantu sudah jadi kolaborator di setiap postingan.</li>
                  <li className="flex gap-2.5"><span className="font-bold text-brand-deep tabular-nums">2.</span> Permintaan Partnership Ads dari @kawanbantu sudah kamu terima di Instagram.</li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 min-w-0">
                <div>
                  <Label htmlFor={fieldId.primaryText(row)} required
                    aside={<CharGuide value={row.primaryText} limit={PRIMARY_VISIBLE} label="Karakter yang terlihat sebelum 'lihat selengkapnya'" />}>
                    Primary text
                  </Label>
                  <textarea
                    id={fieldId.primaryText(row)}
                    value={row.primaryText}
                    onChange={e => updateField('primaryText', e.target.value)}
                    rows={7}
                    placeholder="Ceritakan kisahnya. Kalimat pembuka paling penting."
                    aria-invalid={Boolean(primaryError) || undefined}
                    className="field resize-y"
                  />
                  <FieldError>{primaryError}</FieldError>
                  <Hint>Sekitar {PRIMARY_VISIBLE} karakter pertama yang terlihat sebelum "lihat selengkapnya". Taruh kalimat terkuat di awal.</Hint>
                </div>
                <div>
                  <Label htmlFor={fieldId.headline(row)} required
                    aside={<CharGuide value={row.headline} limit={HEADLINE_VISIBLE} label="Batas headline sebelum terpotong" />}>
                    Headline
                  </Label>
                  <input
                    id={fieldId.headline(row)}
                    type="text"
                    value={row.headline}
                    onChange={e => updateField('headline', e.target.value)}
                    placeholder="Contoh: Bantu Abah Kani Berobat"
                    aria-invalid={Boolean(headlineError) || undefined}
                    className="field"
                  />
                  <FieldError>{headlineError}</FieldError>
                  <Hint>Headline di atas {HEADLINE_VISIBLE} karakter biasanya terpotong.</Hint>
                </div>
              </div>
              <div className="lg:col-span-2 xl:col-span-1 min-w-0">
                <span className="block text-sm font-semibold text-ink mb-2 xl:text-center">Pratinjau</span>
                <AdPreview ngoName={ngoName} row={row} />
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
