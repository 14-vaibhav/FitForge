/**
 * localStorage-based exercise history.
 * Works instantly with zero Firebase config.
 * Key: 'fitforge_exercise_history'  →  { [exerciseKey]: [log, log, ...] }
 */

const EXERCISE_HISTORY_KEY = 'fitforge_exercise_history';
const SESSIONS_KEY = 'fitforge_sessions'; // already used by App.jsx

/** Save one exercise log after it's completed. */
export function saveExerciseLog(exerciseName, exerciseKey, category, log, prescribed) {
  try {
    const all = JSON.parse(localStorage.getItem(EXERCISE_HISTORY_KEY) || '{}');
    if (!all[exerciseKey]) all[exerciseKey] = [];
    all[exerciseKey].unshift({
      exerciseName,
      category,
      log,
      prescribed,
      date: new Date().toISOString(),
    });
    // Keep last 10 entries per exercise
    if (all[exerciseKey].length > 10) all[exerciseKey].splice(10);
    localStorage.setItem(EXERCISE_HISTORY_KEY, JSON.stringify(all));
    console.log('[FitForge] Saved history for:', exerciseKey, log);
  } catch (e) {
    console.error('[FitForge] Failed to save exercise log:', e);
  }
}

/** Synchronously return the most recent log for an exercise (or null). */
export function getExerciseLastLog(exerciseKey) {
  try {
    const all = JSON.parse(localStorage.getItem(EXERCISE_HISTORY_KEY) || '{}');
    const logs = all[exerciseKey];
    if (!logs || logs.length === 0) {
      console.log('[FitForge] No history for:', exerciseKey);
      return null;
    }
    console.log('[FitForge] Found history for:', exerciseKey, logs[0]);
    return logs[0];
  } catch (e) {
    return null;
  }
}

/** Return last N completed sessions (already stored by App.jsx). */
export function getRecentSessions(count = 3) {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    return sessions.slice(0, count);
  } catch (e) {
    return [];
  }
}
