import { useState } from 'react';

export default function DnaUpload({ onComplete, onSkip }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/analyze-dna', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      onComplete(data.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="card max-w-2xl w-full fade-in">
        <p className="heading text-amber1 text-xs mb-3">Optional Step</p>
        <h2 className="heading text-3xl text-brown1 mb-3">Unlock Your Personalized Analysis</h2>
        <p className="text-brown2 mb-6">
          Upload your 23andMe raw data, AncestryDNA file, or any lab report with MTHFR results.
          Claude AI will analyze your specific variants and tailor your recommendations.
        </p>
        <p className="text-xs text-brown2 mb-6">
          Supported sources: 23andMe · AncestryDNA · Strategene · LabCorp · Quest <br />
          Accepted file types: .txt, .csv, .pdf, .zip
        </p>

        <label className="block border-2 border-dashed border-taupe1 rounded-xl p-8 text-center cursor-pointer hover:border-amber1 transition">
          <input
            type="file"
            accept=".txt,.csv,.pdf,.zip"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="heading text-brown1">{file ? file.name : 'Click to choose a file'}</p>
          {file && <p className="text-xs text-brown2 mt-1">{(file.size / 1024).toFixed(0)} KB</p>}
        </label>

        {error && <p className="text-red-700 text-sm mt-4">{error}</p>}

        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button onClick={upload} disabled={!file || loading} className="btn-primary">
            {loading ? 'Analyzing…' : 'Analyze My DNA'}
          </button>
          <button onClick={onSkip} disabled={loading} className="btn-ghost">
            Skip This Step
          </button>
        </div>

        <p className="text-[11px] text-brown2 mt-6 text-center">
          Your file is analyzed and discarded. We do not store your raw genetic data.
        </p>
      </div>
    </div>
  );
}
