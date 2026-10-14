import { useRef, useState } from 'react';

export default function Report({ html, firstName, loading, error, onContinue, recommendedProtocol }) {
  const reportRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadPDF() {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const dateStr = new Date().toISOString().split('T')[0];
      const safeName = (firstName || 'mthfr').toLowerCase().replace(/[^a-z0-9]/g, '-');
      await html2pdf()
        .set({
          margin: 0.5,
          filename: `mthfr-protocol-${safeName}-${dateStr}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(reportRef.current)
        .save();
      // Fire-and-forget tracking — don't block UX on failure
      fetch('/api/push-to-make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'pdf_downloaded',
          first_name: firstName || '',
          recommended_protocol: recommendedProtocol || '',
        }),
      }).catch(() => {});
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center fade-in">
          <div className="inline-block w-12 h-12 border-4 border-amber1 border-t-transparent rounded-full animate-spin mb-6" />
          <p className="heading text-brown1">Generating your personalized report…</p>
          <p className="text-sm text-brown2 mt-2">Claude is analyzing your responses. This takes about 20 seconds.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-lg text-center">
          <h2 className="heading text-2xl text-brown1 mb-3">Something Went Wrong</h2>
          <p className="text-brown2 mb-4">{error}</p>
          <button onClick={onContinue} className="btn-primary">Continue Anyway</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 flex justify-center">
      <div className="max-w-3xl w-full fade-in">
        <div ref={reportRef} className="card">
          <p className="heading text-amber1 text-xs mb-2">Your MTHFR Report</p>
          <h2 className="heading text-3xl text-brown1 mb-2">{firstName ? `${firstName}, here's your report` : 'Your Report'}</h2>
          <p className="text-xs text-brown2 mb-6">A copy has been emailed to you for safe keeping.</p>
          <div className="report-html" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <div className="text-center mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button onClick={onContinue} className="btn-primary">See My Next Steps</button>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="text-sm heading py-3 px-6 rounded-lg border border-amber1 text-brown1 hover:bg-amber1/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Preparing PDF…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
