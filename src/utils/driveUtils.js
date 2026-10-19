export function getFileExtension(type) {
  return type === 'Video' ? '.mp4' : '.jpg';
}

export function isFolderLink(link) {
  return link.includes('/folders/');
}

export function buildCreativeFilename(adName, creativeIndex, totalCreatives, type) {
  const ext = getFileExtension(type);
  // Use underscores — spaces in filenames cause Meta media library matching failures
  const safeName = adName.trim().replace(/\s+/g, '_');
  if (totalCreatives === 1) return `${safeName}${ext}`;
  return `${safeName}_${creativeIndex + 1}${ext}`;
}

export function buildAdName(adName, creativeIndex, totalCreatives) {
  if (totalCreatives === 1) return adName;
  return `${adName} ${creativeIndex + 1}`;
}

// Expands a row's creatives, accounting for folder links with multiple files.
// Returns a flat list where each entry has { link, type, isFolder, filename, adName }.
export function getExpandedCreatives(row) {
  // Ads built from an existing IG/FB post have no Drive creatives (see isPostRow).
  if (isPostRow(row)) return [];
  const flat = [];
  row.creatives.filter(c => c.link.trim()).forEach(c => {
    const isFolder = isFolderLink(c.link);
    const count = isFolder ? Math.max(1, c.count || 1) : 1;
    for (let i = 0; i < count; i++) {
      flat.push({ link: c.link, type: c.type, isFolder, folderFileIndex: i });
    }
  });

  const total = flat.length;
  return flat.map((c, idx) => ({
    ...c,
    filename: buildCreativeFilename(row.adName, idx, total, c.type),
    adName: buildAdName(row.adName, idx, total),
  }));
}

// A row whose creative is an existing Instagram/Facebook post instead of Drive files.
export function isPostRow(row) {
  return row.source === 'post';
}

export function isPostLink(link) {
  return /^https:\/\/(www\.|m\.|web\.)?(instagram\.com|facebook\.com|fb\.com|fb\.watch)\/\S+$/i.test(link.trim());
}

export function getLocalDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
