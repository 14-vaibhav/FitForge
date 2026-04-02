export default function PreviousPerformanceCard({ suggestion, loading }) {
  if (loading) {
    return (
      <div
        className="rounded-xl p-3 mb-4 animate-pulse"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', height: 64 }}
      />
    );
  }

  if (!suggestion || suggestion.type === 'no_history') return null;

  return (
    <div
      className="rounded-xl p-4 mb-5"
      style={{ background: '#111', border: '1px solid #252525' }}
    >
      {/* Previous performance */}
      <div className="mb-3">
        <div
          className="text-xs mb-1 tracking-widest"
          style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
        >
          LAST TIME
        </div>
        <div
          className="text-sm"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#888' }}
        >
          {suggestion.lastPerformance}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1e1e1e', marginBottom: 12 }} />

      {/* Suggestion */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              background: suggestion.badgeColor + '20',
              color: suggestion.badgeColor,
              fontFamily: 'Space Mono, monospace',
            }}
          >
            {suggestion.badge}
          </span>
        </div>
        <div
          className="text-sm font-semibold mt-1.5"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#ccc' }}
        >
          {suggestion.suggestion}
        </div>
      </div>
    </div>
  );
}
