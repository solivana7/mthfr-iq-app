import { useEffect, useState } from 'react';
import { quizQuestions } from '../data/quizData.js';
import ProgressBar from './ProgressBar.jsx';

const STORAGE_KEY = 'mthfr_iq_quiz_progress_v1';

export default function Quiz({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [restored, setRestored] = useState(false);

  // Restore progress on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          if (saved.answers) setAnswers(saved.answers);
          if (typeof saved.index === 'number' && saved.index < quizQuestions.length) {
            setIndex(saved.index);
            setRestored(true);
          }
        }
      }
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ index, answers }));
    } catch {}
  }, [index, answers]);

  const q = quizQuestions[index];
  const total = quizQuestions.length;
  const current = answers[q.id] || (q.type === 'multi' ? [] : null);

  function next(updated) {
    const newAnswers = { ...answers, [q.id]: updated };
    setAnswers(newAnswers);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      // Clear saved progress on completion
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      onComplete(newAnswers);
    }
  }

  function pickSingle(opt) {
    setAnswers({ ...answers, [q.id]: opt });
  }

  function toggleMulti(opt) {
    const list = Array.isArray(current) ? [...current] : [];
    const i = list.indexOf(opt);
    if (i >= 0) list.splice(i, 1); else list.push(opt);
    setAnswers({ ...answers, [q.id]: list });
  }

  function continueClick() {
    if (q.type === 'single') {
      if (!current) return;
      next(current);
    } else {
      if (!Array.isArray(current) || current.length === 0) return;
      next(current);
    }
  }

  const canContinue =
    q.type === 'single'
      ? !!current
      : Array.isArray(current) && current.length > 0;

  function goBack() {
    if (index > 0) setIndex(index - 1);
  }

  function startOver() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setAnswers({});
    setIndex(0);
    setRestored(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar current={index + 1} total={total} />
      {restored && index > 0 && (
        <div className="text-center mt-2 text-xs text-brown2">
          Welcome back — we restored your place.{' '}
          <button onClick={startOver} className="underline text-amber1">Start over</button>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl fade-in" key={q.id}>
          <h2 className="heading text-2xl sm:text-3xl text-brown1 mb-3">{q.title}</h2>
          {q.note && <p className="text-sm text-brown2 italic mb-6">{q.note}</p>}

          {q.type === 'single' && (
            <div role="radiogroup" aria-label={q.title}>
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={current === opt}
                  onClick={() => pickSingle(opt)}
                  className={`option ${current === opt ? 'selected' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block w-4 h-4 mr-3 rounded-full border border-brown2 align-middle"
                    style={{ background: current === opt ? '#EC9247' : 'transparent' }}
                  />
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && (
            <div role="group" aria-label={q.title}>
              {q.options.map((opt) => {
                const selected = Array.isArray(current) && current.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleMulti(opt)}
                    className={`option ${selected ? 'selected' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block w-4 h-4 mr-3 rounded border border-brown2 align-middle"
                      style={{ background: selected ? '#EC9247' : 'transparent' }}
                    />
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={continueClick}
              disabled={!canContinue}
              className="btn-primary"
              aria-disabled={!canContinue}
            >
              Continue
            </button>
            {!canContinue && (
              <p className="text-xs text-brown2 mt-2">
                {q.type === 'single'
                  ? 'Choose an option to continue.'
                  : 'Select at least one option (or "None of these") to continue.'}
              </p>
            )}
          </div>

          {index > 0 && (
            <div className="text-center mt-6">
              <button onClick={goBack} className="text-xs text-brown2 underline hover:text-amber1">
                ← Back to previous question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
