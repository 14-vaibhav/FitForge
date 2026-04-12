import { useState, useCallback } from 'react';
import WorkoutSetup from './components/WorkoutSetup';
import WorkoutSession from './components/WorkoutSession';
import WorkoutSummary from './components/WorkoutSummary';
import DietDashboard from './components/DietDashboard';
import { generateWorkout, replaceExercise, evaluateWorkout } from './services/gemini';
import AuthScreen from './components/AuthScreen';
import { useAuth } from './context/AuthContext';
import { saveWorkoutSession } from './services/workoutService';

// Screens
const SCREEN = {
  SETUP: 'setup',
  SESSION: 'session',
  SUMMARY: 'summary',
  DIET: 'diet',
};

// LocalStorage helpers
const STORAGE_KEY = 'fitforge_sessions';

function saveSession(session) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existing.unshift(session); // newest first
    if (existing.length > 20) existing.splice(20); // keep last 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [screen, setScreen] = useState(SCREEN.SETUP);
  const [workoutConfig, setWorkoutConfig] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [evaluation, setEvaluation] = useState('');

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  const handleSetupSubmit = useCallback(async (config) => {
    setError(null);
    setIsGenerating(true);
    try {
      const plan = await generateWorkout(config);
      setWorkoutConfig(config);
      setExercises(plan);
      setCompletedExercises([]);
      setEvaluation('');
      setScreen(SCREEN.SESSION);
    } catch (err) {
      console.error('Generation error:', err);
      setError(`Failed to generate workout: ${err.message}. Please check your API key and try again.`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleReplaceExercise = useCallback(async (index, exercise) => {
    setIsReplacing(true);
    try {
      const alreadyDone = exercises.map(e => e.name);
      const replacement = await replaceExercise({
        exercise,
        bodyParts: workoutConfig.bodyParts,
        location: workoutConfig.location,
        alreadyDone,
      });
      setExercises(prev => {
        const updated = [...prev];
        updated[index] = replacement;
        return updated;
      });
    } catch (err) {
      console.error('Replace error:', err);
      setError(`Couldn't find an alternative: ${err.message}`);
    } finally {
      setIsReplacing(false);
    }
  }, [exercises, workoutConfig]);

  const handleSessionComplete = useCallback(async (completed) => {
    setCompletedExercises(completed);
    setScreen(SCREEN.SUMMARY);
    setIsEvaluating(true);

    try {
      // Streaming: setEvaluation is called on every chunk so text appears live
      const result = await evaluateWorkout(
        { workoutConfig, completedExercises: completed },
        (partialText) => setEvaluation(partialText)
      );

      // Mark evaluation done
      setEvaluation(result);

      // Save to localStorage first (always works)
      saveSession({
        date: new Date().toISOString(),
        config: workoutConfig,
        exercises: completed,
        evaluation: result,
      });

      // Also save to Firestore (cloud backup) — await so errors surface clearly
      if (user) {
        try {
          await saveWorkoutSession(user.uid, workoutConfig, completed, result);
          console.log('[FitForge] Session saved to Firestore ✓');
        } catch (dbErr) {
          console.error('[FitForge] Firestore session save failed:', dbErr.message);
        }
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setEvaluation('Unable to generate evaluation at this time. Great job completing your workout!');
    } finally {
      setIsEvaluating(false);
    }
  }, [workoutConfig, user]);

  const handleStartNew = useCallback(() => {
    setScreen(SCREEN.SETUP);
    setExercises([]);
    setCompletedExercises([]);
    setEvaluation('');
    setWorkoutConfig(null);
    setError(null);
  }, []);

  if (authLoading) {
    return (
      <div className="bg-animated min-h-screen flex items-center justify-center p-4">
        <div className="spinner animate-pulse-glow" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {(screen === SCREEN.SETUP || screen === SCREEN.DIET) && (
          <button 
            onClick={() => setScreen(screen === SCREEN.DIET ? SCREEN.SETUP : SCREEN.DIET)}
            className="text-xs px-3 py-1.5 rounded-full bg-[#4285F4]/20 text-[#4285F4] hover:bg-[#4285F4]/40 transition-colors border border-[#4285F4]/50"
          >
            {screen === SCREEN.DIET ? '🏋️ Workout Planner' : '🍎 Diet Dashboard'}
          </button>
        )}
        <button 
          onClick={() => {
            handleStartNew();
            logout();
          }}
          className="text-xs px-3 py-1.5 rounded-full bg-red-900/40 text-red-100 hover:bg-red-800/60 transition-colors border border-red-800"
        >
          Sign Out
        </button>
      </div>

      {/* Global error toast */}
      {error && (
        <div
          className="fixed top-4 left-1/2 z-50 animate-fade-in"
          style={{
            transform: 'translateX(-50%)',
            background: '#1a1a1a',
            border: '1px solid #3a3a3a',
            borderRadius: 12,
            padding: '12px 20px',
            maxWidth: '90vw',
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: '#888', fontSize: 14 }}>⚠</span>
            <span style={{ color: '#c0c0c0', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ color: '#666', marginLeft: 8, fontWeight: 700, fontSize: 14 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {screen === SCREEN.SETUP && (
        <WorkoutSetup
          onSubmit={handleSetupSubmit}
          isLoading={isGenerating}
        />
      )}
      
      {screen === SCREEN.DIET && (
        <DietDashboard />
      )}

      {screen === SCREEN.SESSION && exercises.length > 0 && (
        <WorkoutSession
          exercises={exercises}
          workoutConfig={workoutConfig}
          onComplete={handleSessionComplete}
          onReplaceExercise={handleReplaceExercise}
          isReplacing={isReplacing}
        />
      )}

      {screen === SCREEN.SUMMARY && (
        <WorkoutSummary
          completedExercises={completedExercises}
          workoutConfig={workoutConfig}
          evaluation={evaluation}
          isEvaluating={isEvaluating}
          onStartNew={handleStartNew}
          onViewDiet={() => setScreen(SCREEN.DIET)}
        />
      )}
    </>
  );
}
