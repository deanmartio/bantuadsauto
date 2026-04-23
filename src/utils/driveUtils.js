export function getFileExtension(type) {
  return type === 'Video' ? '.mp4' : '.jpg';
}

export function buildCreativeFilename(adName, creativeIndex, totalCreatives, type) {
  const ext = getFileExtension(type);
  if (totalCreatives === 1) {
    return `${adName}${ext}`;
  }
  return `${adName} ${creativeIndex + 1}${ext}`;
}

export function buildAdName(adName, creativeIndex, totalCreatives) {
  if (totalCreatives === 1) return adName;
  return `${adName} ${creativeIndex + 1}`;
}

export function getLocalDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
