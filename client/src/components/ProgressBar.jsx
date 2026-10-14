export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-6">
      <div className="flex justify-between text-xs text-brown2 mb-2 heading">
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-cream1 rounded-full overflow-hidden border border-taupe1/40">
        <div
          className="h-full bg-amber1 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
