import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import TopFields from './components/TopFields';
import AdTable from './components/AdTable';
import ReviewScreen from './components/ReviewScreen';
import SuccessScreen from './components/SuccessScreen';
import { validate } from './utils/validation';
import { generateExportZip, bytesToBase64 } from './utils/zipGenerator';
import { submitToKawanBantu } from './utils/submitService';

const STORAGE_KEY = 'bantuads_form_draft';
let nextId = 1;

function createEmptyRow() {
  return {
    id: nextId++,
    adName: '',
    campaignLink: '',
    source: 'drive', // 'drive' = Drive videos/images, 'post' = existing IG/FB post
    postLinks: [''],
    creatives: [{ link: '', type: 'Video', count: 1 }],
    primaryText: '',
    headline: '',
  };
}

// Migrate drafts saved before multi-variant primary text/headline was removed
// (Meta's bulk XLSX format never actually supported testing multiple variants —
// see xlsxGenerator.js) so old saved rows don't crash on the new single-string shape.
function migrateRow(row) {
  if (!row.source) row = { ...row, source: 'drive' };
  if (!row.postLinks) {
    const { postLink, ...rest } = row;
    row = { ...rest, postLinks: [postLink || ''] };
  }
  if (row.primaryTexts || row.headlines) {
    const { primaryTexts, headlines, ...rest } = row;
    return {
      ...rest,
      primaryText: row.primaryText ?? primaryTexts?.find(t => t.trim()) ?? '',
      headline: row.headline ?? headlines?.find(h => h.trim()) ?? '',
    };
  }
  return row;
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.adRows?.length) {
      parsed.adRows = parsed.adRows.map(migrateRow);
      // Ensure IDs don't collide with future createEmptyRow() calls
      const maxId = Math.max(...parsed.adRows.map(r => r.id ?? 0));
      nextId = maxId + 1;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(ngoName, adRows) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ngoName, adRows }));
  } catch { /* quota exceeded — fail silently */ }
}

export default function App() {
  const draft = loadDraft();
  const [screen, setScreen] = useState('form');
  const [ngoName, setNgoName] = useState(draft?.ngoName ?? '');
  const [adRows, setAdRows] = useState(draft?.adRows ?? [createEmptyRow()]);
  const [exportedFiles, setExportedFiles] = useState(null); // { zipFilename, xlsxFilename, pyFilename }
  const [submission, setSubmission] = useState(null);
  const lastZipRef = useRef(null); // the ZIP already downloaded, reused when re-sending after a failure // { submissionId, receivedAt } after "Kirim ke KawanBantu"

  // Auto-save draft on every change
  useEffect(() => {
    saveDraft(ngoName, adRows);
  }, [ngoName, adRows]);

  function handleTopChange(field, value) {
    if (field === 'ngoName') setNgoName(value);
  }

  const handleUpdateRow = useCallback((index, updatedRow) => {
    setAdRows(prev => prev.map((r, i) => i === index ? updatedRow : r));
  }, []);

  const handleDeleteRow = useCallback((index) => {
    setAdRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddRow = useCallback(() => {
    setAdRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const { errors } = validate(ngoName, adRows);
  const hasErrors = errors.length > 0;

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleExport() {
    const { blob: zipBlob, filename: zipFilename, xlsxFilename, pyFilename } = await generateExportZip(ngoName, adRows);

    triggerDownload(zipBlob, zipFilename);

    // Clear draft and show success screen
    localStorage.removeItem(STORAGE_KEY);
    setExportedFiles({ zipFilename, xlsxFilename, pyFilename });
    setSubmission(null);
    setScreen('success');
  }

  // Always does both: downloads the ZIP (the NGO's backup copy) and sends it to KawanBantu.
  // A retry re-sends the same ZIP without downloading it again. Throws a user-readable error.
  async function handleSubmit({ retry = false } = {}) {
    let zip = retry ? lastZipRef.current : null;
    if (!zip) {
      zip = await generateExportZip(ngoName, adRows);
      lastZipRef.current = zip;
      triggerDownload(zip.blob, zip.filename);
    }
    setExportedFiles({ zipFilename: zip.filename, xlsxFilename: zip.xlsxFilename, pyFilename: zip.pyFilename });
    const result = await submitToKawanBantu({
      ngoName: ngoName.trim(),
      submissionDate: zip.submissionDate,
      adCount: zip.adCount,
      mode: zip.mode,
      postLinks: zip.postLinks,
      zipName: zip.filename.replace(/[/\\:*?"<>|]/g, '_'), // same characters a browser download would replace
      zipBase64: bytesToBase64(zip.bytes),
    });
    localStorage.removeItem(STORAGE_KEY);
    lastZipRef.current = null;
    setSubmission({ submissionId: result.submissionId, receivedAt: result.receivedAt });
    setScreen('success');
  }

  // Sending failed but the ZIP is already downloaded: the NGO sends it via WhatsApp instead.
  function handleContinueWithoutSend() {
    localStorage.removeItem(STORAGE_KEY);
    lastZipRef.current = null;
    setSubmission(null);
    setScreen('success');
  }

  async function handleReDownload() {
    const { blob: zipBlob, filename: zipFilename } = await generateExportZip(ngoName, adRows);
    triggerDownload(zipBlob, zipFilename);
  }

  function handleStartOver() {
    nextId = 1;
    setNgoName('');
    setAdRows([createEmptyRow()]);
    setExportedFiles(null);
    setSubmission(null);
    setScreen('form');
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {screen === 'form' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#2B2033]">Submission Iklan</h1>
              <p className="text-sm text-gray-500 mt-1">
                Isi form di bawah lalu klik "Review Sebelum Export" untuk mengunduh file submission.
              </p>
            </div>

            <TopFields ngoName={ngoName} onChange={handleTopChange} />

            <AdTable
              adRows={adRows}
              onUpdate={handleUpdateRow}
              onDelete={handleDeleteRow}
              onAdd={handleAddRow}
            />

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-end items-center gap-3 z-40">
              {hasErrors && (
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Lengkapi semua field untuk melanjutkan
                </span>
              )}
              <button
                type="button"
                onClick={() => setScreen('review')}
                disabled={hasErrors}
                className="font-bold rounded-xl px-6 py-2.5 text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{ background: 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
              >
                Review Sebelum Export →
              </button>
            </div>

            <div className="h-20" />
          </>
        )}

        {screen === 'review' && (
          <ReviewScreen
            ngoName={ngoName}
            adRows={adRows}
            onBack={() => setScreen('form')}
            onExport={handleExport}
            onSubmit={handleSubmit}
            onContinueWithoutSend={handleContinueWithoutSend}
          />
        )}

        {screen === 'success' && (
          <SuccessScreen
            ngoName={ngoName}
            exportedFiles={exportedFiles}
            submission={submission}
            onStartOver={handleStartOver}
            onEdit={() => setScreen('form')}
            onReDownload={handleReDownload}
          />
        )}
      </main>
    </div>
  );
}
