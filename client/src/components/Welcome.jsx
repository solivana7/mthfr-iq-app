export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 fade-in" id="main">
      <div className="max-w-2xl text-center">
        <p className="heading text-amber1 text-sm mb-4">MTHFR IQ · BY NATASHA BERNESS</p>
        <h1 className="heading text-4xl sm:text-6xl text-brown1 leading-tight mb-6">
          Do You Have an MTHFR Variant?
        </h1>
        <p className="text-lg text-brown2 mb-10 leading-relaxed">
          Answer 10 questions. Optionally upload your DNA. Get a personalized methylation protocol — in minutes.
        </p>
        <button onClick={onStart} className="btn-primary text-lg">
          Start the Quiz
        </button>
        <p className="text-xs text-brown2 mt-10 max-w-md mx-auto leading-relaxed">
          For adults 18+. Educational use only — not a medical diagnosis. Always consult your healthcare provider before changing your protocol.
        </p>
      </div>
    </div>
  );
}
