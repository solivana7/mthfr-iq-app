import { useState } from 'react';

export default function LeadCapture({ onSubmit, isFoundationMember = false }) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [challenge, setChallenge] = useState('');
  const [consent, setConsent] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (!ageConfirm) {
      setError('Please confirm you are at least 18 years old.');
      return;
    }
    if (!consent) {
      setError('Please review and accept how your information will be used.');
      return;
    }
    setError('');
    onSubmit({ firstName: firstName.trim(), email: email.trim(), challenge: challenge.trim() });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="card max-w-lg w-full fade-in" noValidate>
        {isFoundationMember && (
          <div className="mb-5 -mt-2 px-4 py-3 rounded-lg border border-amber1/40 bg-amber1/5">
            <p className="heading text-[10px] tracking-[0.2em] text-amber1 mb-1">
              FOUNDATION MEMBER
            </p>
            <p className="text-sm text-brown1">
              Welcome back. Your MTHFR IQ report is included with your Foundation membership — no extra charge, ever.
            </p>
          </div>
        )}
        <p className="heading text-amber1 text-xs mb-2">Almost There</p>
        <h2 className="heading text-3xl text-brown1 mb-3">Where Should We Send Your Report?</h2>
        <p className="text-brown2 mb-6 text-sm">
          Your personalized MTHFR report will be generated and emailed to you instantly.
        </p>

        <label className="block mb-4">
          <span className="heading text-xs text-brown2">First Name</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="w-full mt-1 px-4 py-3 border border-taupe1 rounded-lg focus:outline-none focus:border-amber1"
            required
            aria-required="true"
          />
        </label>

        <label className="block mb-4">
          <span className="heading text-xs text-brown2">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            className="w-full mt-1 px-4 py-3 border border-taupe1 rounded-lg focus:outline-none focus:border-amber1"
            required
            aria-required="true"
          />
        </label>

        <label className="block mb-6">
          <span className="heading text-xs text-brown2">What's your biggest health challenge right now? (optional)</span>
          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            rows={3}
            className="w-full mt-1 px-4 py-3 border border-taupe1 rounded-lg focus:outline-none focus:border-amber1"
          />
        </label>

        <label className="flex items-start gap-3 mb-3 text-xs text-brown2 cursor-pointer">
          <input
            type="checkbox"
            checked={ageConfirm}
            onChange={(e) => setAgeConfirm(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber1"
            required
            aria-required="true"
          />
          <span>I confirm I am at least 18 years old.</span>
        </label>

        <label className="flex items-start gap-3 mb-6 text-xs text-brown2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-amber1"
            required
            aria-required="true"
          />
          <span>
            I agree to receive my report and educational emails from Natasha. I understand my responses are processed by AI (Anthropic Claude) to generate the report, and that my contact details will be stored in Natasha's CRM. See the{' '}
            <a href="/privacy" className="underline text-amber1">Privacy Policy</a> and{' '}
            <a href="/terms" className="underline text-amber1">Terms of Service</a>.
          </span>
        </label>

        {error && (
          <p className="text-red-700 text-sm mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="text-center">
          <button type="submit" className="btn-primary">Generate My Report</button>
        </div>
        <p className="text-[11px] text-brown2 mt-6 text-center leading-relaxed">
          Educational use only. Not a medical diagnosis. We never sell your data.
        </p>
      </form>
    </div>
  );
}
