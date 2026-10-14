import { useEffect, useMemo, useState } from 'react';
import Welcome from './components/Welcome.jsx';
import Quiz from './components/Quiz.jsx';
import DnaUpload from './components/DnaUpload.jsx';
import Education from './components/Education.jsx';
import LeadCapture from './components/LeadCapture.jsx';
import Report from './components/Report.jsx';
import Conversion from './components/Conversion.jsx';
import Footer from './components/Footer.jsx';
import CookieBanner from './components/CookieBanner.jsx';
import { pickProtocol } from './lib/protocolRouter.js';

const STAGES = ['welcome', 'quiz', 'dna', 'education', 'lead', 'report', 'conversion'];

function path() {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 py-12 flex justify-center">
      <div className="card max-w-2xl w-full">
        <p className="heading text-amber1 text-xs mb-2">Privacy & Cookies</p>
        <h1 className="heading text-3xl text-brown1 mb-4">Privacy Policy</h1>
        <p className="text-brown2 mb-4 text-sm">Last updated: April 2026</p>
        <p className="text-brown2 mb-4">
          MTHFR IQ ("we", "us") is operated by Natasha Berness. This policy explains what information we collect, how it is used, who it is shared with, and your rights to control it. We collect only the minimum information needed to deliver your personalized report and educational follow-ups.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Information we collect</h2>
        <ul className="list-disc pl-6 text-brown2 mb-4 space-y-1">
          <li><strong>Quiz answers</strong> — your responses to symptom and history questions</li>
          <li><strong>Contact information</strong> — first name, email address, and an optional health-challenge note you may provide</li>
          <li><strong>Genetic data, if you choose to upload it</strong> — DNA or lab files are processed in server memory to identify methylation-related variants and are immediately discarded. We do not write your raw genetic data to disk and we do not retain it.</li>
          <li><strong>Browser local storage</strong> — a small preference to remember you've seen the cookie notice and to save your in-progress quiz answers so you don't lose your place if you refresh</li>
        </ul>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">How we use your information</h2>
        <ul className="list-disc pl-6 text-brown2 mb-4 space-y-1">
          <li>To generate and deliver your personalized MTHFR report</li>
          <li>To send you educational follow-ups, protocol updates, and occasional offers (you may unsubscribe at any time)</li>
          <li>To improve the assessment based on aggregate (non-identifying) usage patterns</li>
        </ul>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Use of artificial intelligence (AI)</h2>
        <p className="text-brown2 mb-4">
          Your quiz answers and any uploaded DNA data are processed by Anthropic's Claude AI to generate your personalized report. Anthropic does not train its models on this data. We do not retain the raw inputs to Claude after the report is delivered.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Who has access to your data</h2>
        <p className="text-brown2 mb-3">We share information only with the service providers that help us run this assessment:</p>
        <ul className="list-disc pl-6 text-brown2 mb-4 space-y-1">
          <li><strong>Anthropic (Claude AI)</strong> — generates your report and DNA analysis</li>
          <li><strong>Resend</strong> — delivers your report email</li>
          <li><strong>Make.com → GoHighLevel CRM</strong> — stores your name, email, quiz responses, recommended protocol tier, and optional health-challenge note so Natasha can follow up with you</li>
          <li><strong>Railway</strong> — hosts the application infrastructure</li>
        </ul>
        <p className="text-brown2 mb-4">
          We do not sell your data, share it with advertisers, or transfer it to anyone outside of these processors.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Genetic information (GINA notice)</h2>
        <p className="text-brown2 mb-4">
          The Genetic Information Nondiscrimination Act (GINA) provides specific protections for genetic data in the United States. Your uploaded DNA file is analyzed in memory only, never written to disk, and never shared with insurers, employers, or third parties. If you have concerns, you may complete the assessment without uploading any genetic data.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Your rights (CCPA, CPRA, GDPR)</h2>
        <p className="text-brown2 mb-3">You have the right to:</p>
        <ul className="list-disc pl-6 text-brown2 mb-4 space-y-1">
          <li>Request a copy of the personal information we hold about you</li>
          <li>Correct or update your information</li>
          <li>Request deletion of your information ("right to be forgotten")</li>
          <li>Opt out of marketing communications at any time</li>
          <li>For California residents: you have the right to know what we collect and to direct us not to sell your personal information (we do not sell personal information)</li>
        </ul>
        <p className="text-brown2 mb-4">
          To exercise any of these rights, email <a href="mailto:natasha@natashaberness.com" className="underline text-amber1">natasha@natashaberness.com</a>. We respond within 30 days.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Data retention</h2>
        <p className="text-brown2 mb-4">
          Contact information and quiz responses are retained in our CRM until you request deletion or three years after your last interaction, whichever comes first. DNA file contents are never retained beyond the few seconds required to generate your analysis.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Children's privacy</h2>
        <p className="text-brown2 mb-4">
          MTHFR IQ is intended for adults 18 years and older. We do not knowingly collect information from anyone under 18. If you believe a minor has submitted information, contact us immediately and we will delete it.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Cookies and tracking</h2>
        <p className="text-brown2 mb-4">
          We use minimal browser local storage (not third-party cookies) to remember your cookie-notice preference and to save your quiz progress. We do not use advertising pixels, tracking cookies, or third-party analytics scripts. The shop links in your report include UTM parameters so we can measure which protocol tier converts best — these are aggregate metrics only.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">Contact</h2>
        <p className="text-brown2 mb-6">
          Questions, concerns, or requests: <a href="mailto:natasha@natashaberness.com" className="underline text-amber1">natasha@natashaberness.com</a>
        </p>

        <p className="text-xs text-brown2 mt-8">
          This tool is for educational purposes only and is not a medical diagnosis. Always consult your healthcare provider.
        </p>
        <a href="/" className="btn-ghost mt-8 inline-block">← Back to MTHFR IQ</a>
      </div>
    </div>
  );
}

