import { useState, useEffect } from 'react';
import { getExerciseLastLog } from '../utils/localHistory';
import { normalizeExerciseName } from '../utils/progression';

export function useExerciseHistory(exerciseName) {
  const [lastLog, setLastLog] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exerciseName) {
      setLastLog(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const key = normalizeExerciseName(exerciseName);
    
    // Read synchronously from local storage
    const log = getExerciseLastLog(key);
    setLastLog(log);
    setLoading(false);
  }, [exerciseName]);

  return { lastLog, loading };
}
