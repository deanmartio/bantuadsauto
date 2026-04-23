export function validate(ngoName, adRows) {
  const errors = [];

  if (!ngoName.trim()) errors.push('NGO Name wajib diisi.');
  if (adRows.length === 0) errors.push('Minimal 1 iklan harus ditambahkan.');

  const names = adRows.map(r => r.adName.trim().toLowerCase());
  const duplicates = names.filter((n, i) => n && names.indexOf(n) !== i);

  adRows.forEach((row, i) => {
    if (!row.adName.trim()) errors.push(`Baris ${i + 1}: Nama iklan wajib diisi.`);
    if (!row.campaignLink.trim()) errors.push(`Baris ${i + 1}: Link Halaman Campaign wajib diisi.`);
    if (row.creatives.length === 0 || row.creatives.every(c => !c.link.trim())) {
      errors.push(`Baris ${i + 1}: Minimal 1 link creative harus diisi.`);
    }
    row.creatives.forEach((c, ci) => {
      if (!c.link.trim()) errors.push(`Baris ${i + 1}, creative ${ci + 1}: Link tidak boleh kosong.`);
    });
    if (row.primaryTexts.every(t => !t.trim())) {
      errors.push(`Baris ${i + 1}: Minimal 1 primary text harus diisi.`);
    }
    if (row.headlines.every(h => !h.trim())) {
      errors.push(`Baris ${i + 1}: Minimal 1 headline harus diisi.`);
    }
  });

  return { errors, hasDuplicates: duplicates.length > 0 };
}

export function getDuplicateAdNames(adRows) {
  const names = adRows.map(r => r.adName.trim().toLowerCase());
  return new Set(names.filter((n, i) => n && names.indexOf(n) !== i));
}
