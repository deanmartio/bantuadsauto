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

// A card holds one list of links ("items"). Each item is a Google Drive file or folder, or an
// existing Instagram/Facebook post, recognised from its link, so one card can mix both.
// Item shape: { link, type: 'Video' | 'Gambar', count, countManual, collab }.
export function newItem() {
  return { link: '', type: 'Video', count: 1 };
}

// 'empty' | 'post' | 'drive' | 'unknown'
export function itemKind(link) {
  const l = (link || '').trim();
  if (!l) return 'empty';
  if (/(^|[/.])(instagram\.com|facebook\.com|fb\.com|fb\.watch)(\/|$)/i.test(l)) return 'post';
  if (/(^|[/.])google\.com(\/|$)/i.test(l)) return 'drive';
  return 'unknown';
}

// Every Meta ad a card will create, in list order. Ads are numbered across the whole card
// ("Abah Kani 1", "2", ...) whether they come from Drive or from a post. A Drive-only card gets
// exactly the names and filenames it always had.
export function getExpandedAds(row) {
  const flat = [];
  (row.items || []).forEach((item, itemIndex) => {
    const kind = itemKind(item.link);
    if (kind === 'post') {
      flat.push({ kind, itemIndex, postLink: item.link.trim(), collaboratorConfirmed: Boolean(item.collab) });
    } else if (kind === 'drive') {
      const isFolder = isFolderLink(item.link);
      const count = isFolder ? Math.max(1, item.count || 1) : 1;
      for (let i = 0; i < count; i++) {
        flat.push({ kind, itemIndex, link: item.link, type: item.type, isFolder, folderFileIndex: i });
      }
    }
  });

  const total = flat.length;
  // seq: the ad's number inside the card (1-based), shared by Drive files and posts.
  return flat.map((ad, idx) => ad.kind === 'post'
    ? { ...ad, seq: idx + 1, adName: buildAdName(row.adName.trim(), idx, total) }
    : { ...ad, seq: idx + 1, filename: buildCreativeFilename(row.adName, idx, total, ad.type), adName: buildAdName(row.adName, idx, total) });
}

// Drive ads only: { link, type, isFolder, folderFileIndex, filename, adName }.
export function getExpandedCreatives(row) {
  return getExpandedAds(row).filter(a => a.kind === 'drive');
}

// Post ads only: { postLink, collaboratorConfirmed, adName }.
export function getExpandedPosts(row) {
  return getExpandedAds(row)
    .filter(a => a.kind === 'post')
    .map(({ postLink, collaboratorConfirmed, adName }) => ({ postLink, collaboratorConfirmed, adName }));
}

// Primary text and headline are for Drive ads; posts keep their own caption. A card asks for the
// text unless every recognised link is a post (an empty or unrecognised link decides nothing yet).
export function needsAdText(row) {
  const kinds = (row.items || []).map(i => itemKind(i.link)).filter(k => k === 'post' || k === 'drive');
  return !(kinds.length > 0 && kinds.every(k => k === 'post'));
}

export function isPostLink(link) {
  return /^https:\/\/(www\.|m\.|web\.)?(instagram\.com|facebook\.com|fb\.com|fb\.watch)\/\S+$/i.test(link.trim());
}

// Instagram posts must have @kawanbantu as a collaborator before KawanBantu can run them as ads.
export const KAWANBANTU_IG = 'kawanbantu';

export function isInstagramLink(link) {
  return /^https:\/\/(www\.|m\.)?instagram\.com\/\S+$/i.test((link || '').trim());
}

// Every Instagram post in the submission, with where its tick lives (row id + item index).
export function getInstagramPosts(adRows) {
  return adRows.flatMap(row => getExpandedAds(row)
    .filter(a => a.kind === 'post' && isInstagramLink(a.postLink))
    .map(a => ({ rowId: row.id, pi: a.itemIndex, postLink: a.postLink, adName: a.adName, confirmed: a.collaboratorConfirmed })));
}

export function getLocalDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
