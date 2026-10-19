import { isPostRow, isPostLink } from './driveUtils';

// DOM ids for every field that can be missing, so the "belum lengkap" guide can jump to it.
export const fieldId = {
  ngoName: () => 'field-ngo-name',
  adName: row => `field-ad-${row.id}-name`,
  campaignLink: row => `field-ad-${row.id}-link`,
  creative: (row, ci) => `field-ad-${row.id}-creative-${ci}`,
  post: (row, pi) => `field-ad-${row.id}-post-${pi}`,
  primaryText: row => `field-ad-${row.id}-primary`,
  headline: row => `field-ad-${row.id}-headline`,
};

// Every problem that blocks sending, with the field it belongs to.
// Each issue: { id, rowId, message } where id is the DOM id of the field.
export function getIssues(ngoName, adRows) {
  const issues = [];
  const add = (id, rowId, message) => issues.push({ id, rowId, message });

  if (!ngoName.trim()) add(fieldId.ngoName(), null, 'Nama NGO wajib diisi.');
  if (adRows.length === 0) add(null, null, 'Minimal 1 iklan harus ditambahkan.');

  adRows.forEach((row, i) => {
    const n = i + 1;
    if (!row.adName.trim()) add(fieldId.adName(row), row.id, `Iklan ${n}: Nama iklan wajib diisi.`);
    if (!row.campaignLink.trim()) add(fieldId.campaignLink(row), row.id, `Iklan ${n}: Link halaman campaign wajib diisi.`);

    if (isPostRow(row)) {
      // Existing post: the post's own media and copy are used, so only the post links are needed.
      const links = row.postLinks || [];
      if (links.length === 0) add(null, row.id, `Iklan ${n}: Minimal 1 link postingan harus diisi.`);
      links.forEach((l, li) => {
        if (!l.trim()) add(fieldId.post(row, li), row.id, `Iklan ${n}, postingan ${li + 1}: Link belum diisi.`);
        else if (!isPostLink(l)) add(fieldId.post(row, li), row.id, `Iklan ${n}, postingan ${li + 1}: Harus link Instagram atau Facebook (https://...).`);
      });
      return;
    }

    if (row.creatives.length === 0) add(null, row.id, `Iklan ${n}: Minimal 1 link creative harus diisi.`);
    row.creatives.forEach((c, ci) => {
      if (!c.link.trim()) add(fieldId.creative(row, ci), row.id, `Iklan ${n}, creative ${ci + 1}: Link Google Drive belum diisi.`);
    });
    if (!row.primaryText.trim()) add(fieldId.primaryText(row), row.id, `Iklan ${n}: Primary text wajib diisi.`);
    if (!row.headline.trim()) add(fieldId.headline(row), row.id, `Iklan ${n}: Headline wajib diisi.`);
  });

  return issues;
}

export function validate(ngoName, adRows) {
  const errors = getIssues(ngoName, adRows).map(i => i.message);
  return { errors, hasDuplicates: getDuplicateAdNames(adRows).size > 0 };
}

export function getDuplicateAdNames(adRows) {
  const names = adRows.map(r => r.adName.trim().toLowerCase());
  return new Set(names.filter((n, i) => n && names.indexOf(n) !== i));
}