function TermsPage() {
  return (
    <div className="min-h-screen px-4 py-12 flex justify-center">
      <div className="card max-w-2xl w-full">
        <p className="heading text-amber1 text-xs mb-2">Terms of Service</p>
        <h1 className="heading text-3xl text-brown1 mb-4">Terms of Service</h1>
        <p className="text-brown2 mb-4 text-sm">Last updated: April 2026</p>
        <p className="text-brown2 mb-4">
          By using MTHFR IQ ("the Service"), you agree to these terms. Please read them carefully. If you do not agree, do not use the Service.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">1. Educational use only — not medical advice</h2>
        <p className="text-brown2 mb-4">
          MTHFR IQ provides educational information about methylation, MTHFR gene variants, and general wellness. <strong>It does not provide medical advice, diagnosis, or treatment.</strong> The personalized report generated by the Service is not a substitute for the professional judgment of a licensed healthcare provider. Always consult your doctor, naturopath, or qualified practitioner before starting, changing, or stopping any supplement, diet, exercise, or treatment plan.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">2. Practitioner status</h2>
        <p className="text-brown2 mb-4">
          Natasha Berness is a certified biohacker, NES Health practitioner, and wellness educator. She is not a licensed medical doctor, registered dietitian, or licensed nurse. Consultations booked through this Service are educational coaching sessions, not medical appointments.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">3. Eligibility</h2>
        <p className="text-brown2 mb-4">
          You must be at least 18 years old to use the Service. By using it, you represent that you are 18+ and that any information you provide is true and accurate.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">4. Affiliate relationships</h2>
        <p className="text-brown2 mb-4">
          The Service contains affiliate links. Natasha may earn a commission on supplements purchased through SoliVana Shop, on books purchased on Amazon, and on any product links in the personalized report. These commissions never affect the price you pay. Natasha is the author of <em>The MTHFR Peptide Protocol</em> and earns royalties on sales of that book. We disclose these relationships in compliance with FTC guidelines.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">5. AI-generated content</h2>
        <p className="text-brown2 mb-4">
          Reports are generated by AI (Anthropic Claude) using your quiz answers and optional DNA input. AI-generated content can contain errors or omissions. The report represents general patterns and educational guidance, not a guaranteed clinical assessment. Use it as a starting point for conversations with your healthcare provider.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">6. Genetic information</h2>
        <p className="text-brown2 mb-4">
          If you upload DNA data, you confirm you have the right to share it. Your file is processed in memory only, immediately discarded, and never stored or shared. See our <a href="/privacy" className="underline text-amber1">Privacy Policy</a> for full details.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">7. No warranty</h2>
        <p className="text-brown2 mb-4">
          The Service is provided "as is" without warranty of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that the report will produce any specific health outcome.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">8. Limitation of liability</h2>
        <p className="text-brown2 mb-4">
          To the fullest extent permitted by law, Natasha Berness, her business entities, and the Service shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service or any reliance on its content. Your sole remedy is to stop using the Service.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">9. Intellectual property</h2>
        <p className="text-brown2 mb-4">
          All content on MTHFR IQ — including the assessment, the report format, the educational modules, and the brand — is the intellectual property of Natasha Berness. You may use the personalized report you receive for your own personal use. You may not reproduce, redistribute, or commercialize any part of the Service without written permission.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">10. Changes to these terms</h2>
        <p className="text-brown2 mb-4">
          We may update these terms from time to time. The "Last updated" date at the top of this page shows when changes were made. Continued use of the Service after changes constitutes acceptance of the updated terms.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">11. Governing law</h2>
        <p className="text-brown2 mb-4">
          These terms are governed by the laws of the State of Texas, United States, without regard to conflict-of-law principles.
        </p>

        <h2 className="heading text-lg text-brown1 mt-6 mb-2">12. Contact</h2>
        <p className="text-brown2 mb-6">
          Questions about these terms? Email <a href="mailto:natasha@natashaberness.com" className="underline text-amber1">natasha@natashaberness.com</a>
        </p>

        <p className="text-xs text-brown2 mt-8">
          This tool is for educational purposes only and is not a medical diagnosis. Always consult your healthcare provider.
        </p>
        <a href="/" className="btn-ghost mt-8 inline-block">← Back to MTHFR IQ</a>
      </div>
    </div>
  );
}

