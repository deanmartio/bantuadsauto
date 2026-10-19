import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import TopFields from './components/TopFields';
import AdTable from './components/AdTable';
import ReviewScreen from './components/ReviewScreen';
import SuccessScreen from './components/SuccessScreen';
import { getIssues, getDuplicateAdNames } from './utils/validation';
import IssueGuide from './components/IssueGuide';
import SidePanel from './components/SidePanel';
import { Icon } from './components/ui';
import { generateExportZip, bytesToBase64, getSubmissionSummary } from './utils/zipGenerator';
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
  const [submission, setSubmission] = useState(null); // { submissionId, receivedAt } after "Kirim ke KawanBantu"
  const lastZipRef = useRef(null); // the ZIP already downloaded, reused when re-sending after a failure
  const [showIssues, setShowIssues] = useState(false); // field-level errors appear after the first "Lanjut" attempt
  const [guideOpen, setGuideOpen] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());
  const [activeRowId, setActiveRowId] = useState(null); // the card being edited; the side panel follows it

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

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
    const row = createEmptyRow();
    setAdRows(prev => [...prev, row]);
    setActiveRowId(row.id);
    requestAnimationFrame(() => document.getElementById(`ad-${row.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const issues = getIssues(ngoName, adRows);
  const hasErrors = issues.length > 0;
  const duplicateCount = getDuplicateAdNames(adRows).size;

  const currentRowId = adRows.some(r => r.id === activeRowId) ? activeRowId : adRows[0]?.id;

  // Ledger line clicked: open that card, bring it into view, make it the active one.
  function jumpToRow(rowId) {
    setActiveRowId(rowId);
    if (collapsedIds.has(rowId)) toggleCollapse(rowId);
    requestAnimationFrame(() => document.getElementById(`ad-${rowId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function toggleCollapse(rowId) {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
      return next;
    });
  }

  // Open the ad that holds the field (if collapsed), then scroll to it and focus it.
  function jumpTo(issue) {
    setGuideOpen(false);
    if (issue.rowId != null && collapsedIds.has(issue.rowId)) toggleCollapse(issue.rowId);
    requestAnimationFrame(() => {
      const el = issue.id && document.getElementById(issue.id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    });
  }

  function handleContinue() {
    if (hasErrors) {
      setShowIssues(true);
      jumpTo(issues[0]);
      setGuideOpen(true);
      return;
    }
    setScreen('review');
  }

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
    setShowIssues(false);
    setCollapsedIds(new Set());
    setScreen('form');
  }

  const totalAds = getSubmissionSummary(adRows).adCount;

  return (
    <div className="min-h-screen bg-paper">
      <Header screen={screen} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-7 sm:py-9">
        {screen === 'form' && (
          <>
            <div className="mb-6 max-w-2xl">
              <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink tracking-[-0.02em]">Submission Iklan</h1>
              <p className="text-[15px] text-ink-soft mt-2 leading-relaxed">
                Isi data iklan di bawah. Satu kartu untuk satu cerita atau halaman campaign; setiap video, gambar
                atau postingan di dalamnya jadi 1 iklan.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px] items-start">
              <div className="flex flex-col gap-4 min-w-0">
                <TopFields
                  ngoName={ngoName}
                  onChange={handleTopChange}
                  error={showIssues && !ngoName.trim() ? 'Nama NGO wajib diisi.' : null}
                />
                <AdTable
                  adRows={adRows}
                  issues={issues}
                  showIssues={showIssues}
                  collapsedIds={collapsedIds}
                  activeRowId={currentRowId}
                  onActivate={setActiveRowId}
                  onToggleCollapse={toggleCollapse}
                  onUpdate={handleUpdateRow}
                  onDelete={handleDeleteRow}
                  onAdd={handleAddRow}
                />
              </div>
              <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto lg:rounded-2xl" aria-label="Pratinjau dan rincian iklan">
                <SidePanel ngoName={ngoName} adRows={adRows} activeRowId={currentRowId} onJump={jumpToRow} />
              </aside>
            </div>

            <IssueGuide issues={issues} open={guideOpen && hasErrors} onClose={() => setGuideOpen(false)} onJump={jumpTo} />

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-3">
                <p className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink"><span className="font-mono tabular-nums">{adRows.length}</span> kartu</span>
                  {' · '}<span className="font-mono tabular-nums">{totalAds}</span> iklan
                  {duplicateCount > 0 && <span className="text-danger font-semibold"> · ada nama iklan dobel</span>}
                </p>
                <div className="flex items-center gap-2">
                  {hasErrors && showIssues && (
                    <button
                      type="button"
                      data-issue-toggle
                      onClick={() => setGuideOpen(o => !o)}
                      aria-expanded={guideOpen}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-danger bg-danger-tint hover:brightness-95 transition"
                    >
                      <Icon name="alert" className="w-4 h-4" />
                      <span className="font-mono tabular-nums">{issues.length}</span> belum lengkap
                    </button>
                  )}
                  <button type="button" onClick={handleContinue} className="btn-primary">
                    Review Sebelum Kirim <Icon name="arrowRight" />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-24" />
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
