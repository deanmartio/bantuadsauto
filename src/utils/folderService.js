import { useEffect, useState } from 'react';
import { SUBMIT_URL } from '../config';

// Lists a public Drive folder's video/image files through the intake endpoint, so the preview can
// show each file's thumbnail and the form can fill in the file count. Cached per folder for the session.
const cache = new Map();

export function driveFolderId(link) {
  const m = (link || '').match(/\/folders\/([A-Za-z0-9_-]{10,})/);
  return m ? m[1] : null;
}

export function fetchFolder(folderId) {
  if (!SUBMIT_URL || !folderId) return Promise.resolve(null);
  if (!cache.has(folderId)) {
    const p = fetch(SUBMIT_URL, { method: 'POST', body: JSON.stringify({ action: 'folder', folderId }) })
      .then(r => r.json())
      // Only the folder's own problem is worth showing; anything else (an older server, a busy
      // server) quietly falls back to counting the files by hand.
      .then(d => (d.ok ? d.files : /folder/i.test(d.error || '') ? { error: d.error } : null))
      .catch(() => null);
    cache.set(folderId, p);
  }
  return cache.get(folderId);
}

// { status: 'idle' | 'loading' | 'ok' | 'error', files, error }
export function useFolderFiles(link) {
  const folderId = driveFolderId(link);
  const [state, setState] = useState({ key: null, status: 'idle', files: [] });

  useEffect(() => {
    if (!folderId) return;
    let alive = true;
    fetchFolder(folderId).then(res => {
      if (!alive) return;
      if (Array.isArray(res)) setState({ key: folderId, status: 'ok', files: res });
      else if (res?.error) setState({ key: folderId, status: 'error', files: [], error: res.error });
      else setState({ key: folderId, status: 'idle', files: [] });
    });
    return () => { alive = false; };
  }, [folderId]);

  if (!folderId) return { status: 'idle', files: [] };
  if (state.key !== folderId) return { status: 'loading', files: [] };
  return state;
}
