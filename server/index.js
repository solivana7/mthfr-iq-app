import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Trust Railway's proxy so rate limiter sees real client IP
app.set('trust proxy', 1);

// ---------- Security middleware ----------
app.use(
  helmet({
    contentSecurityPolicy: false, // disabled — we serve our own bundled client and need inline styles for fonts
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));

// ---------- Rate limiters (cost protection on Claude endpoints) ----------
// Generous global limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' },
});

// Tight limit on Claude-billed endpoints (DNA analysis + report generation)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 per IP per hour — generous for legit users, kills abuse
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You have generated too many reports. Please try again in an hour.' },
});

app.use('/api/', globalLimiter);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5';

// ---------- Helpers ----------
async function extractText(file) {
  if (!file) return '';
  const name = (file.originalname || '').toLowerCase();
  if (name.endsWith('.pdf')) {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(file.buffer);
    return data.text || '';
  }
  // .txt, .csv, .zip (zip we just attempt utf8 — most 23andMe raw is plain txt)
  return file.buffer.toString('utf8').slice(0, 200_000);
}

function safeJson(text) {
  try { return JSON.parse(text); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

async function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// ---------- POST /api/analyze-dna ----------
app.post('/api/analyze-dna', aiLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const raw = await extractText(req.file);
    if (!raw) return res.status(400).json({ error: 'Could not read file content' });

    // Trim huge raw DNA files: keep header + any line containing MTHFR/COMT/MTRR/MTR/PEMT/CBS
    const lines = raw.split(/\r?\n/);
    const keep = lines.filter((l, i) =>
      i < 30 || /MTHFR|COMT|MTRR|MTR\b|PEMT|CBS|rs1801133|rs1801131|rs4680/i.test(l)
    ).slice(0, 600).join('\n');

    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: `You are Natasha Berness, a certified biohacker and MTHFR specialist, author of The MTHFR Peptide Protocol. Analyze this DNA or lab data and identify: (1) MTHFR variants present (C677T, A1298C, compound heterozygous), (2) related variants if visible (COMT, MTRR, MTR, PEMT, CBS), (3) likely methylation status (undermethylator, overmethylator, neutral), (4) key risks based on variant combination. Return ONLY valid JSON in this shape: { "variants": [{"gene":"","rsid":"","genotype":"","interpretation":""}], "methylation_type": "", "risk_flags": [], "priority_interventions": [] }. Do not diagnose. Frame all findings as educational insights.`,
      messages: [{ role: 'user', content: `Here is the user's DNA/lab data:\n\n${keep}` }],
    });

    const text = msg.content?.[0]?.text || '';
    const parsed = safeJson(text) || {
      variants: [],
      methylation_type: 'unknown',
      risk_flags: [],
      priority_interventions: [],
      raw_note: 'Analysis returned unstructured output.',
    };
    res.json({ ok: true, analysis: parsed });
  } catch (err) {
    console.error('analyze-dna error:', err);
    res.status(500).json({ error: 'DNA analysis failed', detail: err.message });
  }
});

