export default function Footer() {
  return (
    <footer className="text-center text-xs text-brown2 py-6 px-4 space-y-2 pb-32 sm:pb-24">
      <div>© Natasha Berness · natashaberness.com · Educational use only. Not a medical diagnosis.</div>
      <div className="space-x-3">
        <a href="/privacy" className="underline hover:text-amber1">Privacy</a>
        <span aria-hidden="true">·</span>
        <a href="/terms" className="underline hover:text-amber1">Terms of Service</a>
        <span aria-hidden="true">·</span>
        <a href="mailto:natasha@natashaberness.com" className="underline hover:text-amber1">Contact</a>
      </div>
      <div className="text-[10px] text-brown2 max-w-xl mx-auto leading-relaxed">
        <strong>Affiliate disclosure:</strong> Some product links earn Natasha a small commission at no extra cost to you. Natasha is the author of <em>The MTHFR Peptide Protocol</em>.
      </div>
    </footer>
  );
}
