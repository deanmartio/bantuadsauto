import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import TopFields from './components/TopFields';
import AdTable from './components/AdTable';
import ReviewScreen from './components/ReviewScreen';
import SuccessScreen from './components/SuccessScreen';
import { getIssues } from './utils/validation';
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

function saveDraft(ngoName, adRows, sentAs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ngoName, adRows, sentAs }));
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
  // Submission this draft was already sent as. Editing and re-sending replaces it in the tracker.
  const [sentAs, setSentAs] = useState(draft?.sentAs ?? null);
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());
  const [activeRowId, setActiveRowId] = useState(null); // the card being edited; the side panel follows it

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  // Auto-save draft on every change
  useEffect(() => {
    saveDraft(ngoName, adRows, sentAs);
  }, [ngoName, adRows, sentAs]);

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

    setExportedFiles({ zipFilename, xlsxFilename, pyFilename });
    setSubmission(null);
    setScreen('success');
  }

  // Always does both: downloads the ZIP (the NGO's backup copy) and sends it to KawanBantu.
  // A retry re-sends the same ZIP without downloading it again. Throws a user-readable error.
  // onStage reports progress to the review screen: 'prepare' -> 'upload' -> 'done'.
  async function handleSubmit({ retry = false, onStage = () => {} } = {}) {
    let zip = retry ? lastZipRef.current : null;
    if (!zip) {
      onStage('prepare');
      zip = await generateExportZip(ngoName, adRows);
      lastZipRef.current = zip;
      triggerDownload(zip.blob, zip.filename);
    }
    onStage('upload', zip.bytes.length);
    setExportedFiles({ zipFilename: zip.filename, xlsxFilename: zip.xlsxFilename, pyFilename: zip.pyFilename });
    const result = await submitToKawanBantu({
      ngoName: ngoName.trim(),
      submissionDate: zip.submissionDate,
      adCount: zip.adCount,
      mode: zip.mode,
      postLinks: zip.postLinks,
      zipName: zip.filename.replace(/[/\\:*?"<>|]/g, '_'), // same characters a browser download would replace
      zipBase64: bytesToBase64(zip.bytes),
      replacesSubmissionId: sentAs?.submissionId || undefined,
    });
    onStage('done');
    lastZipRef.current = null;
    const sent = { submissionId: result.submissionId, receivedAt: result.receivedAt, replaced: sentAs?.submissionId || null };
    setSubmission(sent);
    setSentAs(sent); // the draft stays, so the NGO can still edit and re-send
    setScreen('success');
  }

  // Sending failed but the ZIP is already downloaded: the NGO sends it via WhatsApp instead.
  function handleContinueWithoutSend() {
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
    setSentAs(null);
    setShowIssues(false);
    setCollapsedIds(new Set());
    localStorage.removeItem(STORAGE_KEY);
    setScreen('form');
  }

  const totalAds = getSubmissionSummary(adRows).adCount;

  return (
    <div className="min-h-screen bg-paper">
      <Header screen={screen} />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-16">
        {screen === 'form' && (
          <>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px] items-start">
              <div className="flex flex-col gap-5 min-w-0">
                <div className="max-w-3xl">
                  <h1 className="text-[1.75rem] leading-tight font-bold text-ink tracking-[-0.02em]">Submission Iklan</h1>
                  <p className="text-[15px] text-ink-soft mt-2 leading-relaxed">
                    Satu iklan untuk satu cerita; setiap video, gambar atau postingan di dalamnya jadi 1 iklan di Meta.
                  </p>
                </div>

                {sentAs && (
                  <div className="flex items-start gap-3 rounded-2xl bg-plum-tint px-5 py-4" role="status">
                    <Icon name="info" className="w-5 h-5 text-plum-deep mt-0.5 shrink-0" />
                    <p className="text-sm text-ink leading-relaxed">
                      Kamu sedang mengedit submission <span className="font-mono font-medium">{sentAs.submissionId}</span> yang sudah terkirim.
                      Kalau dikirim lagi, versi baru ini yang dipakai tim KawanBantu.
                    </p>
                  </div>
                )}
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
              <aside className="lg:sticky lg:top-5 lg:flex lg:flex-col lg:max-h-[calc(100vh-6.5rem)]" aria-label="Pratinjau, rincian iklan dan kirim">
                <SidePanel
                  ngoName={ngoName}
                  adRows={adRows}
                  activeRowId={currentRowId}
                  onJump={jumpToRow}
                  ads={totalAds}
                  issues={issues}
                  showIssues={showIssues && hasErrors}
                  onContinue={handleContinue}
                  onJumpIssue={jumpTo}
                />
              </aside>
            </div>
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
            onEdit={() => { setShowIssues(false); setScreen('form'); }}
            onReDownload={handleReDownload}
          />
        )}
      </main>
    </div>
  );
}
