import JSZip from 'jszip';
import { generateXLSX } from './xlsxGenerator';
import { generatePythonScript } from './pythonScriptGenerator';
import { getLocalDateString } from './driveUtils';

export function getZipFilename(ngoName) {
  const date = getLocalDateString();
  return `BantuAds_${ngoName}_${date}.zip`;
}

// Bundles the XLSX + Python script into a single ZIP so the NGO only has to download and send one file.
export async function generateExportZip(ngoName, adRows) {
  const { blob: xlsxBlob, filename: xlsxFilename } = generateXLSX(ngoName, adRows);
  const pyContent = generatePythonScript(ngoName, adRows);
  const pyFilename = `download_creatives_${ngoName}_${getLocalDateString()}.py`;

  const zip = new JSZip();
  zip.file(xlsxFilename, await xlsxBlob.arrayBuffer());
  zip.file(pyFilename, pyContent);
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return { blob: zipBlob, filename: getZipFilename(ngoName), xlsxFilename, pyFilename };
}