// ---------- POST /api/generate-report ----------
app.post('/api/generate-report', aiLimiter, async (req, res) => {
  try {
    const { quizAnswers, dnaAnalysis, firstName, recommendedProtocol } = req.body || {};
    if (!quizAnswers || typeof quizAnswers !== 'object') {
      return res.status(400).json({ error: 'quizAnswers required' });
    }

    const protocolNote = recommendedProtocol
      ? `\n\nRecommended protocol tier (based on the router): ${recommendedProtocol} (one of: starter, complete, detox)`
      : '';

    const userBlock = `First name: ${firstName || 'Friend'}\n\nQuiz answers:\n${JSON.stringify(quizAnswers, null, 2)}\n\nDNA analysis: ${dnaAnalysis ? JSON.stringify(dnaAnalysis, null, 2) : 'None provided'}${protocolNote}`;

    const systemPrompt = `You are Natasha Berness, certified biohacker, NES Health practitioner, and author of The MTHFR Peptide Protocol (ISBN 979-8-253-70369-4). Based on the user's quiz responses and any DNA data provided, generate a personalized MTHFR wellness report.

REPORT STRUCTURE — use these exact sections in this order:
(1) Your Methylation Profile — what their answers suggest about their methylation status
(2) Key Risk Areas — top 3 concerns based on responses
(3) Priority Interventions — top 5 recommended actions in plain language
(4) Supplement Protocol — specific forms and why (methylfolate not folic acid, methylcobalamin not cyanocobalamin, etc.)
(5) Lifestyle Foundations — 3 key non-supplement changes
(6) Your Next Step — book a consult with Natasha (the booking link is added automatically — do not include a URL yourself)

SUPPLEMENT BRAND RULES (CRITICAL — these are the ONLY products in our Fullscript dispensary):
You MUST recommend the exact products listed in the Protocol Tier below for the user's recommended tier. Do NOT substitute, invent, or add products outside this list. Do NOT mention Metagenics, Pure Encapsulations, Designs for Health, or any brand not on this list. Do NOT recommend standalone Thorne 5-MTHF, Methylcobalamin, or Basic B Complex — methylation B's come bundled inside the multi for each tier.

Approved brands in our dispensary:
- **Thorne** — foundational
- **Codeage** — methylation multivitamin
- **Nordic Naturals** — omegas only (replaces Metagenics)
- **Quicksilver Scientific** — liposomal delivery (Detox tier only)
- **Premier Research Labs** — Tranquinol botanical sleep/calm (Detox tier only)

Troscriptions (Tro+, Blue Cannatine, Tro Calm, Tro Zzz) are NOT in our Fullscript dispensary — they sell direct at troscriptions.com. You may mention them ONLY as an optional practitioner-direct add-on, never as part of the core protocol.

PROTOCOL TIER — RECOMMEND ONLY THESE PRODUCTS, EXACTLY:

**STARTER tier (5 products) — Gentle Methylation Foundation:**
1. Thorne Basic Nutrients 2/Day — 2 capsules with breakfast (gentle multi, includes ~667 mcg L-5-MTHF)
2. Thorne Magnesium Bisglycinate — 1 packet (200 mg) before bed
3. Thorne Vitamin D + K2 Liquid — 2 drops with a fat-containing meal
4. Nordic Naturals ProOmega 2000 — 2 softgels daily (1 AM, 1 PM with food)
5. Thorne FloraMend Prime Probiotic — 1 capsule on empty stomach

**COMPLETE tier (7 products) — Methylation + Cofactors:**
1. Codeage Methylated Multivitamin+ — 3 capsules with breakfast (delivers ~2,266 mcg L-5-MTHF)
2. Thorne Magnesium Bisglycinate — 1 packet before bed
3. Thorne Vitamin D + K2 Liquid — 2 drops with a fat meal
4. Nordic Naturals ProOmega 2000 — 2 softgels daily
5. Thorne FloraMend Prime Probiotic — 1 capsule on empty stomach
6. Thorne Riboflavin 5'-Phosphate (R5P) — 1 capsule with breakfast (CRITICAL B2 cofactor for MTHFR enzyme)
7. Thorne Pyridoxal 5'-Phosphate (P5P) — 1 capsule with breakfast (CRITICAL B6 cofactor for transsulfuration)

**DETOX tier (12 products) — Mobilization + Symptom Support:**
All 7 Complete-tier products above, PLUS:
8. Quicksilver Liposomal Glutathione — 1 pump on empty stomach (cornerstone detox antioxidant)
9. Quicksilver Liposomal Vitamin C — 1 teaspoon mid-morning (recycles glutathione)
10. Thorne Phosphatidyl Choline — 2 softgels with dinner (membrane + biliary detox)
11. Thorne NAC — 1 capsule PM with food, taken 2+ hours apart from B12 (additional glutathione precursor)
12. Premier Research Labs Tranquinol — 1 capsule as needed for daytime nervous system flares; 1–2 capsules as needed before sleep (botanical calming, supports MCAS/POTS — NO melatonin, safer for COMT-slow patients)

CRITICAL TIER RULES:
- Do NOT add standalone B-vitamins (5-MTHF, Methylcobalamin, B Complex) on top of the multi — they are already inside the multi at the right doses
- Do NOT escalate methyl donors at the Detox tier — methylation is held flat at Complete-tier dose; mobilization mimics over-methylation symptoms
- Premier Research Labs does NOT sell standalone TMG/Betaine anhydrous — do NOT recommend "Premier Research Labs Betaine TMG" (does not exist)
- The multi (Codeage or Thorne 2/Day) provides the choline that feeds the BHMT pathway — no separate TMG product is needed
- Recommend ONLY the products in the user's specific tier; do not include products from other tiers

VOICE: Write in second person. Warm, direct, never clinical-cold. Speak with quiet authority — you are the practitioner.

END the report with this exact disclaimer (no other closing): "This report is educational only and is not a medical diagnosis. Always consult your healthcare provider."

FORMAT: Return clean semantic HTML using ONLY <h2>, <h3>, <p>, <ul>, <li>, <strong>. No <html>, <head>, or <body> tags. No inline styles. No <a> tags (the booking link is added automatically).`;

    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userBlock }],
    });

    let html = msg.content?.[0]?.text || '<p>Report generation failed.</p>';

    // Always append a booking CTA so the calendar link is guaranteed to appear
    const calendar = process.env.GHL_CALENDAR_LINK || '';
    if (calendar) {
      html += `
<div style="margin-top:28px; padding:24px; background:#FFF6EC; border-left:4px solid #EC9247; border-radius:8px;">
  <h2 style="font-family:'Jost',sans-serif; text-transform:uppercase; color:#331D01; margin:0 0 12px 0; font-size:1.1rem;">Book Your Free Discovery Call</h2>
  <p style="margin:0 0 16px 0; color:#331D01;">Ready to put this into action? Book a free 20-minute MTHFR discovery call with Natasha to walk through your results and build your protocol.</p>
  <p style="margin:0;"><a href="${calendar}" target="_blank" rel="noopener" style="display:inline-block; background:#EC9247; color:#331D01; padding:14px 28px; text-decoration:none; border-radius:9999px; font-weight:700; font-family:'Jost',sans-serif; text-transform:uppercase; letter-spacing:0.05em;">Book My Discovery Call</a></p>
</div>`;
    }

    res.json({ ok: true, html });
  } catch (err) {
    console.error('generate-report error:', err);
    res.status(500).json({ error: 'Report generation failed', detail: err.message });
  }
});

