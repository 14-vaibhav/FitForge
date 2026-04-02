export default function WorkoutSummary({ completedExercises, workoutConfig, evaluation, isEvaluating, onStartNew }) {
  const completedCount = completedExercises.filter(e => !e.log?.skipped).length;
  const skippedCount   = completedExercises.filter(e =>  e.log?.skipped).length;
  const totalExercises = completedExercises.length;
  const completionPct  = Math.round((completedCount / totalExercises) * 100);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="bg-animated min-h-screen p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <p
            className="text-xs mb-4 tracking-widest"
            style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
          >
            SESSION COMPLETE
          </p>
          <h1
            className="text-5xl font-black mb-3 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.03em' }}
          >
            Nice Work.
          </h1>
          <p className="text-sm" style={{ color: '#555', fontFamily: 'Space Mono, monospace' }}>
            {today.toUpperCase()}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                fontFamily: 'Space Mono, monospace', color: '#888',
                background: '#1a1a1a', border: '1px solid #2a2a2a',
              }}
            >
              {workoutConfig.bodyParts.map(id => id[0].toUpperCase() + id.slice(1)).join(' · ')}
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                fontFamily: 'Space Mono, monospace', color: '#555',
                background: '#111', border: '1px solid #1e1e1e',
              }}
            >
              {workoutConfig.duration}min · {workoutConfig.location}
            </span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'DONE',    value: completedCount, accent: completedCount > 0 },
            { label: 'SKIPPED', value: skippedCount,   accent: false },
            { label: 'RATE',    value: `${completionPct}%`, accent: completionPct >= 80 },
          ].map(s => (
            <div
              key={s.label}
              className="glass-card p-5 text-center"
              style={{ borderColor: s.accent ? '#383838' : '#2a2a2a' }}
            >
              <div
                className="text-3xl font-black mb-1"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  color: s.accent ? '#fff' : '#555',
                  letterSpacing: '-0.03em',
                }}
              >
                {s.value}
              </div>
              <div
                className="text-xs tracking-widest"
                style={{ fontFamily: 'Space Mono, monospace', color: '#444' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Exercise log ── */}
        <div className="glass-card p-6">
          <div className="section-label mb-4">Exercise Log</div>
          <div className="space-y-2">
            {completedExercises.map((ex, idx) => {
              const skipped = ex.log?.skipped;
              const log     = ex.log;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl"
                  style={{
                    background: '#161616',
                    border: `1px solid ${skipped ? '#2a2a2a' : '#252525'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: skipped ? '#222' : '#2a2a2a',
                          color:      skipped ? '#444' : '#888',
                          fontFamily: 'Space Mono, monospace',
                        }}
                      >
                        {skipped ? '–' : '✓'}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: 'DM Sans, sans-serif', color: skipped ? '#555' : '#ccc' }}
                      >
                        {ex.name}
                      </span>
                    </div>
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: 'Space Mono, monospace',
                        color: skipped ? '#444' : '#555',
                      }}
                    >
                      {skipped ? 'SKIPPED' : 'DONE'}
                    </span>
                  </div>

                  {!skipped && log && (
                    <div
                      className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs pl-7"
                      style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
                    >
                      {log.setsCompleted && <span>×{log.setsCompleted} sets</span>}
                      {log.repsPerSet    && <span>{log.repsPerSet} reps</span>}
                      {log.weight        && <span>{log.weight}</span>}
                      {log.duration      && <span>{log.duration}</span>}
                      {log.distance      && <span>{log.distance}</span>}
                      {log.heartRate     && <span>{log.heartRate} bpm</span>}
                      {log.notes         && (
                        <span className="w-full mt-1" style={{ color: '#555', fontStyle: 'italic' }}>
                          "{log.notes}"
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Evaluation ── */}
        <div className="glass-card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="section-label">AI Evaluation</div>
            {isEvaluating && evaluation && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#4ade80' }}
                />
                <span className="text-xs" style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}>
                  STREAMING
                </span>
              </div>
            )}
          </div>

          {/* Spinner only shown when stream hasn't started yet */}
          {isEvaluating && !evaluation ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="spinner animate-pulse-glow" />
              <p
                className="text-xs"
                style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
              >
                GEMINI IS ANALYZING YOUR WORKOUT…
              </p>
            </div>
          ) : evaluation ? (
            <div className="evaluation-text">{evaluation}</div>
          ) : (
            <p className="text-sm" style={{ color: '#555' }}>Evaluation not available.</p>
          )}
        </div>

        {/* ── CTA ── */}
        <button
          onClick={onStartNew}
          className="btn-primary w-full py-4 rounded-2xl font-bold text-base"
        >
          → Start New Workout
        </button>
      </div>
    </div>
  );
}
