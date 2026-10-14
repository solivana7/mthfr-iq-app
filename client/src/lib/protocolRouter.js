// Protocol router — picks which Fullscript protocol fits the user based on quiz answers + DNA.
// Three tiers:
//   - starter:  mild symptoms, low overwhelm, new to methylation
//   - complete: standard recommendation, moderate symptoms across categories
//   - detox:    high symptom load, multiple sensitivities, OR confirmed variants from DNA

export function pickProtocol(quizAnswers, dnaAnalysis) {
  if (!quizAnswers) return 'starter';

  const ans = quizAnswers;
  const arr = (v) => (Array.isArray(v) ? v : []);
  const has = (v, needle) => arr(v).some((x) => x.toLowerCase().includes(needle.toLowerCase()));
  const countNonNone = (v) => arr(v).filter((x) => !x.toLowerCase().includes('none of these')).length;

  let score = 0;

  // Mood symptoms (Q2)
  score += countNonNone(ans.mood);

  // Physical symptoms (Q3)
  score += countNonNone(ans.physical);

  // Sensitivities (Q4) — single answer
  if (ans.sensitivities) {
    const s = ans.sensitivities.toLowerCase();
    if (s.includes('more than one')) score += 3;
    else if (s.includes('reactions to b vitamins')) score += 3;
    else if (s.includes('headaches, brain fog')) score += 2;
    else if (s.includes('sensitive to certain foods')) score += 2;
    else if (s.includes('seasonal allergies')) score += 1;
  }

  // Personal history (Q5)
  score += countNonNone(ans.history_personal) * 1.5;

  // Family history (Q6)
  score += countNonNone(ans.history_family) * 0.5;

  // Triggers (Q7)
  score += countNonNone(ans.triggers) * 0.5;

  // DNA evidence
  let dnaSignal = 0;
  if (dnaAnalysis) {
    const variants = dnaAnalysis.variants || [];
    if (variants.length > 0) dnaSignal += 2;
    if (variants.length >= 3) dnaSignal += 2;
    if (dnaAnalysis.methylation_type && dnaAnalysis.methylation_type !== 'unknown') dnaSignal += 1;
    if ((dnaAnalysis.risk_flags || []).length >= 2) dnaSignal += 2;
  }
  score += dnaSignal;

  // High-severity flags push straight to detox
  const highSeverity =
    has(ans.history_personal, 'MCAS') ||
    has(ans.history_personal, 'High homocysteine') ||
    has(ans.history_personal, 'autoimmune') ||
    has(ans.history_personal, 'POTS') ||
    has(ans.history_personal, 'blood clots');

  if (highSeverity || dnaSignal >= 4) return 'detox';
  if (score >= 8) return 'complete';
  if (score >= 4) return 'complete';
  return 'starter';
}

export const PROTOCOL_META = {
  starter: {
    key: 'starter',
    emoji: '\uD83C\uDF31',
    title: 'MTHFR Starter Stack',
    blurb: 'The 5 core supplements to begin supporting your methylation. Low overwhelm, high impact.',
    pitch: 'Recommended for you — start here.',
  },
  complete: {
    key: 'complete',
    emoji: '\uD83E\uDDEC',
    title: 'MTHFR Complete Protocol',
    blurb: 'A full methylation support stack — methylation cycle, cofactors, and foundational nutrients.',
    pitch: 'Recommended for you — based on your symptom profile.',
  },
  detox: {
    key: 'detox',
    emoji: '\uD83D\uDD25',
    title: 'MTHFR + Detox Protocol',
    blurb: 'The complete stack plus glutathione, NAC, and detox cofactors for high-symptom or DNA-confirmed cases.',
    pitch: 'Recommended for you — your responses suggest a higher-support protocol.',
  },
};
