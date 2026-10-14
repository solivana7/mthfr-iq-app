import { useState } from 'react';
import { PROTOCOL_META } from '../lib/protocolRouter.js';

export default function Conversion({ config, recommendedProtocol, isFoundationMember = false, onBack }) {
  const protocols = ['starter', 'complete', 'detox'];
  const [selected, setSelected] = useState(recommendedProtocol || 'starter');

  const meta = PROTOCOL_META[selected];
  const fullscriptLinks = {
    starter: config?.fullscriptLinks?.starter || config?.fullscriptLink || '#',
    complete: config?.fullscriptLinks?.complete || config?.fullscriptLink || '#',
    detox: config?.fullscriptLinks?.detox || config?.fullscriptLink || '#',
  };
  const calendar = config?.calendarLink || '#';
  const book = config?.bookLink || 'https://a.co/d/01yrcwv5';

  return (
    <div className="min-h-screen px-4 py-12 flex flex-col items-center">
      {onBack && (
        <div className="max-w-3xl w-full mb-4">
          <button
            onClick={onBack}
            className="text-sm text-brown2 hover:text-brown1 transition flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Back to Report
          </button>
        </div>
      )}
      {isFoundationMember && (
        <div className="max-w-2xl w-full mb-8 px-5 py-4 rounded-lg border border-amber1/40 bg-amber1/5">
          <p className="heading text-[10px] tracking-[0.2em] text-amber1 mb-1">
            FOUNDATION MEMBER · NEXT-LEVEL PATH
          </p>
          <p className="text-sm text-brown1 leading-relaxed">
            You already have The Foundation. The Fullscript supplement protocols below are still useful — but the most natural next steps for you are the <strong>Bioenergetic Scan</strong> and a <strong>1:1 consult</strong>.
          </p>
        </div>
      )}
      <div className="max-w-3xl text-center mb-10 fade-in">
        <p className="heading text-amber1 text-sm mb-2">Your Next Steps</p>
        <h2 className="heading text-3xl sm:text-4xl text-brown1 mb-3">
          {isFoundationMember ? 'Where To Go From Here' : 'Three Ways To Go Deeper'}
        </h2>
        <p className="text-brown2">
          {isFoundationMember
            ? 'You are already inside the work. Here are the layers most members move into next.'
            : 'Pick the one that meets you where you are right now.'}
        </p>
      </div>

      {isFoundationMember && (
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl w-full mb-10">
          <div className="card flex flex-col text-center border-2 border-amber1">
            <div className="text-4xl mb-3" aria-hidden="true">◐</div>
            <h3 className="heading text-lg text-brown1 mb-2">Bioenergetic Scan</h3>
            <p className="text-sm text-brown2 mb-6 flex-1">
              Read the energetic patterns of stress in your body before they show on standard labs. Use code <strong>FOUNDATION20</strong> for 20% off.
            </p>
            <a
              href="https://scan.solivana.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm"
            >
              Get Your Scan
            </a>
          </div>
          <div className="card flex flex-col text-center">
            <div className="text-4xl mb-3" aria-hidden="true">📅</div>
            <h3 className="heading text-lg text-brown1 mb-2">1:1 Consult with Natasha</h3>
            <p className="text-sm text-brown2 mb-6 flex-1">
              20 minutes. Your MTHFR results, your Foundation work, and what to layer on next — personalized.
            </p>
            <a href={calendar} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
              Book Your Consult
            </a>
          </div>
        </div>
      )}

      {/* Recommended protocol — featured card */}
      <div className="max-w-2xl w-full mb-8">
        <div className="card border-2 border-amber1">
          <p className="heading text-xs text-amber1 mb-2">{meta.pitch}</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl" aria-hidden="true">{meta.emoji}</span>
            <h3 className="heading text-xl text-brown1">{meta.title}</h3>
          </div>
          <p className="text-brown2 mb-5">{meta.blurb}</p>

          <a
            href={fullscriptLinks[selected]}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn-primary block text-center"
          >
            Buy this Protocol
          </a>
          <p className="text-xs text-brown2 mt-3 text-center">
            You'll create a free Fullscript account to order. Takes 30 seconds — no membership fees.
          </p>

          {/* Protocol switcher */}
          <div className="mt-6 pt-5 border-t border-taupe1/40">
            <p className="text-xs text-brown2 mb-3 text-center">Or choose a different protocol level:</p>
            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Protocol level">
              {protocols.map((p) => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={selected === p}
                  onClick={() => setSelected(p)}
                  className={`text-xs heading py-2 px-2 rounded-lg border transition ${
                    selected === p
                      ? 'border-amber1 bg-amber1/10 text-brown1'
                      : 'border-taupe1 text-brown2 hover:border-amber1'
                  }`}
                >
                  <span aria-hidden="true">{PROTOCOL_META[p].emoji}</span> {PROTOCOL_META[p].title.replace('MTHFR ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking + Book */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl w-full">
        <div className="card flex flex-col text-center">
          <div className="text-4xl mb-3" aria-hidden="true">📅</div>
          <h3 className="heading text-lg text-brown1 mb-2">Book a 1:1 with Natasha</h3>
          <p className="text-sm text-brown2 mb-6 flex-1">
            20 minutes. Your results, your genes, your protocol — personalized.
          </p>
          <a href={calendar} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
            Book Your Consult
          </a>
        </div>

        <div className="card flex flex-col text-center">
          <div className="text-4xl mb-3" aria-hidden="true">📖</div>
          <h3 className="heading text-lg text-brown1 mb-2">The MTHFR Peptide Protocol</h3>
          <p className="text-sm text-brown2 mb-6 flex-1">
            Book 1 of Natasha's 7-book MTHFR series. The foundational guide to understanding your methylation.
          </p>
          <a href={book} target="_blank" rel="noopener noreferrer sponsored" className="btn-primary text-sm">
            Get the Book on Amazon
          </a>
        </div>
      </div>

      <p className="text-[11px] text-brown2 mt-10 max-w-xl text-center leading-relaxed">
        <strong>Disclosure:</strong> Natasha may earn a commission on supplement and book purchases made through these links, at no extra cost to you. Natasha is the author of <em>The MTHFR Peptide Protocol</em>.
      </p>
      <p className="text-xs text-brown2 mt-4 max-w-md text-center">
        This tool is for educational purposes only and is not a medical diagnosis. Always consult your healthcare provider.
      </p>
    </div>
  );
}
