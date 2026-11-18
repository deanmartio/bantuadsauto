import { isPostLink, itemKind, needsAdText } from './driveUtils';

// DOM ids for every field that can be missing, so the "belum lengkap" guide can jump to it.
export const fieldId = {
  ngoName: () => 'field-ngo-name',
  adName: row => `field-ad-${row.id}-name`,
  campaignLink: row => `field-ad-${row.id}-link`,
  item: (row, li) => `field-ad-${row.id}-item-${li}`,
  newLink: row => `field-ad-${row.id}-new-link`,
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

    // One list of links per card: Drive files or folders and IG/FB posts, in any mix.
    const items = row.items || [];
    if (items.length === 0) add(fieldId.newLink(row), row.id, `Iklan ${n}: Tempel minimal 1 link Drive atau postingan.`);
    items.forEach((item, li) => {
      const id = fieldId.item(row, li);
      const where = `Iklan ${n}, konten ${li + 1}`;
      const kind = itemKind(item.link);
      if (kind === 'empty') add(id, row.id, `${where}: Link belum diisi.`);
      else if (kind === 'unknown') add(id, row.id, `${where}: Tempel link Google Drive, Instagram atau Facebook.`);
      else if (kind === 'post' && !isPostLink(item.link)) add(id, row.id, `${where}: Link Instagram/Facebook harus diawali https://`);
    });

    // Posts keep their own caption; the text is only for Drive files.
    if (needsAdText(row)) {
      if (!row.primaryText.trim()) add(fieldId.primaryText(row), row.id, `Iklan ${n}: Primary text wajib diisi.`);
      if (!row.headline.trim()) add(fieldId.headline(row), row.id, `Iklan ${n}: Headline wajib diisi.`);
    }
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