export default function App() {
  const p = path();
  if (p.startsWith('/privacy')) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1" id="main"><PrivacyPage /></main>
        <Footer />
      </div>
    );
  }
  if (p.startsWith('/terms')) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1" id="main"><TermsPage /></main>
        <Footer />
      </div>
    );
  }
  return <Quiz_App />;
}

// Detect Foundation members via ?ref=foundation-member URL param.
// Persisted in sessionStorage so a refresh mid-flow doesn't lose the flag.
function readFoundationRefFlag() {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ref') === 'foundation-member') {
      sessionStorage.setItem('foundation_member_ref', '1');
      return true;
    }
    return sessionStorage.getItem('foundation_member_ref') === '1';
  } catch {
    return false;
  }
}

function Quiz_App() {
  const [stage, setStage] = useState('welcome');
  const [quizAnswers, setQuizAnswers] = useState(null);
  const [dnaAnalysis, setDnaAnalysis] = useState(null);
  const [lead, setLead] = useState(null);
  const [reportHtml, setReportHtml] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [config, setConfig] = useState(null);
  // True if URL had ?ref=foundation-member OR if email lookup confirmed
  // foundation-active-cohort tag in GHL.
  const [isFoundationMember, setIsFoundationMember] = useState(false);

  useEffect(() => {
    if (readFoundationRefFlag()) setIsFoundationMember(true);
  }, []);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setConfig({}));
  }, []);

  const recommendedProtocol = useMemo(
    () => pickProtocol(quizAnswers, dnaAnalysis),
    [quizAnswers, dnaAnalysis]
  );

  function go(next) {
    setStage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLeadSubmit(payload) {
    setLead(payload);

    // Email-based Foundation membership check (in addition to URL-ref flag).
    // Catches members who landed on this app directly without the referral
    // parameter. Best-effort — failure does not block the flow.
    let memberFromEmail = false;
    try {
      const check = await fetch('/api/check-foundation-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email }),
      });
      if (check.ok) {
        const j = await check.json();
        memberFromEmail = !!j.isMember;
      }
    } catch {
      // Silent fail — keep URL-ref status if any.
    }
    const memberConfirmed = isFoundationMember || memberFromEmail;
    if (memberConfirmed && !isFoundationMember) setIsFoundationMember(true);

    go('report');
    setReportLoading(true);
    setReportError('');
    try {
      // 1. Generate report
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAnswers,
          dnaAnalysis,
          firstName: payload.firstName,
          recommendedProtocol,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Report failed');
      setReportHtml(data.html);

      // 2. Send email (fire and forget — failure shouldn't block UX)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: payload.firstName,
          email: payload.email,
          reportHtml: data.html,
          recommendedProtocol,
        }),
      }).catch((e) => console.warn('email send failed', e));

      // 3. Push to Make.com
      fetch('/api/push-to-make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: payload.firstName,
          email: payload.email,
          challenge: payload.challenge,
          quiz_answers: quizAnswers,
          dna_uploaded: !!dnaAnalysis,
          methylation_type: dnaAnalysis?.methylation_type || null,
          recommended_protocol: recommendedProtocol,
          is_foundation_member: memberConfirmed,
          referral_source: isFoundationMember ? 'foundation-member-link' : null,
          consent_at: new Date().toISOString(),
        }),
      }).catch((e) => console.warn('make push failed', e));
    } catch (e) {
      setReportError(e.message);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1" id="main">
        {stage === 'welcome' && <Welcome onStart={() => go('quiz')} />}
        {stage === 'quiz' && (
          <Quiz
            onComplete={(answers) => {
              setQuizAnswers(answers);
              go('dna');
            }}
          />
        )}
        {stage === 'dna' && (
          <DnaUpload
            onComplete={(analysis) => {
              setDnaAnalysis(analysis);
              go('education');
            }}
            onSkip={() => go('education')}
          />
        )}
        {stage === 'education' && <Education onComplete={() => go('lead')} />}
        {stage === 'lead' && (
          <LeadCapture
            onSubmit={handleLeadSubmit}
            isFoundationMember={isFoundationMember}
          />
        )}
        {stage === 'report' && (
          <Report
            html={reportHtml}
            firstName={lead?.firstName}
            loading={reportLoading}
            error={reportError}
            onContinue={() => go('conversion')}
            recommendedProtocol={recommendedProtocol}
          />
        )}
        {stage === 'conversion' && (
          <Conversion
            config={config}
            recommendedProtocol={recommendedProtocol}
            isFoundationMember={isFoundationMember}
            onBack={() => go('report')}
          />
        )}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
