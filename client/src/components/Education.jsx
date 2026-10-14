import { useState } from 'react';
import { educationLevels } from '../data/educationData.js';

export default function Education({ onComplete }) {
  const [unlocked, setUnlocked] = useState(1);
  const [openLevel, setOpenLevel] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [completed, setCompleted] = useState([]);

  function open(levelId) {
    if (levelId > unlocked) return;
    setOpenLevel(levelId);
    setCardIndex(0);
  }

  function nextCard() {
    const level = educationLevels.find((l) => l.id === openLevel);
    if (cardIndex + 1 < level.cards.length) {
      setCardIndex(cardIndex + 1);
    } else {
      const newCompleted = completed.includes(openLevel) ? completed : [...completed, openLevel];
      setCompleted(newCompleted);
      setUnlocked(Math.max(unlocked, openLevel + 1));
      setOpenLevel(null);
    }
  }

  if (openLevel) {
    const level = educationLevels.find((l) => l.id === openLevel);
    const card = level.cards[cardIndex];
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="card max-w-xl w-full fade-in" key={cardIndex}>
          <p className="heading text-xs text-amber1 mb-2">
            Level {level.id} · Card {cardIndex + 1} of {level.cards.length}
          </p>
          <h3 className="heading text-2xl text-brown1 mb-4">{card.title}</h3>
          <p className="text-brown2 leading-relaxed mb-5">{card.body}</p>
          <div className="bg-cream1 border-l-4 border-amber1 p-4 rounded mb-6">
            <p className="text-sm text-brown1"><strong>Key takeaway:</strong> {card.takeaway}</p>
          </div>
          <div className="flex justify-between items-center">
            <button onClick={() => setOpenLevel(null)} className="btn-ghost text-sm">Back</button>
            <button onClick={nextCard} className="btn-primary">
              {cardIndex + 1 < level.cards.length ? 'Next' : 'Complete Level'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center mb-8 fade-in">
        <p className="heading text-amber1 text-sm mb-2">Your Learning Path</p>
        <h2 className="heading text-3xl sm:text-4xl text-brown1 mb-3">MTHFR IQ</h2>
        <p className="text-brown2">Tap each level to unlock the next. Complete all five to reveal your protocol.</p>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {educationLevels.map((level) => {
          const isUnlocked = level.id <= unlocked;
          const isComplete = completed.includes(level.id);
          return (
            <button
              key={level.id}
              onClick={() => open(level.id)}
              disabled={!isUnlocked}
              className={`w-full text-left card flex items-center justify-between transition ${
                isUnlocked ? 'hover:scale-[1.01]' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{level.emoji}</div>
                <div>
                  <p className="heading text-xs text-amber1">Level {level.id}</p>
                  <p className="heading text-lg text-brown1">{level.title}</p>
                </div>
              </div>
              <div className="text-2xl">
                {isComplete ? '✓' : isUnlocked ? '→' : '🔒'}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={onComplete} className="btn-primary mt-10">
        {completed.length === educationLevels.length ? 'See My Report' : 'Skip to My Report'}
      </button>
    </div>
  );
}
