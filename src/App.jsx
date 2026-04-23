import { useState, useCallback } from 'react';
import Header from './components/Header';
import TopFields from './components/TopFields';
import AdTable from './components/AdTable';
import ReviewScreen from './components/ReviewScreen';
import { validate } from './utils/validation';
import { generateXLSX } from './utils/xlsxGenerator';
import { generatePythonScript } from './utils/pythonScriptGenerator';
import { getLocalDateString } from './utils/driveUtils';

let nextId = 1;

function createEmptyRow() {
  return {
    id: nextId++,
    adName: '',
    campaignLink: '',
    creatives: [{ link: '', type: 'Video' }],
    primaryTexts: [''],
    headlines: [''],
  };
}

export default function App() {
  const [screen, setScreen] = useState('form');
  const [ngoName, setNgoName] = useState('');
  const [adRows, setAdRows] = useState([createEmptyRow()]);

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

  function handleExport() {
    const date = getLocalDateString();

    // Generate both files first, then stagger downloads 400ms apart
    // (browsers block simultaneous programmatic downloads from the same gesture)
    const pyContent = generatePythonScript(ngoName, adRows);
    const pyBlob = new Blob([pyContent], { type: 'text/plain' });

    const { blob: xlsxBlob, filename: xlsxFilename } = generateXLSX(ngoName, adRows);

    triggerDownload(pyBlob, `download_creatives_${ngoName}_${date}.py`);
    setTimeout(() => triggerDownload(xlsxBlob, xlsxFilename), 400);
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {screen === 'form' ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#2B2033]">Submission Iklan</h1>
              <p className="text-sm text-gray-500 mt-1">
                Isi form di bawah lalu klik "Review Sebelum Export" untuk mengunduh file submission.
              </p>
            </div>

            <TopFields
              ngoName={ngoName}
              onChange={handleTopChange}
            />

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
        ) : (
          <ReviewScreen
            ngoName={ngoName}
            adRows={adRows}
            onBack={() => setScreen('form')}
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  );
}
