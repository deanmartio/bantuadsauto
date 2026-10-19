import JSZip from 'jszip';
import { generateXLSX } from './xlsxGenerator';
import { generatePythonScript } from './pythonScriptGenerator';
import { getLocalDateString, getExpandedCreatives, getExpandedPosts, isPostRow } from './driveUtils';

export function getZipFilename(ngoName) {
  const date = getLocalDateString();
  return `BantuAds_${ngoName}_${date}.zip`;
}

// What KawanBantu's intake and processing need to know about this submission.
export function getSubmissionSummary(adRows) {
  const driveRows = adRows.filter(r => !isPostRow(r));
  const postRows = adRows.filter(isPostRow);
  const driveAdCount = driveRows.reduce((n, r) => n + getExpandedCreatives(r).length, 0);
  const posts = postRows.flatMap(r => getExpandedPosts(r).map(p => ({ ...p, campaignLink: r.campaignLink.trim() })));
  const mode = postRows.length === 0 ? 'drive' : driveRows.length === 0 ? 'existing_post' : 'mixed';
  return {
    driveRows,
    posts,
    mode,
    adCount: driveAdCount + posts.length,
    postLinks: posts.map(p => p.postLink),
  };
}

// Bundles the XLSX + Python script (Drive ads) and a submission.json manifest into one ZIP
// so the NGO only has to download or send one file. Existing-post ads live only in the manifest.
export async function generateExportZip(ngoName, adRows) {
  const date = getLocalDateString();
  const summary = getSubmissionSummary(adRows);
  const zip = new JSZip();

  let xlsxFilename = null;
  let pyFilename = null;
  if (summary.driveRows.length > 0) {
    const { blob: xlsxBlob, filename } = generateXLSX(ngoName, summary.driveRows);
    xlsxFilename = filename;
    pyFilename = `download_creatives_${ngoName}_${date}.py`;
    zip.file(xlsxFilename, await xlsxBlob.arrayBuffer());
    zip.file(pyFilename, generatePythonScript(ngoName, summary.driveRows));
  }

  zip.file('submission.json', JSON.stringify({
    version: 1,
    ngoName,
    submissionDate: date,
    mode: summary.mode,
    adCount: summary.adCount,
    existingPosts: summary.posts,
  }, null, 2));

  const bytes = await zip.generateAsync({ type: 'uint8array' });
  const blob = new Blob([bytes], { type: 'application/zip' });

  return {
    blob,
    bytes,
    filename: getZipFilename(ngoName),
    xlsxFilename,
    pyFilename,
    submissionDate: date,
    mode: summary.mode,
    adCount: summary.adCount,
    postLinks: summary.postLinks,
  };
}

export function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
