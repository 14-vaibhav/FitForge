import { useState } from 'react';

const BODY_PARTS = [
  { id: 'chest',     label: 'Chest',     emoji: '💪' },
  { id: 'back',      label: 'Back',      emoji: '🦍' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🏋️' },
  { id: 'biceps',    label: 'Biceps',    emoji: '💪' },
  { id: 'triceps',   label: 'Triceps',   emoji: '🔱' },
  { id: 'legs',      label: 'Legs',      emoji: '🦵' },
  { id: 'glutes',    label: 'Glutes',    emoji: '🍑' },
  { id: 'core',      label: 'Core',      emoji: '⚡' },
  { id: 'cardio',    label: 'Cardio',    emoji: '🏃' },
  { id: 'full body', label: 'Full Body', emoji: '🌟' },
];

const TIME_OPTIONS = [
  { value: 30,  label: '30 min',   sublabel: 'Quick session' },
  { value: 45,  label: '45 min',   sublabel: 'Focused burn' },
  { value: 60,  label: '1 hr',     sublabel: 'Standard' },
  { value: 90,  label: '1.5 hr',   sublabel: 'Thorough' },
  { value: 120, label: '2 hr',     sublabel: 'Full session' },
  { value: 150, label: '2.5 hr',   sublabel: 'Power session' },
  { value: 180, label: '3 hr',     sublabel: 'Beast mode' },
];

export default function WorkoutSetup({ onSubmit, isLoading }) {
  const [selectedParts, setSelectedParts] = useState([]);
  const [duration, setDuration]           = useState(60);
  const [location, setLocation]           = useState('Gym');

  const toggleBodyPart = (id) => {
    setSelectedParts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedParts.length === 0) return;
    onSubmit({ bodyParts: selectedParts, duration, location });
  };

  return (
    <div className="bg-animated min-h-screen flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl animate-fade-in">

        {/* ── Header ── */}
        <div className="text-center mb-12">
          <p
            className="text-xs tracking-widest mb-4"
            style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
          >
            AI-POWERED GYM PLANNER
          </p>
          <h1
            className="text-6xl font-black leading-none mb-4"
            style={{ fontFamily: 'Syne, sans-serif', color: '#fff', letterSpacing: '-0.03em' }}
          >
            FitForge
          </h1>
          <div
            className="text-base"
            style={{ color: '#666', fontFamily: 'DM Sans, sans-serif' }}
          >
            Tell us your goals. We'll handle the rest.
          </div>
        </div>

        <div
          className="glass-card-elevated p-8 space-y-9"
          style={{ borderColor: '#2a2a2a' }}
        >

          {/* ── Step 1: Body Parts ── */}
          <div>
            <div className="section-label mb-4">01 — Target Muscles</div>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(part => {
                const sel = selectedParts.includes(part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => toggleBodyPart(part.id)}
                    className={`tag-btn px-3.5 py-2 rounded-full text-sm flex items-center gap-1.5 ${sel ? 'selected' : ''}`}
                    style={sel ? {
                      background: '#fff',
                      color: '#000',
                      border: '1.5px solid #fff',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                    } : {
                      background: '#1a1a1a',
                      color: '#888',
                      border: '1.5px solid #2a2a2a',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    <span>{part.emoji}</span>
                    <span>{part.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedParts.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className="text-xs"
                  style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
                >
                  SELECTED:
                </span>
                {selectedParts.map(id => (
                  <span
                    key={id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: '#222', color: '#ccc',
                      border: '1px solid #333',
                      fontFamily: 'Space Mono, monospace',
                    }}
                  >
                    {BODY_PARTS.find(p => p.id === id)?.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="divider" />

          {/* ── Step 2: Duration ── */}
          <div>
            <div className="section-label mb-4">02 — Time Available</div>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field text-base"
              style={{ fontSize: '15px' }}
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.sublabel}
                </option>
              ))}
            </select>
            <p
              className="mt-2.5 text-xs"
              style={{ fontFamily: 'Space Mono, monospace', color: '#555' }}
            >
              / {TIME_OPTIONS.find(t => t.value === duration)?.sublabel?.toUpperCase()}
            </p>
          </div>

          <div className="divider" />

          {/* ── Step 3: Location ── */}
          <div>
            <div className="section-label mb-4">03 — Location</div>
            <div className="flex gap-3">
              {[
                { id: 'Home', emoji: '🏠', label: 'Home',    sub: 'Bodyweight & bands' },
                { id: 'Gym',  emoji: '🏋️', label: 'Gym',     sub: 'Full equipment' },
              ].map(loc => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocation(loc.id)}
                  className={`location-card ${location === loc.id ? 'selected' : ''}`}
                >
                  <div className="text-2xl mb-2">{loc.emoji}</div>
                  <div
                    className="text-sm font-bold"
                    style={{ fontFamily: 'Syne, sans-serif', color: location === loc.id ? '#fff' : '#888' }}
                  >
                    {loc.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#555' }}>{loc.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedParts.length === 0}
            className="btn-primary w-full py-4 rounded-2xl text-base flex items-center justify-center gap-2.5"
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.2)' }} />
                <span>Crafting your workout…</span>
              </>
            ) : (
              <>
                <span>→</span>
                <span>
                  {selectedParts.length > 0
                    ? `Generate ${selectedParts.map(id => BODY_PARTS.find(p => p.id === id)?.label).join(' + ')} Workout`
                    : 'Select muscles to start'}
                </span>
              </>
            )}
          </button>

          {selectedParts.length === 0 && (
            <p
              className="text-center text-xs -mt-4"
              style={{ color: '#555', fontFamily: 'Space Mono, monospace' }}
            >
              ↑ pick at least one muscle group
            </p>
          )}
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: '#444', fontFamily: 'Space Mono, monospace' }}
        >
          POWERED BY GOOGLE GEMINI · DATA STAYS LOCAL
        </p>
      </div>
    </div>
  );
}