// ---------- POST /api/send-email ----------
app.post('/api/send-email', async (req, res) => {
  try {
    const { firstName, email, reportHtml, recommendedProtocol } = req.body || {};
    if (!email || !reportHtml) return res.status(400).json({ error: 'email and reportHtml required' });
    if (!resend) return res.status(500).json({ error: 'Resend not configured' });

    const baseFs = process.env.FULLSCRIPT_LINK || 'https://shop.solivana.com';
    const tierLinks = {
      starter: process.env.FULLSCRIPT_LINK_STARTER || baseFs,
      complete: process.env.FULLSCRIPT_LINK_COMPLETE || baseFs,
      detox: process.env.FULLSCRIPT_LINK_DETOX || baseFs,
    };
    const shopLink = tierLinks[recommendedProtocol] || baseFs;
    const calendar = process.env.GHL_CALENDAR_LINK || '#';
    const book = 'https://a.co/d/01yrcwv5';

    const subject = firstName
      ? `Your MTHFR Report is Ready, ${firstName}`
      : 'Your MTHFR Report is Ready';

    const wrapped = `
      <div style="font-family: 'Montserrat', Arial, sans-serif; background:#F0EDED; padding:32px; color:#331D01;">
        <div style="max-width:640px; margin:0 auto; background:#fff; padding:32px; border-radius:8px;">
          <h1 style="font-family: 'Jost', Arial, sans-serif; text-transform:uppercase; color:#331D01; letter-spacing:1px;">Your MTHFR Report</h1>
          <p>Hi ${firstName || 'there'},</p>
          <p>Below is your personalized methylation report. Read it carefully — and when you're ready, your three next steps are at the bottom.</p>
          <hr style="border:none; border-top:1px solid #B49F90; margin:24px 0;" />
          ${reportHtml}
          <hr style="border:none; border-top:1px solid #B49F90; margin:24px 0;" />
          <h2 style="font-family:'Jost',Arial,sans-serif; text-transform:uppercase; color:#331D01;">Your Next Steps</h2>
          <p><a href="${shopLink}" style="display:inline-block; background:#EC9247; color:#331D01; padding:14px 24px; text-decoration:none; border-radius:6px; font-weight:bold; margin:6px 0;">Buy this Protocol</a></p>
          <p style="font-size:12px; color:#786455; margin:0 0 12px 0;">You'll create a free Fullscript account to order. Takes 30 seconds — no membership fees.</p>
          <p><a href="${calendar}" style="display:inline-block; background:#EC9247; color:#331D01; padding:14px 24px; text-decoration:none; border-radius:6px; font-weight:bold; margin:6px 0;">Book a 1:1 Consult with Natasha</a></p>
          <p><a href="${book}" style="display:inline-block; background:#EC9247; color:#331D01; padding:14px 24px; text-decoration:none; border-radius:6px; font-weight:bold; margin:6px 0;">Get The MTHFR Peptide Protocol</a></p>
          <hr style="border:none; border-top:1px solid #B49F90; margin:24px 0;" />
          <p style="font-size:11px; color:#786455; line-height:1.5;">
            <strong>Disclosure:</strong> Natasha may earn a commission on supplement and book purchases made through these links, at no extra cost to you. Natasha is the author of <em>The MTHFR Peptide Protocol</em>.
          </p>
          <p style="font-size:11px; color:#786455; line-height:1.5;">
            This report is educational only and is not a medical diagnosis. Always consult your healthcare provider.
          </p>
          <p style="font-size:11px; color:#786455; line-height:1.5;">
            You're receiving this because you completed the MTHFR IQ assessment at mthfriq.natashaberness.com. To stop receiving emails, reply with "unsubscribe" or email <a href="mailto:natasha@natashaberness.com">natasha@natashaberness.com</a>.
          </p>
          <p style="font-size:11px; color:#786455;">© Natasha Berness · natashaberness.com</p>
        </div>
      </div>`;

    const result = await resend.emails.send({
      from: 'Natasha Berness <natasha@natashaberness.com>',
      to: [email],
      subject,
      html: wrapped,
    });

    res.json({ ok: true, id: result?.data?.id });
  } catch (err) {
    console.error('send-email error:', err);
    res.status(500).json({ error: 'Email send failed', detail: err.message });
  }
});

