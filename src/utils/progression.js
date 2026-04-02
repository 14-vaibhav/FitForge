export function normalizeExerciseName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

export function parseWeight(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/(\d+\.?\d*)\s*(kg|lbs|lb)?/i);
  if (!match) return null;
  return { value: parseFloat(match[1]), unit: match[2]?.toLowerCase() || 'kg' };
}

export function parseReps(repsStr) {
  if (!repsStr) return null;
  const match = repsStr.match(/(\d+)-?(\d+)?/);
  if (!match) return null;
  return match[2] ? parseInt(match[2]) : parseInt(match[1]);
}

export function parseSets(setsStr) {
  if (!setsStr || setsStr === 'N/A') return null;
  const match = setsStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function generateSuggestion(lastLog, prescribed) {
  if (!lastLog) {
    return { type: 'no_history', message: null, suggestion: null };
  }

  if (lastLog.skipped || lastLog.log?.skipped) {
    return {
      type: 'was_skipped',
      lastPerformance: 'You skipped this last time.',
      suggestion: `Start with: ${prescribed.sets} × ${prescribed.reps}`,
      badge: '→ Fresh Start',
      badgeColor: '#888',
    };
  }

  const category = lastLog.category || 'Strength';

  if (category === 'Cardio') return generateCardioSuggestion(lastLog, prescribed);
  if (lastLog.log?.weight) return generateStrengthSuggestion(lastLog, prescribed);
  return generateBodyweightSuggestion(lastLog, prescribed);
}

function generateStrengthSuggestion(lastLog, prescribed) {
  const log = lastLog.log || lastLog; // Support nested or flat structure
  const prevWeight = parseWeight(log.weight);
  const prevReps = parseReps(log.repsPerSet);
  const prevSets = parseInt(log.setsCompleted) || 0;
  const prescribedSets = parseSets(prescribed.sets) || 3;
  const prescribedRepsUpper = parseReps(prescribed.reps) || 10;

  const completedAllSets = prevSets >= prescribedSets;
  const hitTopReps = prevReps >= prescribedRepsUpper;
  
  const formattedPerformance = `${log.setsCompleted || '?'} sets × ${log.repsPerSet || '?'} reps @ ${log.weight || 'unknown'}`;

  // If hit all sets and top reps, increase weight
  if (completedAllSets && hitTopReps && prevWeight) {
    const increment = prevWeight.unit === 'kg' ? 2.5 : 5;
    const newWeight = (prevWeight.value + increment).toFixed(1);
    return {
      type: 'increase_weight',
      lastPerformance: formattedPerformance,
      suggestion: `Try ${newWeight.replace(/\.0$/, '')} ${prevWeight.unit} for ${prescribed.reps}`,
      badge: '↑ Overload',
      badgeColor: '#4ade80',
    };
  }

  // If hit sets but not top reps, try more reps with same weight
  if (completedAllSets && !hitTopReps && prevWeight) {
    const newReps = (prevReps || 8) + 2;
    return {
      type: 'increase_reps',
      lastPerformance: formattedPerformance,
      suggestion: `Same weight (${log.weight}), aim for ${newReps} reps`,
      badge: '↑ Add Reps',
      badgeColor: '#60a5fa',
    };
  }

  // Didn't complete all sets, or unclear data -> maintain
  return {
    type: 'maintain',
    lastPerformance: formattedPerformance,
    suggestion: `Same as last time: ${log.weight || '?'} for ${prescribed.reps}`,
    badge: '→ Maintain',
    badgeColor: '#f59e0b',
  };
}

function generateBodyweightSuggestion(lastLog, prescribed) {
  const log = lastLog.log || lastLog;
  const prevReps = parseReps(log.repsPerSet);
  const prevSets = parseInt(log.setsCompleted) || 0;
  const prescribedSets = parseSets(prescribed.sets) || 3;
  const prescribedRepsUpper = parseReps(prescribed.reps) || 10;
  
  const formattedPerformance = prevSets && prevReps 
    ? `${log.setsCompleted} sets × ${log.repsPerSet} reps`
    : 'Partial data logged';

  if (!prevReps) {
    return {
      type: 'no_data',
      lastPerformance: formattedPerformance,
      suggestion: `Try: ${prescribed.sets} × ${prescribed.reps}`,
      badge: '→ Start Fresh',
      badgeColor: '#888',
    };
  }

  const completedAllSets = prevSets >= prescribedSets;
  const hitTopReps = prevReps >= prescribedRepsUpper;

  if (completedAllSets && hitTopReps) {
    return {
      type: 'increase_reps',
      lastPerformance: formattedPerformance,
      suggestion: `Aim for ${prevReps + 2} reps × ${prescribed.sets}`,
      badge: '↑ Push More',
      badgeColor: '#4ade80',
    };
  }

  return {
    type: 'maintain',
    lastPerformance: formattedPerformance,
    suggestion: `Repeat: ${prescribed.sets} × ${prevReps} reps`,
    badge: '→ Maintain',
    badgeColor: '#f59e0b',
  };
}

function generateCardioSuggestion(lastLog, prescribed) {
  const log = lastLog.log || lastLog;
  return {
    type: 'cardio',
    lastPerformance: [
      log.duration && `Time: ${log.duration}`,
      log.distance && `Dist: ${log.distance}`,
      log.heartRate && `Avg HR: ${log.heartRate} bpm`,
    ].filter(Boolean).join(' · ') || 'Logged',
    suggestion: log.duration
      ? `Try to beat: ${log.duration}`
      : `Complete the prescribed duration`,
    badge: '↑ Beat Time',
    badgeColor: '#f97316',
  };
}
