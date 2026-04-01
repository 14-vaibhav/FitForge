import { useState } from 'react';
import { buildYoutubeUrl } from '../services/gemini';

const BODY_PARTS_MAP = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
  biceps: 'Biceps', triceps: 'Triceps', legs: 'Legs',
  glutes: 'Glutes', core: 'Core', cardio: 'Cardio', 'full body': 'Full Body',
};

function CategoryBadge({ category }) {
  const cls = {
    Strength:    'badge-strength',
    Cardio:      'badge-cardio',
    Flexibility: 'badge-flexibility',
    HIIT:        'badge-hiit',
  }[category] || 'badge-strength';
  return <span className={`badge ${cls}`}>{category}</span>;
}

function DifficultyBadge({ difficulty }) {
  const cls = {
    Beginner:     'badge-beginner',
    Intermediate: 'badge-intermediate',
    Advanced:     'badge-advanced',
  }[difficulty] || 'badge-intermediate';
  return <span className={`badge ${cls}`}>{difficulty}</span>;
}

function StatBox({ mono, label, value }) {
  return (
    <div className="stat-card flex flex-col items-center gap-1">
      <div
        className="text-lg"
        style={{ fontFamily: 'Space Mono, monospace', color: '#888' }}
      >
        {mono}
      </div>
      <div
        className="text-xs uppercase tracking-widest"
        style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
      >
        {label}
      </div>
      <div
        className="text-sm font-bold text-center"
        style={{ color: '#e8e8e8', fontFamily: 'Syne, sans-serif' }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

function LogModal({ exercise, onSave, onCancel }) {
  const isCardio = exercise.category === 'Cardio' || exercise.sets === 'N/A';

  const [form, setForm] = useState({
    setsCompleted: '', repsPerSet: '', weight: '',
    duration: '', distance: '', heartRate: '', notes: '',
  });

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="section-label mb-1">Log Performance</div>
            <h3
              className="text-xl font-black"
              style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}
            >
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-xl leading-none transition-colors"
            style={{ color: '#555' }}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {isCardio ? (
            <>
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                  DURATION COMPLETED
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  placeholder={`Recommended: ${exercise.reps || exercise.duration}`}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                  DISTANCE <span style={{ color: '#444' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.distance}
                  onChange={e => setForm({ ...form, distance: e.target.value })}
                  placeholder="e.g., 2.5 km"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                  AVG HEART RATE <span style={{ color: '#444' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.heartRate}
                  onChange={e => setForm({ ...form, heartRate: e.target.value })}
                  placeholder="e.g., 145 bpm"
                  className="input-field"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                    SETS COMPLETED
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.setsCompleted}
                    onChange={e => setForm({ ...form, setsCompleted: e.target.value })}
                    placeholder={exercise.sets?.replace(/[^0-9-]/g, '') || '3'}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                    REPS PER SET
                  </label>
                  <input
                    type="text"
                    value={form.repsPerSet}
                    onChange={e => setForm({ ...form, repsPerSet: e.target.value })}
                    placeholder={exercise.reps || '10–12'}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
                  WEIGHT USED <span style={{ color: '#444' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g., 20 kg, bodyweight"
                  className="input-field"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs mb-1.5" style={{ fontFamily: 'Space Mono, monospace', color: '#666' }}>
              NOTES <span style={{ color: '#444' }}>(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="How did it feel? Too easy, too hard?"
              rows={2}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-semibold">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutSession({ exercises, workoutConfig, onComplete, onReplaceExercise, isReplacing }) {
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [showLogModal, setShowLogModal]     = useState(false);

  const currentExercise = exercises[currentIndex];
  const progress  = Math.round((completedExercises.length / exercises.length) * 100);
  const remaining = exercises.length - completedExercises.length;

  const goToNext = () => {
    const nextIdx = exercises.findIndex((_, i) =>
      i > currentIndex && !completedExercises.some(c => c.originalIndex === i)
    );
    if (nextIdx !== -1) { setCurrentIndex(nextIdx); return; }
    const any = exercises.findIndex((_, i) =>
      !completedExercises.some(c => c.originalIndex === i)
    );
    if (any !== -1) setCurrentIndex(any);
  };

  const handleSaveLog = (logData) => {
    const entry = {
      ...currentExercise,
      originalIndex: currentIndex,
      log: { ...logData, completedAt: new Date().toISOString() },
    };
    const updated = [...completedExercises, entry];
    setCompletedExercises(updated);
    setShowLogModal(false);
    if (updated.length < exercises.length) goToNext();
  };

  const handleSkip = () => {
    const entry = {
      ...currentExercise,
      originalIndex: currentIndex,
      log: { skipped: true, completedAt: new Date().toISOString() },
    };
    const updated = [...completedExercises, entry];
    setCompletedExercises(updated);
    if (updated.length < exercises.length) goToNext();
  };

  const allDone = completedExercises.length === exercises.length;
  const isCompleted = (idx) => completedExercises.some(c => c.originalIndex === idx);
  const isSkipped   = (idx) => completedExercises.find(c => c.originalIndex === idx)?.log?.skipped;

  // ── All done screen ──
  if (allDone) {
    return (
      <div className="bg-animated min-h-screen flex items-center justify-center p-4">
        <div className="glass-card-elevated p-10 max-w-md w-full text-center animate-fade-in">
          <div className="text-5xl mb-5">🎉</div>
          <h2
            className="text-4xl font-black mb-3"
            style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.02em' }}
          >
            Workout Done.
          </h2>
          <p className="text-sm mb-8" style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}>
            You crushed {exercises.length} exercises. Time to see your results.
          </p>
          <button
            onClick={() => onComplete(completedExercises)}
            className="btn-primary w-full py-4 rounded-2xl font-bold text-base"
          >
            View AI Evaluation →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-animated min-h-screen p-4 pt-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                fontFamily: 'Space Mono, monospace', color: '#888',
                background: '#1a1a1a', border: '1px solid #2a2a2a',
              }}
            >
              {workoutConfig.bodyParts.map(id => id[0].toUpperCase() + id.slice(1)).join(' · ')}
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                fontFamily: 'Space Mono, monospace', color: '#555',
                background: '#111', border: '1px solid #222',
              }}
            >
              {workoutConfig.duration}min · {workoutConfig.location}
            </span>
          </div>
          <span
            className="text-xs"
            style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
          >
            {remaining} LEFT
          </span>
        </div>

        {/* ── Progress bar ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}>
              PROGRESS
            </span>
            <span
              className="text-xs font-bold"
              style={{ fontFamily: 'Space Mono, monospace', color: progress === 100 ? '#e8e8e8' : '#888' }}
            >
              {progress}%
            </span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ── Exercise navigator ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6">
          {exercises.map((ex, idx) => {
            const done    = isCompleted(idx) && !isSkipped(idx);
            const skipped = isSkipped(idx);
            const current = idx === currentIndex && !isCompleted(idx);
            let cls = 'pending';
            if (done) cls = 'done';
            else if (skipped) cls = 'skipped';
            else if (current) cls = 'current';
            return (
              <button
                key={idx}
                onClick={() => { if (!isCompleted(idx)) setCurrentIndex(idx); }}
                className={`nav-dot ${cls}`}
                title={ex.name}
              >
                {done ? '✓' : skipped ? '–' : idx + 1}
              </button>
            );
          })}
        </div>

        {/* ── Current exercise card ── */}
        <div className="glass-card-elevated p-6 md:p-8 animate-slide-in" key={currentIndex}>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span
                className="text-xs"
                style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
              >
                {currentIndex + 1}/{exercises.length}
              </span>
              <CategoryBadge  category={currentExercise.category} />
              <DifficultyBadge difficulty={currentExercise.difficulty} />
            </div>
            <h2
              className="text-3xl md:text-4xl font-black leading-tight"
              style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.02em' }}
            >
              {currentExercise.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm" style={{ color: '#666' }}>
                {currentExercise.targetMuscle}
              </span>
              {currentExercise.equipment && (
                <span className="text-xs" style={{ color: '#444' }}>
                  · {currentExercise.equipment}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
            <StatBox mono="⏱" label="Duration" value={currentExercise.duration} />
            <StatBox mono="×" label="Sets"     value={currentExercise.sets} />
            <StatBox mono="↕" label="Reps"     value={currentExercise.reps} />
            <StatBox mono="⏸" label="Rest"     value={currentExercise.rest} />
          </div>

          {/* Instructions */}
          {currentExercise.instructions && (
            <div
              className="mb-4 p-4 rounded-xl"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div className="section-label mb-2">How to do it</div>
              <p className="text-sm leading-relaxed" style={{ color: '#999' }}>
                {currentExercise.instructions}
              </p>
            </div>
          )}

          {/* Tips */}
          {currentExercise.tips && (
            <div
              className="mb-4 p-4 rounded-xl"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <div className="section-label mb-2" style={{ color: '#666' }}>Pro Tip</div>
              <p className="text-sm leading-relaxed" style={{ color: '#999', fontStyle: 'italic' }}>
                {currentExercise.tips}
              </p>
            </div>
          )}

          {/* YouTube Link */}
          {currentExercise.youtubeSearchQuery && (
            <a
              href={buildYoutubeUrl(currentExercise.youtubeSearchQuery)}
              target="_blank"
              rel="noopener noreferrer"
              className="yt-link mb-6 block"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#222', border: '1px solid #333' }}
              >
                <svg className="w-4 h-4" fill="#888" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold" style={{ color: '#ccc', fontFamily: 'DM Sans, sans-serif' }}>
                  Watch Tutorial
                </div>
                <div className="text-xs mt-0.5 truncate" style={{ color: '#555', fontFamily: 'Space Mono, monospace' }}>
                  {currentExercise.youtubeSearchQuery}
                </div>
              </div>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="#555" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => setShowLogModal(true)}
              className="btn-primary flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              ✓ Mark Complete
            </button>
            <button
              onClick={() => onReplaceExercise(currentIndex, currentExercise)}
              disabled={isReplacing}
              className="btn-secondary flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            >
              {isReplacing ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Finding alternative…</span>
                </>
              ) : (
                '↻ Different Exercise'
              )}
            </button>
            <button
              onClick={handleSkip}
              className="sm:w-auto px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#111', border: '1px solid #2a2a2a', color: '#555' }}
            >
              Skip
            </button>
          </div>
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: '#444', fontFamily: 'Space Mono, monospace' }}
        >
          TAP A NUMBER ABOVE TO JUMP TO THAT EXERCISE
        </p>
      </div>

      {showLogModal && (
        <LogModal
          exercise={currentExercise}
          onSave={handleSaveLog}
          onCancel={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