// ---------- POST /api/check-foundation-access ----------
// Looks up an email in GHL and returns whether the contact has the
// foundation-active-cohort tag. Used by the lead-capture step to detect
// Foundation members who arrived without the ?ref=foundation-member URL
// param, so the conversion screen can route them to next-level offerings.
app.post('/api/check-foundation-access', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'email required' });
    }
    const token = process.env.GHL_API_KEY;
    const locationId = process.env.GHL_LOCATION_ID;
    if (!token || !locationId) {
      return res.status(200).json({ isMember: false, configured: false });
    }
    const normalized = email.trim().toLowerCase();
    const ghl = await fetchWithTimeout(
      'https://services.leadconnectorhq.com/contacts/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          locationId,
          pageLimit: 1,
          filters: [{ field: 'email', operator: 'eq', value: normalized }],
        }),
      },
      6000
    );
    if (!ghl.ok) {
      return res.status(200).json({ isMember: false, lookupFailed: true });
    }
    const data = await ghl.json();
    const contact = data?.contacts?.[0];
    const tags = Array.isArray(contact?.tags) ? contact.tags : [];
    const isMember = tags.some(
      (t) => typeof t === 'string' && t.toLowerCase() === 'foundation-active-cohort'
    );
    return res.status(200).json({ isMember });
  } catch (err) {
    console.error('check-foundation-access error:', err);
    return res.status(200).json({ isMember: false, error: 'lookup-failed' });
  }
});

// ---------- POST /api/push-to-make ----------
app.post('/api/push-to-make', async (req, res) => {
  try {
    if (!process.env.MAKE_WEBHOOK_URL) {
      return res.status(200).json({ ok: false, skipped: 'MAKE_WEBHOOK_URL not configured' });
    }
    const r = await fetchWithTimeout(
      process.env.MAKE_WEBHOOK_URL,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, source: 'mthfr-iq', timestamp: new Date().toISOString() }),
      },
      8000
    );
    res.json({ ok: r.ok, status: r.status });
  } catch (err) {
    console.error('push-to-make error:', err);
    res.status(500).json({ error: 'Make.com push failed', detail: err.message });
  }
});

// ---------- Public config the client needs ----------
app.get('/api/config', (req, res) => {
  const baseFs = process.env.FULLSCRIPT_LINK || '';
  res.json({
    fullscriptLink: baseFs, // legacy single-link fallback
    fullscriptLinks: {
      starter: process.env.FULLSCRIPT_LINK_STARTER || baseFs,
      complete: process.env.FULLSCRIPT_LINK_COMPLETE || baseFs,
      detox: process.env.FULLSCRIPT_LINK_DETOX || baseFs,
    },
    calendarLink: process.env.GHL_CALENDAR_LINK || '',
    bookLink: 'https://a.co/d/01yrcwv5',
  });
});

app.get('/api/health', (req, res) => res.json({ ok: true, version: '1.1.0' }));

// ---------- Serve the built client ----------
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — only for non-API routes
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

const server = app.listen(PORT, () => {
  console.log(`MTHFR IQ server running on :${PORT}`);
});

// Graceful shutdown
function shutdown(sig) {
  console.log(`${sig} received — shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
